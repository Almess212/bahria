import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
// Pour le développement, vous pouvez créer un projet gratuit sur https://supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profils utilisateurs disponibles
export const USER_ROLES = {
  ADMIN: 'admin',
  FISHERMAN: 'fisherman',
  FACTORY: 'factory',
  SCIENTIST: 'scientist',
};

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['dashboard', 'analysis', 'map', 'assistant', 'logbook', 'cam', 'users'],
  [USER_ROLES.FISHERMAN]: ['dashboard', 'analysis', 'map', 'assistant', 'logbook'],
  [USER_ROLES.FACTORY]: ['dashboard', 'cam', 'logbook'],
  [USER_ROLES.SCIENTIST]: ['dashboard', 'analysis', 'map', 'data'],
};
