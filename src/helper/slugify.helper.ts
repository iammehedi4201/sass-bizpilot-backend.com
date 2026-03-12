/**
 * Slugify Helper
 * Utility functions for generating URL-friendly slugs
 */

/**
 * Generate a slug from a string
 * @param text - The text to convert to slug
 * @returns URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

/**
 * Generate a unique slug by appending a number if slug already exists
 * @param baseSlug - The base slug to make unique
 * @param existingSlugCheck - Async function to check if slug exists
 * @returns Unique slug
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  existingSlugCheck: (slug: string) => Promise<boolean>,
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (await existingSlugCheck(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Reserved slugs that cannot be used
 */
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "auth",
  "login",
  "signup",
  "register",
  "dashboard",
  "settings",
  "profile",
  "account",
  "help",
  "support",
  "terms",
  "privacy",
  "about",
  "contact",
];

/**
 * Check if a slug is reserved
 * @param slug - The slug to check
 * @returns True if slug is reserved
 */
export const isReservedSlug = (slug: string): boolean => {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
};
