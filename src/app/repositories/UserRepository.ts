
import { type SupabaseClient } from '@supabase/supabase-js';
import { Users } from '@/app/types';

type UserRow = {
  id: string;
  email?: string | null;
  loja_id?: string | null;
  lojaId?: string | null;
  name?: string | null;
  role?: string | null;
  company_id?: string | null;
  companyId?: string | null;
};

function toUser(row: UserRow): Users {
  return {
    id: row.id,
    email: row.email ?? '',
    lojaId: row.loja_id ?? row.lojaId ?? '',
    name: row.name ?? 'Usuário',
    role: row.role ?? 'funcionario',
    companyId: row.company_id ?? row.companyId ?? '',
  };
}

function toUserPayload(user: Users | Partial<Users>) {
  return {
    ...(user.id ? { id: user.id } : {}),
    ...(user.email !== undefined ? { email: user.email } : {}),
    ...(user.lojaId !== undefined ? { loja_id: user.lojaId || null } : {}),
    ...(user.name !== undefined ? { name: user.name } : {}),
    ...(user.role !== undefined ? { role: user.role } : {}),
    ...(user.companyId !== undefined ? { company_id: user.companyId || null } : {}),
  };
}

export const UserRepository = {
  async getAll(supabase: SupabaseClient): Promise<Users[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map((row) => toUser(row as UserRow));
  },

  async add(supabase: SupabaseClient, user: Users) {
    const payload = {
      ...toUserPayload(user),
      id: user.id || crypto.randomUUID(),
    };
    const { error } = await supabase.from('users').insert([payload]);
    if (error) throw error;
  },

  async update(supabase: SupabaseClient, id: string, user: Partial<Users>) {
    const { error } = await supabase.from('users').update(toUserPayload(user)).eq('id', id);
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
    return toUser(data as UserRow);
  },

  async findById(supabase: SupabaseClient, id: string): Promise<Users | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) {
      console.error('Error finding user by id:', error);
      return null;
    }
    return toUser(data as UserRow);
  },

  async countRecibosByUser(supabase: SupabaseClient, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('recibos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count ?? 0;
  }
};
