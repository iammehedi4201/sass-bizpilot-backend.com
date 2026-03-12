import { model, Schema } from "mongoose";
import {
  ICbCashFlowPreset,
  ICbCashFlowPresetGroup,
  ICbCashFlowPresetGroupPreset,
  ITransactionCategory,
  ITransactionSubcategory,
} from "./Organization.interface";

// ── CbCashFlowPreset (org-specific) ─────────────────────────────────────────
const CbCashFlowPresetSchema = new Schema<ICbCashFlowPreset>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    type: { type: String, enum: ["in", "out"], required: true },
    name: { type: String, required: true },
    image: { type: String },
    amount: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

export const CbCashFlowPreset = model<ICbCashFlowPreset>(
  "CbCashFlowPreset",
  CbCashFlowPresetSchema,
);

// ── CbCashFlowPresetGroup (org-specific) ─────────────────────────────────────
const CbCashFlowPresetGroupSchema = new Schema<ICbCashFlowPresetGroup>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, enum: ["in", "out"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

export const CbCashFlowPresetGroup = model<ICbCashFlowPresetGroup>(
  "CbCashFlowPresetGroup",
  CbCashFlowPresetGroupSchema,
);

// ── CbCashFlowPresetGroupPreset (org-specific join) ──────────────────────────
const CbCashFlowPresetGroupPresetSchema =
  new Schema<ICbCashFlowPresetGroupPreset>(
    {
      organization: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
      },
      cbCashFlowPreset: {
        type: Schema.Types.ObjectId,
        ref: "CbCashFlowPreset",
        required: true,
      },
      cbCashFlowPresetGroup: {
        type: Schema.Types.ObjectId,
        ref: "CbCashFlowPresetGroup",
        required: true,
      },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false },
  );

export const CbCashFlowPresetGroupPreset =
  model<ICbCashFlowPresetGroupPreset>(
    "CbCashFlowPresetGroupPreset",
    CbCashFlowPresetGroupPresetSchema,
  );

// ── TransactionCategory (org-specific) ───────────────────────────────────────
const TransactionCategorySchema = new Schema<ITransactionCategory>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

export const TransactionCategory = model<ITransactionCategory>(
  "TransactionCategory",
  TransactionCategorySchema,
);

// ── TransactionSubcategory (org-specific) ────────────────────────────────────
const TransactionSubcategorySchema = new Schema<ITransactionSubcategory>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    transactionCategory: {
      type: Schema.Types.ObjectId,
      ref: "TransactionCategory",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false },
);

export const TransactionSubcategory = model<ITransactionSubcategory>(
  "TransactionSubcategory",
  TransactionSubcategorySchema,
);
