// Simple admin auth using localStorage. The admin password and the
// separate "clear sales" password are stored here so they can be changed
// in one place. In a real deployment these would live in a backend.
export const ADMIN_PASSWORD = 'smashdaddy2026';
export const CLEAR_SALES_PASSWORD = 'clearsales2026';

const SESSION_KEY = 'smash_admin_session';

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(SESSION_KEY) === 'true';
}

export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  localStorage.removeItem(SESSION_KEY);
}
