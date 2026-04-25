# ReciboPro

ReciboPro é uma aplicação web para emissão, organização e exportação de recibos profissionais. O projeto combina uma landing page comercial, um gerador público gratuito, autenticação com Supabase, painel administrativo, emissão autenticada de recibos e exportação em PDF/CSV.

Este repositório foi estruturado como projeto de portfólio, com foco em produto real, fluxo SaaS, qualidade visual, integração com banco de dados e experiência completa de usuário.

## Visão do Produto

Profissionais, lojas e pequenas empresas frequentemente emitem recibos de forma manual, sem padrão visual, sem histórico e sem controle por equipe. O ReciboPro resolve esse problema com um fluxo simples:

1. Visitantes podem gerar recibos comuns sem cadastro.
2. Empresas criam uma conta e informam o nome da empresa no primeiro cadastro.
3. O primeiro usuário entra como administrador.
4. O painel autenticado permite emitir recibos, gerenciar usuários, lojas e setores.
5. Relatórios podem ser exportados em PDF ou CSV.

## Funcionalidades

- Landing page responsiva com proposta de valor, tipos de recibo e chamada para cadastro.
- Gerador gratuito em `/gerar` com modelos por tipo de recibo.
- Modelos públicos para aluguel, serviço e pagamento geral.
- Bloqueio de tipos avançados para usuários autenticados.
- Login e cadastro com Supabase Auth.
- Criação/vínculo de empresa no primeiro cadastro.
- Perfil inicial do usuário como `admin`.
- Dashboard autenticado.
- Área administrativa protegida por role.
- CRUD base para usuários, lojas e setores.
- Emissão de recibos autenticados.
- Geração de PDF apenas do recibo, não da página inteira.
- Opção separada para imprimir recibo ou baixar PDF.
- Relatórios com exportação PDF/CSV.
- CSP ajustada para Supabase e ambiente de produção.

## Stack

- **Next.js 15** com App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Supabase Auth**
- **Supabase/PostgreSQL**
- **@supabase/ssr**
- **@react-pdf/renderer** para PDFs de recibo
- **Puppeteer** para relatórios em PDF
- **Vercel** como alvo natural de deploy

## Arquitetura

```txt
src/
├── app/
│   ├── page.tsx                         # Landing page
│   ├── gerar/page.tsx                   # Gerador público gratuito
│   ├── exemplo/page.tsx                 # Exemplo público
│   ├── login/page.tsx                   # Login e cadastro
│   ├── dashboard/
│   │   ├── page.tsx                     # Home autenticada
│   │   ├── layout.tsx                   # Shell autenticado
│   │   ├── recibos/                     # Emissão de recibos
│   │   ├── relatorios/page.tsx          # Relatórios
│   │   └── admin/                       # Área administrativa
│   ├── api/
│   │   ├── recibos/                     # CRUD e PDF de recibos
│   │   ├── relatorios/                  # Dados e exportação
│   │   └── admin/                       # Endpoints administrativos
│   ├── lib/
│   │   ├── receiptTypes.ts              # Tipos de recibo
│   │   └── receiptPdf.ts                # Template PDF compartilhado
│   └── repositories/                    # Acesso a tabelas do Supabase
├── components/
└── utils/supabase/
    ├── client.ts                        # Client browser
    ├── server.ts                        # Client server
    ├── middleware.ts                    # Sessão SSR
    └── profile.ts                       # Perfil de usuário
```

## Fluxos Principais

### Gerador Gratuito

A rota `/gerar` permite gerar recibos sem login. Cada tipo muda:

- título do documento;
- labels dos campos;
- texto jurídico/comercial do recibo;
- conteúdo do PDF.

Os tipos avançados ficam visíveis, mas exigem cadastro para uso completo.

### Cadastro Empresarial

No primeiro cadastro, o usuário informa o nome da empresa. O sistema:

- envia `company_name` para o Supabase Auth;
- cria ou completa o perfil em `public.users`;
- vincula `company_id`;
- define o primeiro usuário como `admin`;
- permite acesso à área administrativa.

Para ambientes com confirmação de e-mail, o projeto também suporta trigger no banco para criar empresa e perfil assim que o usuário nasce em `auth.users`.

### PDF e Impressão

O recibo possui duas ações separadas:

- **Imprimir**: abre uma janela contendo apenas o recibo.
- **Baixar PDF**: chama `/api/recibos/pdf` ou `/api/recibos/[id]/pdf` e gera um PDF limpo com `@react-pdf/renderer`.

Os horários de entrada, saída e intervalo aparecem somente em recibos de pagamento por hora/trabalhistas.

## Rotas

