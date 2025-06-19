import {supabase} from '@/utils/supabase/client';
import { Sector } from '@/app/types'

export const SectorRepository = {
  async getAll(): Promise<Sector[]> {
    const { data, error } = await supabase.from('sectors').select('*')
    if (error) throw error
    return data || []
  },

  async add(sector: Sector) {
    const { error } = await supabase.from('sectors').insert([sector])
    if (error) throw error
  },

  async update(id: string, sector: Partial<Sector>) {
    const { error } = await supabase.from('sectors').update(sector).eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('sectors').delete().eq('id', id)
    if (error) throw error
  },

  async findById(id: string): Promise<Sector | null> {
    const { data, error } = await supabase.from('sectors').select('*').eq('id', id).single()
    if (error) return null
    return data
  }
}