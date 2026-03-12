import { model, Schema } from "mongoose";
import {
  IPresetCashFlowPreset,
  IPresetCashFlowPresetGroup,
  IPresetCashFlowPresetGroupPreset,
  IPresetTransactionCategory,
  IPresetTransactionSubcategory,
} from "./Organization.interface";

// ── PresetCashFlowPreset ─────────────────────────────────────────────────────
const PresetCashFlowPresetSchema = new Schema<IPresetCashFlowPreset>(
  {
    type: { type: String, enum: ["in", "out"], required: true },
    name: { type: String, required: true },
    image: { type: String },
    amount: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

export const PresetCashFlowPreset = model<IPresetCashFlowPreset>(
  "PresetCashFlowPreset",
  PresetCashFlowPresetSchema,
);

// ── PresetCashFlowPresetGroup ────────────────────────────────────────────────
const PresetCashFlowPresetGroupSchema =
  new Schema<IPresetCashFlowPresetGroup>(
    {
      name: { type: String, required: true },
      type: { type: String, enum: ["in", "out"], required: true },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false },
  );

export const PresetCashFlowPresetGroup = model<IPresetCashFlowPresetGroup>(
  "PresetCashFlowPresetGroup",
  PresetCashFlowPresetGroupSchema,
);

// ── PresetCashFlowPresetGroupPreset (join table) ─────────────────────────────
const PresetCashFlowPresetGroupPresetSchema =
  new Schema<IPresetCashFlowPresetGroupPreset>(
    {
      cbCashFlowPreset: {
        type: Schema.Types.ObjectId,
        ref: "PresetCashFlowPreset",
        required: true,
      },
      cbCashFlowPresetGroup: {
        type: Schema.Types.ObjectId,
        ref: "PresetCashFlowPresetGroup",
        required: true,
      },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false },
  );

export const PresetCashFlowPresetGroupPreset =
  model<IPresetCashFlowPresetGroupPreset>(
    "PresetCashFlowPresetGroupPreset",
    PresetCashFlowPresetGroupPresetSchema,
  );

// ── PresetTransactionCategory ────────────────────────────────────────────────
const PresetTransactionCategorySchema =
  new Schema<IPresetTransactionCategory>(
    {
      name: { type: String, required: true },
      description: { type: String, default: "" },
    },
    { timestamps: true, versionKey: false },
  );

export const PresetTransactionCategory = model<IPresetTransactionCategory>(
  "PresetTransactionCategory",
  PresetTransactionCategorySchema,
);

// ── PresetTransactionSubcategory ─────────────────────────────────────────────
const PresetTransactionSubcategorySchema =
  new Schema<IPresetTransactionSubcategory>(
    {
      transactionCategory: {
        type: Schema.Types.ObjectId,
        ref: "PresetTransactionCategory",
        required: true,
      },
      name: { type: String, required: true },
      description: { type: String, default: "" },
    },
    { timestamps: true, versionKey: false },
  );

export const PresetTransactionSubcategory =
  model<IPresetTransactionSubcategory>(
    "PresetTransactionSubcategory",
    PresetTransactionSubcategorySchema,
  );
