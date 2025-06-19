import {supabase} from '@/utils/supabase/client';

import { Company } from '@/app/types'

export const CompanyRepository = {
  async getAll(): Promise<Company[]> {
    const { data, error } = await supabase.from('companies').select('*')
    if (error) throw error
    return data || []
  },

  async add(company: Company) {
    const { error } = await supabase.from('companies').insert([company])
    if (error) throw error
  },

  async update(id: string, company: Partial<Company>) {
    const { error } = await supabase.from('companies').update(company).eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) throw error
  },

  async findById(id: string): Promise<Company | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single()
    if (error) return null
    return data
  }
}