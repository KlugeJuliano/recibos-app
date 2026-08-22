
import { type SupabaseClient } from '@supabase/supabase-js';
import { Company } from '@/app/types';
import { Plan } from '@/app/lib/planGuard';

// Extended Company type with all database fields
type CompanyRow = Company & {
  logo_url?: string;
  plan?: 'free' | 'pro' | 'business';
  plan_status?: 'active' | 'past_due' | 'canceled';
  next_receipt_number?: number;
};

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

  async findById(supabase: SupabaseClient, id: string): Promise<CompanyRow | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) {
      console.error('Error finding company by id:', error);
      return null;
    }
    return data as CompanyRow | null;
  },

  async getCompanyPlan(supabase: SupabaseClient, companyId: string): Promise<Plan> {
    const { data, error } = await supabase
      .from('companies')
      .select('plan')
      .eq('id', companyId)
      .single();
  
    if (error || !data) return 'free';
    return (data.plan as Plan) || 'free';
  },

  async countUsers(supabase: SupabaseClient, companyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    if (error) throw error;
    return count ?? 0;
  },

  async countStores(supabase: SupabaseClient, companyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('stores')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    if (error) throw error;
    return count ?? 0;
  }
};
