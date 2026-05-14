import { create } from 'zustand';
import api from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ user: User; requires_role_selection: boolean; roles: string[] }>;
  logout: () => void;
  setActiveRole: (role: string) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token, user, requires_role_selection, roles } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
      return { user, requires_role_selection, roles };
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      const error = axiosError.response?.data?.error || 'Erreur de connexion';
      set({ error, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  setActiveRole: (role: string) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, role } : null;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },
}));

export default useAuthStore;
