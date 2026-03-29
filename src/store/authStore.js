import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, USER_ROLES } from '../config/supabase';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      // Initialiser la session depuis Supabase
      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            set({
              user: session.user,
              session,
              role: profile?.role || USER_ROLES.FISHERMAN,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('Erreur initialisation auth:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Connexion
      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          set({
            user: data.user,
            session: data.session,
            role: profile?.role || USER_ROLES.FISHERMAN,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Inscription
      signUp: async (email, password, role = USER_ROLES.FISHERMAN) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          // Créer le profil utilisateur
          await supabase.from('profiles').insert({
            id: data.user.id,
            email,
            role,
          });

          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Déconnexion
      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          role: null,
          isAuthenticated: false,
        });
      },

      // Mode démo (sans Supabase)
      signInDemo: (role = USER_ROLES.FISHERMAN) => {
        set({
          user: {
            id: 'demo',
            email: 'demo@bahria.ma',
          },
          role,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'bahria-auth',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
