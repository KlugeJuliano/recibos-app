import {supabase} from '@/utils/supabase/client';
import { Loja } from '@/app/types'

export const StoreRepository = {
  async getAll(): Promise<Loja[]> {
    const { data, error } = await supabase.from('stores').select('*')
    if (error) throw error
    return data || []
  },

  async add(store: Loja) {
    const { error } = await supabase.from('stores').insert([store])
    if (error) throw error
  },

  async update(id: string, store: Partial<Loja>) {
    const { error } = await supabase.from('stores').update(store).eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('stores').delete().eq('id', id)
    if (error) throw error
  },

  async findById(id: string): Promise<Loja | null> {
    const { data, error } = await supabase.from('stores').select('*').eq('id', id).single()
    if (error) return null
    return data
  },

  async findByCompanyId(companyId: string): Promise<Loja[]> {
    const { data, error } = await supabase.from('stores').select('*').eq('companyId', companyId)
    if (error) throw error
    return data || []
  }
}
