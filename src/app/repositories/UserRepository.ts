
import { type SupabaseClient } from '@supabase/supabase-js';
import { Users } from '@/app/types';

// The Supabase client is now passed as an argument to each function
// This makes the repository reusable in different contexts (client/server)

export const UserRepository = {
  async getAll(supabase: SupabaseClient): Promise<Users[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  },

  async add(supabase: SupabaseClient, user: Users) {
    const payload = {
      ...user,
      id: user.id || crypto.randomUUID(),
    };
    const { error } = await supabase.from('users').insert([payload]);
    if (error) throw error;
  },

  async update(supabase: SupabaseClient, id: string, user: Partial<Users>) {
    const { error } = await supabase.from('users').update(user).eq('id', id);
    if (error) throw error;
  },

  async delete(supabase: SupabaseClient, id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  async findByEmail(supabase: SupabaseClient, email: string): Promise<Users | null> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
    return data;
  },

  async findById(supabase: SupabaseClient, id: string): Promise<Users | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) {
      console.error('Error finding user by id:', error);
      return null;
    }
    return data;
  }
};
