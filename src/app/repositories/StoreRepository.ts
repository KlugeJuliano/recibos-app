import { type SupabaseClient } from '@supabase/supabase-js';
import { Loja } from '@/app/types';

export function toStorePayload(store: Partial<Loja>) {
  return {
    ...(store.id ? { id: store.id } : {}),
    ...(store.loja !== undefined ? { loja: store.loja } : {}),
    ...(store.cnpj !== undefined ? { cnpj: store.cnpj } : {}),
    ...(store.companyId !== undefined ? { company_id: store.companyId || null } : {}),
    ...(store.address !== undefined ? { address: store.address } : {}),
    ...(store.phone !== undefined ? { phone: store.phone } : {}),
    ...(store.sectors !== undefined ? { sectors: store.sectors } : {}),
  };
}

export const StoreRepository = {
  async getAll(supabase: SupabaseClient): Promise<Loja[]> {
    const { data, error } = await supabase.from('stores').select('*');
    if (error) throw error;
    return data || [];
  },

  async add(supabase: SupabaseClient, store: Loja) {
    const { companyId, ...rest } = store as any;
    const payload = {
      ...rest,
      id: store.id || crypto.randomUUID(),
      company_id: companyId ?? (store as any).company_id,
    };
    const { error } = await supabase.from('stores').insert([payload]);
    if (error) throw error;
  },

  async update(supabase: SupabaseClient, id: string, store: Partial<Loja>) {
    const { companyId, ...rest } = store as any;
    const payload = {
      ...toStorePayload(rest),
      ...(companyId !== undefined ? { company_id: companyId } : {}),
    };
    const { error } = await supabase.from('stores').update(payload).eq('id', id);
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
    const { data, error } = await supabase.from('stores').select('*').eq('company_id', companyId);
    if (error) throw error;
    return data || [];
  },

  async countRecibosByStore(supabase: SupabaseClient, lojaId: string): Promise<number> {
    const { count, error } = await supabase
      .from('recibos')
      .select('*', { count: 'exact', head: true })
      .eq('loja_id', lojaId);
    if (error) throw error;
    return count ?? 0;
  }
};
