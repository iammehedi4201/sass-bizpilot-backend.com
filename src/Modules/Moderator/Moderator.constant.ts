export const moderatorLevels = {
  SuperAdmin: "superAdmin",
  Admin: "admin",
  Moderator: "moderator",
} as const;

export const ModeratorLevels = Object.values(moderatorLevels);

export type TModeratorLevel =
  (typeof moderatorLevels)[keyof typeof moderatorLevels];
