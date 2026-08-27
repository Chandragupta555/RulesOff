export const ADMIN_EMAIL = 'aadityagarg.bt24meta@pec.edu.in';

export const isAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
};
