import { Types } from "mongoose";
import { TCashFlowType, TCurrency, TOrgMemberLevel } from "./Organization.constant";

// ── Organization ─────────────────────────────────────────────────────────────
export interface IOrganization {
  name: string;
  createdBy: Types.ObjectId;
  logo: string;
  isActive: boolean;
  currency: TCurrency;
}

// ── Organization Member ──────────────────────────────────────────────────────
export interface IOrganizationMember {
  bizpilotUser: Types.ObjectId;
  organization: Types.ObjectId;
  isActive: boolean;
  level: TOrgMemberLevel;
  isRegistered: boolean;
}

// ── Preset Seed Interfaces (read-only seed data) ─────────────────────────────
export interface IPresetCashFlowPreset {
  type: TCashFlowType;
  name: string;
  image?: string;
  amount: number;
  isActive: boolean;
}

export interface IPresetCashFlowPresetGroup {
  name: string;
  type: TCashFlowType;
  isActive: boolean;
}

export interface IPresetCashFlowPresetGroupPreset {
  cbCashFlowPreset: Types.ObjectId;
  cbCashFlowPresetGroup: Types.ObjectId;
  isActive: boolean;
}

export interface IPresetTransactionCategory {
  name: string;
  description: string;
}

export interface IPresetTransactionSubcategory {
  transactionCategory: Types.ObjectId;
  name: string;
  description: string;
}

// ── Org-Specific Operational Interfaces ──────────────────────────────────────
export interface ICbCashFlowPreset {
  organization: Types.ObjectId;
  type: TCashFlowType;
  name: string;
  image?: string;
  amount: number;
  isActive: boolean;
}

export interface ICbCashFlowPresetGroup {
  organization: Types.ObjectId;
  name: string;
  type: TCashFlowType;
  isActive: boolean;
}

export interface ICbCashFlowPresetGroupPreset {
  organization: Types.ObjectId;
  cbCashFlowPreset: Types.ObjectId;
  cbCashFlowPresetGroup: Types.ObjectId;
  isActive: boolean;
}

export interface ITransactionCategory {
  organization: Types.ObjectId;
  name: string;
  description: string;
}

export interface ITransactionSubcategory {
  organization: Types.ObjectId;
  transactionCategory: Types.ObjectId;
  name: string;
  description: string;
}
