export const currencies = {
  USD: "USD",
  BDT: "BDT",
} as const;

export const CurrencyValues = Object.values(currencies);
export type TCurrency = (typeof currencies)[keyof typeof currencies];

export const cashFlowTypes = { In: "in", Out: "out" } as const;
export type TCashFlowType =
  (typeof cashFlowTypes)[keyof typeof cashFlowTypes];

export const orgMemberLevels = {
  SuperAdmin: "superAdmin",
  Admin: "admin",
  Member: "member",
} as const;

export const OrgMemberLevels = Object.values(orgMemberLevels);
export type TOrgMemberLevel =
  (typeof orgMemberLevels)[keyof typeof orgMemberLevels];
