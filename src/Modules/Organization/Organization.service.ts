import { AppError } from "@/helper/errorHelper/appError";
import {
  deleteObject,
  updateObject,
  uploadObject,
} from "@/lib/storage/spaces";
import { performDBTransaction } from "@/Utils/performDBTransaction";
import httpStatus from "http-status";
import { ClientSession, Types } from "mongoose";
import { IModeratorJwtPayload } from "../Moderator/Moderator.interface";
import { TCurrency } from "./Organization.constant";
import {
  CbCashFlowPreset,
  CbCashFlowPresetGroup,
  CbCashFlowPresetGroupPreset,
  TransactionCategory,
  TransactionSubcategory,
} from "./Organization.orgModels";
import {
  PresetCashFlowPreset,
  PresetCashFlowPresetGroup,
  PresetCashFlowPresetGroupPreset,
  PresetTransactionCategory,
  PresetTransactionSubcategory,
} from "./Organization.presets";
import { Organization } from "./Organization.model";
import { OrganizationMember } from "./OrganizationMember.model";

// ── Types ─────────────────────────────────────────────────────────────────────
type LeanDoc = {
  _id: Types.ObjectId;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
} & Record<string, unknown>;

type CreateOneFn = (
  data: Record<string, unknown>,
  session: ClientSession,
) => Promise<{ _id: Types.ObjectId }>;

type InsertManyFn = (
  docs: Record<string, unknown>[],
  session: ClientSession,
) => Promise<unknown>;

// ── strip Mongoose metadata from a lean document ─────────────────────────────
const stripMeta = (doc: LeanDoc): Record<string, unknown> => {
  const { _id: _a, __v: _b, createdAt: _c, updatedAt: _d, ...rest } = doc;
  void _a;
  void _b;
  void _c;
  void _d;
  return rest;
};

// ── seed preset records and wire up related documents ────────────────────────
const seedPresetsWithReferences = async (
  presetDocs: LeanDoc[],
  createOne: CreateOneFn,
  relatedDocs: LeanDoc[],
  refField: string,
  insertMany: InsertManyFn,
  orgId: Types.ObjectId,
  session: ClientSession,
): Promise<void> => {
  await Promise.all(
    presetDocs.map(async (preset) => {
      const newRecord = await createOne(
        { ...stripMeta(preset), organization: orgId },
        session,
      );

      const related = relatedDocs
        .filter((r) => r[refField]?.toString() === preset._id.toString())
        .map((r) => ({
          ...stripMeta(r),
          organization: orgId,
          [refField]: newRecord._id,
        }));

      if (related.length > 0) {
        await insertMany(related, session);
      }
    }),
  );
};

// ── Create Organization ──────────────────────────────────────────────────────
const createOrganization = async (
  name: string,
  currency: TCurrency = "BDT",
  file: Express.Multer.File,
  moderator: IModeratorJwtPayload,
) => {
  const logoKey = `bizpilot/organization/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

  // Upload logo to S3 before the DB transaction (S3 is not transactional).
  await uploadObject(logoKey, file.buffer, file.mimetype);

  try {
    const organization = await performDBTransaction(async (session) => {
      const [org] = await Organization.create(
        [{ name, logo: logoKey, createdBy: moderator.id, currency }],
        { session },
      );

      // Fetch seed data (read-only, no locks needed).
      const [
        cashFlowPresets,
        cashflowPresetGroups,
        cashflowPresetGroupPresets,
        transactionCategoryPresets,
        transactionSubcategoryPresets,
      ] = await Promise.all([
        PresetCashFlowPreset.find().lean() as Promise<LeanDoc[]>,
        PresetCashFlowPresetGroup.find().lean() as Promise<LeanDoc[]>,
        PresetCashFlowPresetGroupPreset.find().lean() as Promise<LeanDoc[]>,
        PresetTransactionCategory.find().lean() as Promise<LeanDoc[]>,
        PresetTransactionSubcategory.find().lean() as Promise<LeanDoc[]>,
      ]);

      // 1. Seed transaction categories → subcategories.
      await seedPresetsWithReferences(
        transactionCategoryPresets,
        (data, s) =>
          TransactionCategory.create([data], { session: s }).then(([r]) => r),
        transactionSubcategoryPresets,
        "transactionCategory",
        (docs, s) => TransactionSubcategory.insertMany(docs, { session: s }),
        org._id,
        session,
      );

      // 2. Seed cash flow presets → group-preset join records.
      await seedPresetsWithReferences(
        cashFlowPresets,
        (data, s) =>
          CbCashFlowPreset.create([data], { session: s }).then(([r]) => r),
        cashflowPresetGroupPresets,
        "cbCashFlowPreset",
        (docs, s) =>
          CbCashFlowPresetGroupPreset.insertMany(docs, { session: s }),
        org._id,
        session,
      );

      // 3. Seed cash flow preset groups → group-preset join records.
      await seedPresetsWithReferences(
        cashflowPresetGroups,
        (data, s) =>
          CbCashFlowPresetGroup.create([data], { session: s }).then(
            ([r]) => r,
          ),
        cashflowPresetGroupPresets,
        "cbCashFlowPresetGroup",
        (docs, s) =>
          CbCashFlowPresetGroupPreset.insertMany(docs, { session: s }),
        org._id,
        session,
      );

      return org;
    });

    return organization;
  } catch (err) {
    // Best-effort S3 cleanup on DB failure.
    deleteObject(logoKey).catch(() => undefined);
    throw err;
  }
};

// ── Get All Organizations ────────────────────────────────────────────────────
const getAllOrganizations = async (filter?: string, search?: string) => {
  const query: Record<string, unknown> = {};

  if (filter === "active") query.isActive = true;
  else if (filter === "archived") query.isActive = false;

  if (search) query.name = { $regex: new RegExp(search, "i") };

  return Organization.find(query)
    .sort({ name: 1 })
    .collation({ locale: "en", strength: 2 });
};

// ── Get Single Organization ──────────────────────────────────────────────────
const getSingleOrganization = async (id: string) => {
  const org = await Organization.findById(id);
  if (!org) throw new AppError("Organization not found", httpStatus.NOT_FOUND);
  return org;
};

// ── Update Organization ──────────────────────────────────────────────────────
const updateOrganization = async (
  id: string,
  updateData: Record<string, unknown>,
  file?: Express.Multer.File,
) => {
  const org = await Organization.findById(id);
  if (!org) throw new AppError("Organization not found", httpStatus.NOT_FOUND);
  if (!org.isActive)
    throw new AppError("Organization is not active", httpStatus.BAD_REQUEST);

  if (file) {
    const newKey = `bizpilot/organization/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    await updateObject(newKey, file.buffer, org.logo, file.mimetype);
    updateData.logo = newKey;
  }

  return Organization.findByIdAndUpdate(id, updateData, { new: true });
};

// ── Archive / Unarchive Organization ─────────────────────────────────────────
const archiveOrganization = async (id: string, isActive: boolean) => {
  const org = await Organization.findById(id);
  if (!org) throw new AppError("Organization not found", httpStatus.NOT_FOUND);

  await Organization.findByIdAndUpdate(id, { isActive });
  await OrganizationMember.updateMany({ organization: id }, { isActive });

  return Organization.findById(id);
};

export const OrganizationService = {
  createOrganization,
  getAllOrganizations,
  getSingleOrganization,
  updateOrganization,
  archiveOrganization,
};
