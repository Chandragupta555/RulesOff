export const OWNER_ADMIN_EMAIL = 'aadityasiddham555@gmail.com';

/**
 * Check if an email is the permanent hardcoded Owner Admin email.
 */
export const isOwnerAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();
};

/**
 * Synchronous check if an email matches the permanent Owner Admin OR is present in the dynamic admins list.
 */
export const isAdminEmail = (email?: string, dynamicAdminEmails: string[] = []): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean === OWNER_ADMIN_EMAIL.toLowerCase()) return true;
  return dynamicAdminEmails.some((a) => a.trim().toLowerCase() === clean);
};
