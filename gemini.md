# 🔧 Refatoração Estrutural – Recibos App (Next.js + Supabase)

## 🎯 Objetivo Geral
- Tornar o projeto indexável pelo Google
- Corrigir arquitetura de rotas (SEO-first)
- Criar páginas públicas fora do auth
- Atualizar Supabase para o padrão atual (`@supabase/ssr`)
- Evitar retrabalho e refactors inúteis

---

## 1️⃣ PRIORIDADE 1 — Estrutura do Next.js (SEO e Indexação)

### ❌ Problema atual
- Rotas genéricas e internas:
  - `/dashboard`
  - `/relatorios`
- Tudo atrás de autenticação
- Google não indexa dashboards nem apps fechados

📌 **Dashboard não rankeia. Produto sim.**

---

### ✅ Ações necessárias
#### 1.1 URLs semânticas (obrigatório)
Criar rotas públicas com significado de busca:

**Evitar**
/dashboard
/relatorios

markdown
Copiar código

**Usar**
/recibos
/gerador-de-recibos
/recibo-freelancer
/recibo-online-gratis

yaml
Copiar código

---

#### 1.2 Metadados por página (Next.js App Router)
Cada página pública deve exportar metadata:

```ts
export const metadata = {
  title: 'Gerador de Recibos Online | Recibos App',
  description: 'Crie recibos simples e profissionais online, grátis e rápido.',
};
Obrigatório:

title único por página

description focada em busca real

✅ Criar páginas públicas mínimas

Criar fora do auth:

/ → Landing page

/como-funciona

/recibo-online-gratis (principal página SEO)

Mesmo simples, mas públicas.

Estrutura mínima de cada página

1 <h1> claro e objetivo

2–3 parágrafos explicativos

Lista de benefícios

CTA apontando para o app

Exemplo de foco:

“Gerar recibo online”, “recibo freelancer”, “recibo simples”
4️⃣ Atualização do Supabase (Auth Helpers → SSR)
❌ Situação atual

Uso de pacotes deprecated:

@supabase/auth-helpers-nextjs

@supabase/auth-helpers-shared

Warnings:

This package is now deprecated - please use @supabase/ssr

✅ Ação planejada

Migrar para:

npm install @supabase/ssr

4.1 Client-side (Browser)

Substituir:

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


Por:

import { createBrowserClient } from '@supabase/ssr';

4.2 Server-side / Route Handlers

Usar:

import { createServerClient } from '@supabase/ssr';


Responsabilidades:

leitura de cookies

escrita de cookies manualmente

controle explícito de sessão

4.3 Middleware

Remover helpers antigos

Controlar cookies manualmente

Garantir que páginas públicas não exijam auth

Proteger apenas rotas internas (dashboard)

📌 Fazer essa migração somente após o build estar estável

5️⃣ Search Console e Indexação
✅ Verificações obrigatórias

Domínio verificado no Search Console

Sitemap disponível (/sitemap.xml)

Páginas públicas:

sem noindex

sem redirect para login

acessíveis sem sessão

