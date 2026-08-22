import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/utils/supabase/profile';
import { getCompanyPlan, canAccessFeature } from '@/app/lib/planGuard';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Não autenticado.' }, { status: 401 });

  const profile = await getUserProfile(supabase, user.id);
  if (!profile?.companyId) return Response.json({ error: 'Empresa não encontrada.' }, { status: 404 });

  const plan = await getCompanyPlan(supabase, profile.companyId);
  if (!canAccessFeature(plan, 'logo')) {
    return Response.json({ error: 'Feature indisponível no plano Free. Faça upgrade para Pro.' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file || !file.type.startsWith('image/')) {
    return Response.json({ error: 'Arquivo inválido. Envie uma imagem.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${profile.companyId}/logo.png`;

  const { error: uploadError } = await supabase.storage
    .from('company-logos')
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('company-logos')
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from('companies')
    .update({ logo_url: publicUrl })
    .eq('id', profile.companyId);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  return Response.json({ logoUrl: publicUrl });
}