| Rota | Tipo | Descrição |
| --- | --- | --- |
| `/` | Pública | Landing page |
| `/gerar` | Pública | Gerador gratuito |
| `/exemplo` | Pública | Exemplo de recibo |
| `/login` | Pública | Login e cadastro |
| `/dashboard` | Privada | Painel principal |
| `/dashboard/recibos` | Privada | Emissão/listagem de recibos |
| `/dashboard/recibos/novo` | Privada | Novo recibo |
| `/dashboard/relatorios` | Privada | Relatórios |
| `/dashboard/admin` | Privada/Admin | Administração |
| `/api/recibos` | API | Listagem/criação |
| `/api/recibos/pdf` | API | PDF de recibo não salvo |
| `/api/recibos/[id]/pdf` | API | PDF de recibo salvo |
| `/api/relatorios/exportar` | API | Exportação PDF/CSV |

## Modelo de Dados

O projeto usa Supabase/PostgreSQL com tabelas principais:

- `auth.users`: usuários autenticados do Supabase.
- `public.users`: perfil de aplicação, role, empresa e loja.
- `public.companies`: empresas.
- `public.roles`: papéis e permissões.
- `public.stores`: lojas/filiais.
- `public.sectors`: setores.
- `public.recibos`: recibos emitidos.

O código usa `company_id` e `loja_id` no banco, mapeando para `companyId` e `lojaId` na aplicação.

## Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

As mesmas variáveis precisam estar configuradas no ambiente de deploy.

## Setup Local

```bash
npm install
npm run dev
```

A aplicação roda por padrão em:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run dev        # Desenvolvimento
npm run build      # Build de produção
npm run start      # Servir build
npm run typecheck  # Checagem TypeScript
```

## Banco de Dados

### Roles iniciais

```sql
insert into public.roles (id, name, description, permissions)
values
  (
    'admin',
    'Admin',
    'Acesso administrativo completo',
    '[
      "create_recibo",
      "edit_recibo",
      "delete_recibo",
      "view_reports",
      "manage_users",
      "manage_stores",
      "manage_settings",
      "manage_functions"
    ]'::jsonb
  ),
  (
    'funcionario',
    'Funcionário',
    'Acesso operacional básico',
    '["create_recibo"]'::jsonb
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  permissions = excluded.permissions;
```

### Trigger para primeiro cadastro

Este trigger cria empresa e perfil administrativo quando um usuário é criado no Supabase Auth.

```sql
drop trigger if exists on_auth_user_created_create_profile on auth.users;
drop function if exists public.handle_new_user_profile();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid := gen_random_uuid();
  v_company_name text := nullif(trim(coalesce(new.raw_user_meta_data->>'company_name', '')), '');
  v_user_name text;
begin
  if v_company_name is null then
    v_company_name := split_part(coalesce(new.email, 'Empresa'), '@', 1);
  end if;

  v_user_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    v_company_name,
    split_part(coalesce(new.email, 'Usuario'), '@', 1)
  );

  insert into public.companies (id, name, cnpj)
  values (v_company_id, v_company_name, '');

  insert into public.users (id, email, name, role, company_id, loja_id)
  values (
    new.id,
    coalesce(new.email, ''),
    v_user_name,
    'admin',
    v_company_id,
    null
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(nullif(public.users.name, ''), excluded.name),
    role = case
      when public.users.role is null
        or public.users.role = ''
        or public.users.role = 'funcionario'
      then 'admin'
      else public.users.role
    end,
    company_id = coalesce(public.users.company_id, excluded.company_id),
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
```

### Policies RLS essenciais

```sql
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.roles enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;

create policy "users_select_own"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "users_insert_own"
on public.users
for insert
to authenticated
with check (id = auth.uid());

create policy "users_update_own"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "companies_insert_authenticated" on public.companies;
drop policy if exists "companies_select_own" on public.companies;

create policy "companies_insert_authenticated"
on public.companies
for insert
to authenticated
with check (true);

create policy "companies_select_own"
on public.companies
for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.company_id = companies.id
  )
);

drop policy if exists "roles_select_authenticated" on public.roles;

create policy "roles_select_authenticated"
on public.roles
for select
to authenticated
using (true);
```

## Qualidade e Validação

Comandos usados para validar as alterações recentes:

```bash
npm run typecheck
npm run build
```

## Decisões Técnicas

- Supabase SSR foi escolhido para manter sessões consistentes entre server components, middleware e client components.
- O perfil de aplicação fica em `public.users`, separado de `auth.users`.
- Roles são persistidas no banco e não dependem de `user_metadata`, evitando autorização baseada em dados editáveis pelo cliente.
- PDFs de recibo usam `@react-pdf/renderer`, evitando impressão da página inteira.
- Relatórios usam Puppeteer para gerar documentos mais ricos a partir de HTML.
- O gerador público prioriza conversão e demonstração de valor antes do cadastro.

## Melhorias Futuras

- Filtros avançados por período, loja, setor e usuário.
- Templates visuais por empresa.
- Upload de logotipo da empresa.
- Numeração sequencial por empresa.
- Cancelamento de recibos com motivo.
- Envio de recibo por e-mail.
- Testes automatizados de fluxo com Playwright.
- Auditoria administrativa.

## Status

Projeto em evolução ativa, com foco em consolidar um MVP SaaS completo para demonstração profissional.
