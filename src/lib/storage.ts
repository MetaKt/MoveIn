/** localStorage that never throws (private mode, quota exceeded). */
export const safeLocalStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      console.warn("MoveIn demo: could not save to browser storage", e);
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};
