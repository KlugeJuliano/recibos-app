
import { type SupabaseClient } from '@supabase/supabase-js';
import { Sector } from '@/app/types';

export const SectorRepository = {
  async getAll(supabase: SupabaseClient): Promise<Sector[]> {
    const { data, error } = await supabase.from('sectors').select('*');
    if (error) throw error;
    return data || [];
  },

  async add(supabase: SupabaseClient, sector: Sector) {
    const payload = {
      ...sector,
      id: sector.id || crypto.randomUUID(),
    };
    const { error } = await supabase.from('sectors').insert([payload]);
    if (error) throw error;
  },

  async update(supabase: SupabaseClient, id: string, sector: Partial<Sector>) {
    const { error } = await supabase.from('sectors').update(sector).eq('id', id);
    if (error) throw error;
  },

  async delete(supabase: SupabaseClient, id: string) {
    const { error } = await supabase.from('sectors').delete().eq('id', id);
    if (error) throw error;
  },

  async findById(supabase: SupabaseClient, id: string): Promise<Sector | null> {
    const { data, error } = await supabase.from('sectors').select('*').eq('id', id).single();
    if (error) {
      console.error('Error finding sector by id:', error);
      return null;
    }
    return data;
  }
};
