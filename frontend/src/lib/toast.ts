// Simple toast utility
export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      alert(`✅ ${message}`);
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      alert(`❌ ${message}`);
    }
  },
  info: (message: string) => {
    if (typeof window !== 'undefined') {
      alert(`ℹ️ ${message}`);
    }
  },
};