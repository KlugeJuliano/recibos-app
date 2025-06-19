import {supabase} from '@/utils/supabase/client';
import { Users } from '@/app/types'

export const UserRepository = {
  async getAll(): Promise<Users[]> {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data || []
  },

  async add(user: Users) {
    const { error } = await supabase.from('users').insert([user])
    if (error) throw error
  },

  async update(id: string, user: Partial<Users>) {
    const { error } = await supabase.from('users').update(user).eq('id', id)
    if (error) throw error
  },

  async delete(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  },

  async findByEmail(email: string): Promise<Users | null> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single()
    if (error) return null
    return data
  },

  async findById(id: string): Promise<Users | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error) return null
    return data
  }
}