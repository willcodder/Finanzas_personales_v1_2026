import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  setSession: (session: Session | null) => void;
  setAuthLoading: (v: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  authLoading: true,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setAuthLoading: (v) => set({ authLoading: v }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
