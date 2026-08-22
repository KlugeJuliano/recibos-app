import type { SupabaseClient } from '@supabase/supabase-js';

export type Plan = 'free' | 'pro' | 'business';
export type PlanStatus = 'active' | 'past_due' | 'canceled';

export type Feature = 
  | 'history'
  | 'logo'
  | 'sequential_numbering'
  | 'auto_send'
  | 'recurring_receipts'
  | 'multi_user'
  | 'multi_store'
  | 'consolidated_reports';

export const FEATURES_BY_PLAN: Record<Plan, Feature[]> = {
  free: [],
  pro: ['history', 'logo', 'sequential_numbering', 'auto_send', 'recurring_receipts'],
  business: ['history', 'logo', 'sequential_numbering', 'auto_send', 'recurring_receipts', 'multi_user', 'multi_store', 'consolidated_reports'],
};

export function canAccessFeature(plan: Plan, feature: Feature): boolean {
  return FEATURES_BY_PLAN[plan]?.includes(feature) ?? false;
}

/**
 * Busca o plano da empresa.
 * NOTA: Por enquanto ignora plan_status (sempre 'active' até integração Asaas).
 * Quando Asaas entrar, a regra vira:
 *   plan !== 'free' && plan_status === 'active'
 */
export async function getCompanyPlan(supabase: SupabaseClient, companyId: string): Promise<Plan> {
  const { data, error } = await supabase
    .from('companies')
    .select('plan')
    .eq('id', companyId)
    .single();
  
  if (error || !data) return 'free';
  return (data.plan as Plan) || 'free';
}