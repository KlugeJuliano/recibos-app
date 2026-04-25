import { type SupabaseClient } from '@supabase/supabase-js';
import { Loja } from '@/app/types';

export const StoreRepository = {
  async getAll(supabase: SupabaseClient): Promise<Loja[]> {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) throw error;
    return data || [];
  },

  async add(supabase: SupabaseClient, store: Loja) {
    const payload = {
      ...store,
      id: store.id || crypto.randomUUID(),
    };
    const { error } = await supabase.from('stores').insert([payload]);
    if (error) throw error;
  },

  async update(supabase: SupabaseClient, id: string, store: Partial<Loja>) {
    const { error } = await supabase.from('stores').update(store).eq('id', id);
    if (error) throw error;
  },

  async delete(supabase: SupabaseClient, id: string) {
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) throw error;
  },

  async findById(supabase: SupabaseClient, id: string): Promise<Loja | null> {
    const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
    if (error) {
      console.error('Error finding store by id:', error);
      return null;
    }
    return data;
  },

  async findByCompanyId(supabase: SupabaseClient, companyId: string): Promise<Loja[]> {
    const { data, error } = await supabase.from('stores').select('*').eq('companyId', companyId);
    if (error) throw error;
    return data || [];
  }
};
