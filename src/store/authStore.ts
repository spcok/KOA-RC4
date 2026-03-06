import { create } from 'zustand';
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { db } from '../lib/db';
import { mutateOnlineFirst } from '../lib/syncEngine';

interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  currentUser: User | null; // Kept for compatibility with existing components
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  currentUser: null,
  isLoading: true,

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  initialize: async () => {
    set({ isLoading: true });
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      await syncUserRole(session.user, set);
    } else {
      set({ session: null, user: null, currentUser: null, isLoading: false });
    }

    // Listen for changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await syncUserRole(session.user, set);
      } else {
        set({ session: null, user: null, currentUser: null, isLoading: false });
      }
    });
  },
}));

async function syncUserRole(supabaseUser: SupabaseUser, set: (state: Partial<AuthState>) => void) {
  if (!supabaseUser.email) {
    set({ session: null, user: null, currentUser: null, isLoading: false });
    return;
  }

  try {
    // 1. Check if user exists in Dexie
    let localUser = await db.users.where('email').equals(supabaseUser.email).first();

    if (localUser) {
      // Update local user ID if it doesn't match Supabase (e.g. if created manually via email)
      if (localUser.id !== supabaseUser.id) {
        const oldId = localUser.id;
        const updatedUser = { ...localUser, id: supabaseUser.id };
        
        await mutateOnlineFirst('users', updatedUser, 'upsert');
        await mutateOnlineFirst('users', { id: oldId }, 'delete');
        
        localUser = updatedUser;
      }
      
      set({ 
        session: (await supabase.auth.getSession()).data.session, 
        user: supabaseUser, 
        currentUser: localUser, 
        isLoading: false 
      });
    } else {
      // 2. If localUser does NOT exist, check total user count
      const count = await db.users.count();

      if (count === 0) {
        // 3. The First Admin Rule: Auto-create as OWNER
        const newUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || 'System Admin',
          role: UserRole.OWNER,
          initials: supabaseUser.user_metadata?.initials || 'SA',
          job_position: 'Administrator'
        };
        await mutateOnlineFirst('users', newUser, 'upsert');
        set({ 
          session: (await supabase.auth.getSession()).data.session, 
          user: supabaseUser, 
          currentUser: newUser, 
          isLoading: false 
        });
      } else {
        // 4. Unauthorized user (Supabase account exists but not in local whitelist)
        console.warn('Unauthorized access attempt:', supabaseUser.email);
        await supabase.auth.signOut();
        set({ session: null, user: null, currentUser: null, isLoading: false });
      }
    }
  } catch (error) {
    console.error('Error syncing user role:', error);
    set({ isLoading: false });
  }
}
