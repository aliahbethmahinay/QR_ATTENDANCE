import { supabase } from './supabase';

export type Role = 'student' | 'teacher';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
};

/**
 * Get the profile of a user.
 */
export async function getProfile(
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.log('getProfile error:', error);
    return null;
  }

  return data as Profile | null;
}

/**
 * Update the user's profile.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('id, email, full_name, role')
    .single();

  if (error) {
    console.log('updateProfile error:', error);

    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Profile,
    error: null,
  };
}