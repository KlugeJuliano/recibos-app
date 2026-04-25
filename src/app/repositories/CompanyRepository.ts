
import { type SupabaseClient } from '@supabase/supabase-js';
import { Company } from '@/app/types';

export const CompanyRepository = {
  async getAll(supabase: SupabaseClient): Promise<Company[]> {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) throw error;
    return data || [];
  },

  async add(supabase: SupabaseClient, company: Company) {
    const payload = {
      ...company,
      id: company.id || crypto.randomUUID(),
    };
    const { error } = await supabase.from('companies').insert([payload]);
    if (error) throw error;
  },

  async update(supabase: SupabaseClient, id: string, company: Partial<Company>) {
    const { error } = await supabase.from('companies').update(company).eq('id', id);
    if (error) throw error;
  },

  async delete(supabase: SupabaseClient, id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw error;
  },

  async findById(supabase: SupabaseClient, id: string): Promise<Company | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) {
      console.error('Error finding company by id:', error);
      return null;
    }
    return data;
  }
};
