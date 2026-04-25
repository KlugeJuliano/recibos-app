# ReciboPro — Especificação Completa para Geração de Código

> Documento de referência para geração de código via IA. Contém arquitetura, fluxos, UI/UX, tipos de recibo, responsividade e regras de negócio detalhadas.

---

## 1. Visão Geral do Produto

**ReciboPro** é uma plataforma web SaaS para geração de recibos profissionais em PDF. Possui modelo freemium: visitantes geram recibos dos tipos mais comuns sem cadastro; usuários autenticados têm acesso a todos os tipos, histórico, relatórios e personalização por empresa.

### Stack recomendado
- **Framework**: Next.js 14+ (App Router)
- **Estilização**: Tailwind CSS v3
- **Componentes**: shadcn/ui (baseado em Radix UI)
- **Banco de dados**: PostgreSQL via Prisma ORM
- **Autenticação**: NextAuth.js v5 (Auth.js)
- **Geração de PDF**: `@react-pdf/renderer` ou `puppeteer` (server-side)
- **Exportação Excel**: `xlsx` (SheetJS)
- **Validação de formulários**: React Hook Form + Zod
- **Estado global**: Zustand (somente se necessário)
- **Hospedagem**: Vercel + Supabase (ou Railway)

---

## 2. Paleta de Cores e Design System

### Paleta principal
```css
--color-primary: #185FA5;        /* Azul institucional */
--color-primary-hover: #0C447C;
--color-primary-light: #E6F1FB;
--color-secondary: #F8FAFC;      /* Fundo geral */
--color-surface: #FFFFFF;        /* Cards e painéis */
--color-border: #E2E8F0;
--color-border-strong: #CBD5E1;
--color-text-primary: #0F172A;
--color-text-secondary: #64748B;
--color-text-muted: #94A3B8;
--color-success: #16A34A;
--color-success-bg: #F0FDF4;
--color-warning: #D97706;
--color-warning-bg: #FFFBEB;
--color-danger: #DC2626;
--color-danger-bg: #FEF2F2;
```

### Tipografia
- **Display/Headings**: `Sora` (Google Fonts) — peso 400, 500, 600
- **Body/UI**: `DM Sans` (Google Fonts) — peso 400, 500
- **Recibo (PDF)**: `Lora` (serif, Google Fonts) — transmite formalidade

### Breakpoints (Tailwind padrão)
| Nome | Largura mínima | Uso |
|------|---------------|-----|
| `sm` | 640px | Tablets pequenos |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Telas grandes |

### Regras gerais de responsividade
- Layout **mobile-first**: começar sempre pelo mobile, escalar com breakpoints
- Nunca usar `overflow-x: hidden` no body — corrigir o layout
- Padding horizontal: `px-4` (mobile) → `px-6` (md) → `px-8` (lg) → `container mx-auto` (xl)
- Grids: `grid-cols-1` (mobile) → `grid-cols-2` (md) → `grid-cols-3/4` (lg)
- Formulários em coluna única no mobile, grid de 2 colunas no md+
- Tabelas no mobile devem usar scroll horizontal com `overflow-x-auto`
- Sidebar de navegação: hambúrguer no mobile com drawer lateral, sidebar fixa no lg+
- Modais: full-screen no mobile, centralizado com max-width no md+
- Textos: nunca abaixo de 14px em UI, nunca abaixo de 12px em labels

---

## 3. Estrutura de Rotas (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx                    # Landing page
│   ├── exemplo/page.tsx            # Exemplo de recibo público
│   ├── gerar/page.tsx              # Gerador gratuito (sem login)
│   └── login/page.tsx              # Autenticação
├── (auth)/
│   └── dashboard/
│       ├── page.tsx                # Dashboard principal
│       ├── recibos/
│       │   ├── page.tsx            # Lista de recibos
│       │   ├── novo/page.tsx       # Gerador completo (autenticado)
│       │   └── [id]/page.tsx       # Detalhe/reimpressão de recibo
│       ├── relatorios/page.tsx     # Relatórios e exportação
│       └── admin/
│           ├── page.tsx            # Visão geral de administração
│           ├── usuarios/page.tsx   # CRUD de usuários
│           ├── lojas/page.tsx      # CRUD de lojas/filiais
│           └── setores/page.tsx    # CRUD de setores
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── recibos/route.ts            # GET (lista), POST (criar)
    ├── recibos/[id]/route.ts       # GET, PUT, DELETE
    ├── recibos/[id]/pdf/route.ts   # Geração de PDF
    ├── relatorios/route.ts         # GET (com filtros)
    ├── relatorios/exportar/route.ts
    ├── admin/usuarios/route.ts
    ├── admin/lojas/route.ts
    └── admin/setores/route.ts
```

---

## 4. Modelos de Dados (Prisma Schema)

```prisma
model Empresa {
  id         String   @id @default(cuid())
  nome       String
  cnpj       String?  @unique
  logo       String?  // URL da logo
  telefone   String?
  email      String?
  endereco   String?
  criadoEm  DateTime @default(now())
  usuarios   Usuario[]
  lojas      Loja[]
  recibos    Recibo[]
}

model Usuario {
  id         String   @id @default(cuid())
  nome       String
  email      String   @unique
  senha      String?
  papel      Papel    @default(OPERADOR)
  ativo      Boolean  @default(true)
  empresaId  String
  empresa    Empresa  @relation(fields: [empresaId], references: [id])
  lojaId     String?
  loja       Loja?    @relation(fields: [lojaId], references: [id])
  setorId    String?
  setor      Setor?   @relation(fields: [setorId], references: [id])
  recibos    Recibo[]
  criadoEm  DateTime @default(now())
}

enum Papel {
  SUPER_ADMIN   // Acesso total ao sistema
  ADMIN         // Acesso total à empresa
  SUPERVISOR    // Acesso a relatórios e aprovação
  OPERADOR      // Apenas emitir recibos
}

model Loja {
  id        String   @id @default(cuid())
  nome      String
  cnpj      String?
  endereco  String?
  telefone  String?
  ativa     Boolean  @default(true)
  empresaId String
  empresa   Empresa  @relation(fields: [empresaId], references: [id])
  usuarios  Usuario[]
  recibos   Recibo[]
  setores   Setor[]
}

model Setor {
  id        String   @id @default(cuid())
  nome      String
  lojaId    String
  loja      Loja     @relation(fields: [lojaId], references: [id])
  usuarios  Usuario[]
  recibos   Recibo[]
}

model Recibo {
  id           String      @id @default(cuid())
  numero       Int         // Auto-incremento por empresa
  tipo         TipoRecibo
  status       StatusRecibo @default(EMITIDO)
  dados        Json         // Campos dinâmicos por tipo
  valorTotal   Decimal
  dataEmissao  DateTime    @default(now())
  empresaId    String
  empresa      Empresa     @relation(fields: [empresaId], references: [id])
  lojaId       String?
  loja         Loja?       @relation(fields: [lojaId], references: [id])
  setorId      String?
  setor        Setor?      @relation(fields: [setorId], references: [id])
  usuarioId    String
  usuario      Usuario     @relation(fields: [usuarioId], references: [id])
  pdfUrl       String?
  criadoEm    DateTime    @default(now())
}

enum TipoRecibo {
  ALUGUEL
  SERVICO
  PAGAMENTO_GERAL
  TRABALHISTA
  HONORARIOS
  DOACAO
  EMPRESTIMO
  CAUCAO
  CONDOMINIO
  VENDA_IMOVEL
  JURIDICO
  PERSONALIZADO
}

enum StatusRecibo {
  EMITIDO
  CANCELADO
  PENDENTE
}
```

---

## 5. Tipos de Recibo — Especificação Completa

Cada tipo de recibo possui campos obrigatórios, campos opcionais e um template de texto para o PDF.

---

### 5.1 Recibo de Aluguel
**Disponível**: Gratuito (sem login)

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeLocador` | text | Nome completo do locador |
| `cpfCnpjLocador` | text (mask) | CPF/CNPJ do locador |
| `nomeLocatario` | text | Nome completo do locatário |
| `cpfCnpjLocatario` | text (mask) | CPF/CNPJ do locatário |
| `valor` | currency | Valor do aluguel |
| `mesReferencia` | month | Mês/Ano de referência |
| `enderecoImovel` | textarea | Endereço completo do imóvel |
| `dataRecebimento` | date | Data do recebimento |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `periodoInicio` | date | Início do período |
| `periodoFim` | date | Fim do período |
| `formaPagamento` | select | Forma de pagamento (Dinheiro, PIX, TED, Boleto) |
| `observacoes` | textarea | Observações |

**Template do PDF:**
```
Eu, [nomeLocador], CPF/CNPJ [cpfCnpjLocador], declaro ter recebido de
[nomeLocatario], CPF/CNPJ [cpfCnpjLocatario], a importância de R$ [valor]
([valor por extenso]), referente ao aluguel do imóvel situado em
[enderecoImovel], relativo ao mês de [mesReferencia].

[Período: periodoInicio a periodoFim — se preenchido]
[Forma de pagamento: formaPagamento — se preenchido]

[cidade], [dataRecebimento].
```

---

### 5.2 Recibo de Serviço
**Disponível**: Gratuito (sem login)

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomePrestador` | text | Nome/Razão social do prestador |
| `cpfCnpjPrestador` | text (mask) | CPF/CNPJ do prestador |
| `nomeContratante` | text | Nome/Razão social do contratante |
| `cpfCnpjContratante` | text (mask) | CPF/CNPJ do contratante |
| `descricaoServico` | textarea | Descrição detalhada do serviço |
| `valor` | currency | Valor cobrado |
| `dataExecucao` | date | Data de execução do serviço |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `numeroNF` | text | Número da nota fiscal (se houver) |
| `formaPagamento` | select | Forma de pagamento |
| `prazoGarantia` | text | Prazo de garantia do serviço |
| `observacoes` | textarea | Observações |

---

### 5.3 Recibo de Pagamento Geral
**Disponível**: Gratuito (sem login)

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeRecebedor` | text | Nome de quem recebe |
| `cpfCnpjRecebedor` | text (mask) | CPF/CNPJ do recebedor |
| `nomePagador` | text | Nome de quem paga |
| `cpfCnpjPagador` | text (mask) | CPF/CNPJ do pagador |
| `valor` | currency | Valor recebido |
| `referente` | textarea | Referente a (motivo do pagamento) |
| `dataRecebimento` | date | Data do recebimento |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `formaPagamento` | select | Forma de pagamento |
| `observacoes` | textarea | Observações |

---

### 5.4 Recibo de Pagamento Trabalhista
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeEmpregado` | text | Nome completo do empregado |
| `cpfEmpregado` | text (mask) | CPF do empregado |
| `rgEmpregado` | text (mask) | RG do empregado |
| `cargoFuncao` | text | Cargo/Função |
| `nomeEmpregador` | text | Nome/Razão social do empregador |
| `cnpjEmpregador` | text (mask) | CNPJ do empregador |
| `competencia` | month | Mês/Ano de competência (salário) |
| `salarioBruto` | currency | Salário bruto |
| `descontoINSS` | currency | Desconto INSS |
| `descontoIRRF` | currency | Desconto IRRF |
| `outrosDescontos` | currency | Outros descontos |
| `salarioLiquido` | currency (calc) | Salário líquido (calculado automaticamente) |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `horasExtras` | currency | Horas extras |
| `adicionalNoturno` | currency | Adicional noturno |
| `comissoes` | currency | Comissões |
| `valeTransporte` | currency | Desconto vale-transporte |
| `planoSaude` | currency | Desconto plano de saúde |
| `adiantamento` | currency | Desconto adiantamento |
| `observacoes` | textarea | Observações |

**Regra de cálculo:**
```
salarioLiquido = salarioBruto + horasExtras + adicionalNoturno + comissoes
                 - descontoINSS - descontoIRRF - valeTransporte
                 - planoSaude - adiantamento - outrosDescontos
```

**Exibição no PDF:** Tabela com coluna de Proventos e coluna de Descontos, totais ao final, líquido em destaque.

---

### 5.5 Recibo de Honorários Profissionais
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeProfissional` | text | Nome do profissional |
| `registroProfissional` | text | Nº registro (OAB, CRM, CRC, etc.) |
| `cpfCnpjProfissional` | text (mask) | CPF/CNPJ |
| `nomeCliente` | text | Nome do cliente |
| `cpfCnpjCliente` | text (mask) | CPF/CNPJ do cliente |
| `descricaoServico` | textarea | Descrição dos serviços prestados |
| `valor` | currency | Valor dos honorários |
| `dataRecebimento` | date | Data do recebimento |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `numeroProcesso` | text | Número do processo (para advogados) |
| `numeroContrato` | text | Número do contrato |
| `formaPagamento` | select | Forma de pagamento |
| `retencaoISS` | currency | Retenção ISS |
| `retencaoIRRF` | currency | Retenção IRRF |
| `observacoes` | textarea | Observações |

---

### 5.6 Recibo de Doação
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeDoador` | text | Nome do doador |
| `cpfCnpjDoador` | text (mask) | CPF/CNPJ do doador |
| `nomeRecebedor` | text | Nome da instituição/pessoa recebedora |
| `cnpjRecebedor` | text (mask) | CNPJ (se ONG/instituição) |
| `tipoDoacao` | select | Tipo (Dinheiro, Bens, Alimentos, Roupas, Outros) |
| `descricaoDoacao` | textarea | Descrição detalhada do que foi doado |
| `valor` | currency | Valor estimado (se aplicável) |
| `dataDoacao` | date | Data da doação |

---

### 5.7 Recibo de Empréstimo
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeCredor` | text | Nome do credor (quem emprestou) |
| `cpfCnpjCredor` | text (mask) | CPF/CNPJ do credor |
| `nomeDevedor` | text | Nome do devedor (quem recebeu) |
| `cpfCnpjDevedor` | text (mask) | CPF/CNPJ do devedor |
| `valorEmprestado` | currency | Valor emprestado |
| `dataEmprestimo` | date | Data do empréstimo |
| `dataVencimento` | date | Data de vencimento |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `taxaJuros` | percentage | Taxa de juros (% a.m.) |
| `numeroParcelas` | number | Número de parcelas |
| `valorParcela` | currency (calc) | Valor de cada parcela |
| `garantia` | textarea | Descrição da garantia (se houver) |
| `observacoes` | textarea | Observações |

---

### 5.8 Recibo de Caução
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeDetentor` | text | Nome de quem guarda a caução |
| `cpfCnpjDetentor` | text (mask) | CPF/CNPJ |
| `nomeDepositante` | text | Nome de quem pagou a caução |
| `cpfCnpjDepositante` | text (mask) | CPF/CNPJ |
| `valorCaucao` | currency | Valor da caução |
| `motivoCaucao` | textarea | Motivo (ex: caução de aluguel) |
| `enderecoReferencia` | textarea | Imóvel ou contrato de referência |
| `dataPagamento` | date | Data do pagamento |
| `prazoContrato` | text | Prazo do contrato |

---

### 5.9 Recibo de Condomínio
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeCondominio` | text | Nome do condomínio |
| `cnpjCondominio` | text (mask) | CNPJ do condomínio |
| `nomeMorador` | text | Nome do condômino |
| `cpfMorador` | text (mask) | CPF |
| `unidade` | text | Unidade (ex: Apto 42, Bloco B) |
| `competencia` | month | Mês/Ano de referência |
| `valorCondominio` | currency | Taxa de condomínio |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `valorFundo` | currency | Fundo de reserva |
| `valorExtras` | currency | Cobranças extras |
| `multa` | currency | Multa por atraso |
| `juros` | currency | Juros por atraso |
| `totalPago` | currency (calc) | Total pago |
| `formaPagamento` | select | Forma de pagamento |

---

### 5.10 Recibo de Venda de Imóvel (Sinal/Arras)
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeVendedor` | text | Nome do vendedor |
| `cpfCnpjVendedor` | text (mask) | CPF/CNPJ |
| `nomeComprador` | text | Nome do comprador |
| `cpfCnpjComprador` | text (mask) | CPF/CNPJ |
| `descricaoImovel` | textarea | Descrição e matrícula do imóvel |
| `valorTotal` | currency | Valor total de venda |
| `valorSinal` | currency | Valor do sinal/arras |
| `dataPagamento` | date | Data do pagamento do sinal |
| `prazoEscritura` | date | Prazo para assinatura da escritura |

---

### 5.11 Recibo Jurídico / Acordo Judicial
**Disponível**: Login obrigatório

**Campos obrigatórios:**
| Campo | Tipo | Label |
|-------|------|-------|
| `nomeCredor` | text | Nome do credor |
| `cpfCnpjCredor` | text (mask) | CPF/CNPJ |
| `nomeDevedor` | text | Nome do devedor |
| `cpfCnpjDevedor` | text (mask) | CPF/CNPJ |
| `numeroProcesso` | text | Número do processo |
| `varaJuizo` | text | Vara/Juízo |
| `descricaoAcordo` | textarea | Descrição do acordo homologado |
| `valorRecebido` | currency | Valor recebido |
| `dataPagamento` | date | Data do pagamento |

**Campos opcionais:**
| Campo | Tipo | Label |
|-------|------|-------|
| `advogadoCredor` | text | Nome do advogado do credor |
| `oabCredor` | text | OAB do advogado |
| `advogadoDevedor` | text | Nome do advogado do devedor |
| `oabDevedor` | text | OAB do advogado |
| `observacoes` | textarea | Observações |

---

### 5.12 Recibo Personalizado
**Disponível**: Login obrigatório

Permite ao usuário montar livremente o recibo com os campos:
| Campo | Tipo | Label |
|-------|------|-------|
| `tituloRecibo` | text | Título do recibo (ex: "Recibo de Conserto") |
| `nomeRecebedor` | text | Nome de quem recebe |
| `cpfCnpjRecebedor` | text (mask) | CPF/CNPJ |
| `nomePagador` | text | Nome de quem paga |
| `cpfCnpjPagador` | text (mask) | CPF/CNPJ |
| `valor` | currency | Valor |
| `descricao` | textarea | Texto livre descritivo (sem máscara) |
| `dataRecebimento` | date | Data |
| `observacoes` | textarea | Observações adicionais |

---

## 6. Especificação das Páginas

---

### 6.1 Landing Page (`/`)

**Objetivo:** Converter visitante em usuário, comunicar valor e modelo freemium claramente.

**Estrutura de seções (ordem de cima para baixo):**

#### Navbar
- Logo à esquerda (SVG inline do ícone + "ReciboPro" em Sora 600)
- Links no centro (desktop): "Como funciona", "Preços", "Exemplos"
- Botões à direita: "Entrar" (ghost) + "Criar conta grátis" (primary)
- Mobile: hambúrguer que abre drawer com os links e botões empilhados
- Sticky no topo com `backdrop-blur` ao rolar
- Altura: 64px desktop, 56px mobile

#### Hero Section
- Tag/pill acima do título: "✨ 100% gratuito para os recibos mais comuns"
- H1 (Sora 600, 48px desktop / 32px mobile): "Gere recibos profissionais em segundos"
- Subtítulo (DM Sans 400, 18px desktop / 16px mobile, cor secondary): "Preencha o formulário, visualize na hora e baixe o PDF — sem cadastro para os tipos mais comuns."
- CTA principal: botão azul grande "Gerar recibo agora" → `/gerar`
- CTA secundário: link "Ver exemplo →" → `/exemplo`
- Abaixo dos botões: avatares + "Mais de 10.000 recibos gerados"
- Imagem/mockup à direita: screenshot do PDF gerado (desktop), oculto no mobile

**Responsividade:**
- Desktop (lg+): hero em 2 colunas (texto à esquerda, imagem à direita)
- Mobile: coluna única, imagem oculta

#### Seção "Como funciona" (3 passos)
- Grid 3 colunas (desktop) / coluna única com linha vertical (mobile)
- Passo 1: "Escolha o tipo" — ícone de lista
- Passo 2: "Preencha os dados" — ícone de formulário
- Passo 3: "Baixe o PDF" — ícone de download
- Cada passo: número grande (Sora 600, cor primary-light), título, descrição curta

#### Seção "Tipos de recibo"
- Título: "O tipo certo para cada situação"
- Grid responsivo: `grid-cols-2` (sm) → `grid-cols-3` (lg) → `grid-cols-4` (xl)
- Cada card: ícone emoji + nome do tipo + badge "Grátis" (verde) ou "Requer login" (azul)
- Card com `cursor-pointer` e hover suave
- Ao clicar num tipo, vai direto para `/gerar?tipo=aluguel`

#### Seção de Planos (Pricing)
- Título: "Simples e transparente"
- Layout: 2 cards lado a lado (desktop), empilhados (mobile)
- **Plano Gratuito:**
  - R$ 0/mês
  - 3 tipos de recibo
  - PDF simples (sem logo)
  - Sem histórico
  - Sem relatórios
  - Botão: "Começar grátis"
- **Plano Pro (destaque):**
  - Badge "Mais popular"
  - R$ 19/mês ou R$ 190/ano (-17%)
  - Toggle anual/mensal
  - Todos os tipos de recibo
  - PDF com logo da empresa
  - Histórico ilimitado
  - Relatórios em Excel e PDF
  - Até 10 usuários
  - Múltiplas lojas/filiais
  - Botão: "Assinar Pro"

#### Seção de Depoimentos (opcional — placeholder para MVP)
- 3 cards com avatar, nome, cargo, texto do depoimento
- Stars (★★★★★) em amarelo

#### Footer
- 3 colunas (desktop) / coluna única (mobile)
- Coluna 1: logo + tagline + ícones de redes sociais
- Coluna 2: links úteis (Como funciona, Preços, Termos, Privacidade)
- Coluna 3: contato (email de suporte)
- Bottom bar: copyright + "Feito com ♥ no Brasil"

---

### 6.2 Exemplo Público (`/exemplo`)

**Objetivo:** Mostrar o produto em ação sem barreiras, aumentar conversão.

**Layout:**
- Navbar simplificada (sem links, só logo e "Criar minha conta")
- Título da página: "Exemplo de recibo de aluguel"
- Layout 2 colunas (lg+): formulário preenchido (bloqueado/read-only) à esquerda, PDF preview à direita
- Mobile: preview do PDF em cima, form resumido abaixo
- Botão "Baixar este exemplo em PDF" → baixa sem login
- Botão "Personalizar o meu →" → vai para `/gerar`
- Banner sutil abaixo: "Crie uma conta para salvar histórico e acessar todos os tipos"

**Conteúdo do formulário de exemplo:**
- Locador: "João Silva"
- Locatário: "Maria Souza"
- Valor: R$ 1.500,00
- Mês: Abril/2026
- Endereço: "Rua das Flores, 123 — São Paulo/SP"

---

### 6.3 Gerador Gratuito (`/gerar`)

**Objetivo:** Converter o visitante em usuário ativo imediatamente.

**Layout geral:**
- Desktop (lg+): sidebar esquerda (280px) com seleção de tipo + form no centro (flex-1) + preview à direita (380px)
- Tablet (md): form em cima, preview em baixo (tabs alternam entre eles)
- Mobile: stepper em 3 etapas: 1) Tipo → 2) Formulário → 3) Preview/Download

**Sidebar — Seleção de tipo:**
- Título "Tipo de recibo"
- Lista com ícones emoji e nomes
- Tipos gratuitos clicáveis normalmente
- Tipos bloqueados: ícone de cadeado, ao clicar mostra modal "Faça login para acessar"
- Estado ativo com borda esquerda azul e fundo azul-claro

**Formulário central:**
- Título dinâmico: "Recibo de [tipo selecionado]"
- Campos organizados em grid responsivo:
  - 1 coluna no mobile
  - 2 colunas no md+ (campos de mesmo grupo lado a lado)
  - Campos de texto longo (textarea) sempre full-width
- Labels acima dos inputs, sempre visíveis (não usar placeholder como label)
- Validação inline com mensagem de erro abaixo do campo
- Máscaras automáticas: CPF (`000.000.000-00`), CNPJ (`00.000.000/0000-00`), valor (`R$ 0,00`), data (`00/00/0000`)
- Campo de valor por extenso: preenchido automaticamente ao digitar o valor
- Botão "Gerar PDF" sticky no bottom do form (mobile) ou no final do form (desktop)

**Preview à direita:**
- Iframe ou div simulando uma folha A4
- Atualiza em tempo real conforme o usuário digita (debounce de 500ms)
- Cabeçalho do PDF com:
  - Nome "ReciboPro" se sem conta (marca d'água sutil) ou logo da empresa se logado
  - Número do recibo: "Nº 000001" gerado sequencialmente
  - Linha separadora elegante
- Corpo do texto em Lora (serif) para aspecto formal
- Rodapé: cidade e data, espaços para assinaturas
- Botão "Baixar PDF" no canto inferior direito do preview
- Botão "Copiar link" (compartilhar)

**Modal de login:**
- Aparece ao tentar acessar tipo bloqueado
- Título: "Acesse todos os tipos de recibo"
- Lista de benefícios do login
- Formulário de email + senha
- Link "Criar conta grátis"
- Fechar: clique fora ou botão X

---

### 6.4 Página de Login/Cadastro (`/login`)

**Layout:**
- Tela dividida 50/50 (desktop): lado esquerdo com fundo azul + ilustração + depoimento, lado direito com formulário
- Mobile: apenas formulário, sem ilustração
- Tabs "Entrar" / "Criar conta" no topo do formulário

**Formulário de Login:**
- Email (input com ícone)
- Senha (input com toggle show/hide)
- "Esqueci a senha" (link)
- Botão "Entrar" (primary, full-width)
- Separador "ou"
- Botão "Entrar com Google" (OAuth)

**Formulário de Cadastro:**
- Nome completo
- Email
- Senha (com indicador de força)
- Confirmar senha
- Nome da empresa (opcional)
- Checkbox: aceitar Termos e Política de Privacidade
- Botão "Criar conta grátis"

---

### 6.5 Dashboard (`/dashboard`)

**Layout geral:**
- Sidebar fixa (240px) no desktop com links de navegação
- Mobile: bottom navigation bar com 4 ícones (Dashboard, Recibos, Relatórios, Admin)
- Content area à direita com padding `p-6` (desktop) / `p-4` (mobile)

**Sidebar (desktop):**
- Topo: logo + nome da empresa
- Avatar + nome do usuário logado
- Links:
  - Dashboard (ícone home)
  - Recibos (ícone documento)
  - Novo recibo (ícone +, destaque azul)
  - Relatórios (ícone gráfico)
  - Administração (ícone engrenagem — apenas Admin+)
- Bottom: "Sair" + link de upgrade se plano gratuito

**Cards de métricas (topo do dashboard):**
- Grid: `grid-cols-2` (mobile) → `grid-cols-4` (lg)
- Card 1: Recibos este mês (número grande + % variação vs mês anterior)
- Card 2: Valor total emitido (formatado em R$)
- Card 3: Recibos hoje
- Card 4: Tipo mais emitido no mês

**Atalhos rápidos:**
- 3 cards grandes: "Novo recibo", "Ver relatórios", "Gerenciar equipe"
- Ícone grande + título + subtítulo + seta →

**Tabela de recibos recentes:**
- Título "Últimos recibos" + botão "Ver todos →"
- Colunas: Nº, Tipo, Recebedor, Pagador, Valor, Data, Status, Ações
- Mobile: mostrar apenas Nº, Tipo, Valor, Status (outras colunas ocultas)
- Status com badge colorido: Emitido (verde), Pendente (amarelo), Cancelado (vermelho)
- Coluna Ações: ícone de download (PDF), ícone de olho (visualizar), ícone de X (cancelar)
- Paginação simples no rodapé da tabela

---

### 6.6 Gerador Autenticado (`/dashboard/recibos/novo`)

Igual ao gerador público (`/gerar`), com adições:

- Todos os 12 tipos de recibo disponíveis (sem cadeado)
- Campo "Loja/Filial" no topo do formulário (select com lojas da empresa)
- Campo "Setor" (select com setores da loja selecionada)
- PDF com logo da empresa no cabeçalho (plano Pro)
- Numeração automática sequencial por empresa
- Ao gerar: recibo salvo automaticamente no banco de dados
- Opção "Enviar por e-mail" após gerar: input de email + botão enviar
- Botão "Novo recibo" (limpa o formulário e mantém tipo selecionado)

---

### 6.7 Lista de Recibos (`/dashboard/recibos`)

**Filtros (barra de busca + filtros):**
- Input de busca por número, nome do recebedor ou pagador
- Select "Tipo de recibo" (all + cada tipo)
- Select "Loja/Filial"
- Select "Status"
- Date range picker "Período" (início e fim)
- Botão "Aplicar filtros" + "Limpar"
- Mobile: filtros em drawer lateral ou modal

**Tabela:**
- Idêntica à do dashboard mas com mais colunas
- Paginação: 25 por página
- Opção de selecionar múltiplos + ação em massa (cancelar, exportar selecionados)

---

### 6.8 Relatórios (`/dashboard/relatorios`)

**Filtros:**
- Período: date range ou seleção rápida (Este mês, Mês anterior, Último trimestre, Este ano)
- Loja/Filial: select múltiplo
- Tipo de recibo: select múltiplo
- Usuário: select (apenas Admin+)
- Botão "Gerar relatório"

**Visualização:**
- Cards de resumo: total de recibos, valor total, ticket médio, tipo mais frequente
- Gráfico de barras: recibos por mês (últimos 6 meses)
- Gráfico de pizza/donut: distribuição por tipo de recibo
- Tabela detalhada: todos os recibos do período com todos os campos
- Mobile: gráficos em formato simplificado, tabela com scroll horizontal

**Exportação:**
- Botão "Exportar Excel" → gera `.xlsx` com aba de resumo + aba detalhada
- Botão "Exportar PDF" → gera relatório em PDF com logo, filtros aplicados, gráficos e tabela
- Botão "Imprimir" → abre janela de impressão

---

### 6.9 Administração — Usuários (`/dashboard/admin/usuarios`)

**Layout:**
- Título "Usuários" + botão "+ Novo usuário" (primary)
- Tabela com: Nome, E-mail, Papel, Loja, Status (Ativo/Inativo), Data de criação, Ações
- Mobile: cards empilhados no lugar de tabela

**Modal de criação/edição:**
- Nome completo
- E-mail
- Papel (select: Admin, Supervisor, Operador)
- Loja/Filial (select)
- Setor (select, dependente da loja)
- Ativo/Inativo (toggle)
- Botão "Salvar" + "Cancelar"

**Regras de acesso:**
- SUPER_ADMIN vê todos os usuários de todas as empresas
- ADMIN vê apenas usuários da sua empresa
- SUPERVISOR e OPERADOR não acessam essa página

---

### 6.10 Administração — Lojas (`/dashboard/admin/lojas`)

**Tabela:** Nome, CNPJ, Endereço, Telefone, Nº de usuários, Status, Ações

**Modal de criação/edição:**
- Nome da loja/filial
- CNPJ (opcional)
- Endereço completo
- Telefone
- E-mail de contato
- Ativa/Inativa (toggle)

---

### 6.11 Administração — Setores (`/dashboard/admin/setores`)

**Tabela:** Nome, Loja, Nº de usuários, Tipos de recibo liberados, Ações

**Modal de criação/edição:**
- Nome do setor
- Loja (select)
- Tipos de recibo liberados: checkboxes para cada tipo

---

## 7. Geração de PDF — Especificação Técnica

### Tecnologia recomendada
Usar `@react-pdf/renderer` para PDFs gerados client-side ou server-side via API Route.

Alternativa para renderização fiel ao HTML: `puppeteer` ou `playwright` no servidor.

### Estrutura do PDF (A4, portrait)

```
┌─────────────────────────────────────┐
│  [LOGO empresa — plano Pro]         │
│  Nome da empresa          ReciboPro │
│  ─────────────────────────────────  │
│  RECIBO DE ALUGUEL          Nº 042  │
│  ─────────────────────────────────  │
│                                     │
│  [corpo do texto em Lora 12pt]      │
│  Eu, João Silva, CPF ...            │
│  declaro ter recebido...            │
│                                     │
│  Valor: R$ 1.500,00                 │
│  (um mil e quinhentos reais)        │
│                                     │
│  Curitiba, 25 de abril de 2026.     │
│                                     │
│  ________________  ________________ │
│  João Silva        Maria Souza      │
│  Locador           Locatária        │
│                                     │
│  ─────────────────────────────────  │
│  Documento gerado por ReciboPro     │
│  recibopro.com.br                   │
└─────────────────────────────────────┘
```

### Marca d'água (plano gratuito)
- Texto "ReciboPro.com.br" em diagonal, opacidade 8%, no centro do documento
- Plano Pro: sem marca d'água, logo da empresa no cabeçalho

### Regras de PDF
- Margem: 2cm em todos os lados
- Fonte: Lora (body) + Sora (títulos)
- Tamanho padrão do body: 12pt
- Linha de assinatura com underline e nome abaixo
- Rodapé com número do recibo e URL do sistema
- Recibo trabalhista: tabela de proventos e descontos com fonte 10pt

---

## 8. Componentes Reutilizáveis

### `<ReceiptTypeSelector />`
Props: `selectedType`, `onChange`, `isAuthenticated`
- Lista de tipos com ícone, nome e badge de acesso
- Estado locked quando não autenticado

### `<DynamicReceiptForm />`
Props: `type`, `onFormChange`, `initialValues?`
- Renderiza campos corretos baseado no tipo
- Integrado com React Hook Form + Zod
- Máscaras automáticas

### `<PdfPreview />`
Props: `formData`, `receiptType`, `companyLogo?`
- Preview em tempo real com debounce
- Botão de download integrado

### `<MetricCard />`
Props: `label`, `value`, `subtext`, `trend?`
- Card de KPI reutilizável no dashboard e relatórios

### `<DataTable />`
Props: `columns`, `data`, `pagination`, `onSort`, `onFilter`
- Tabela genérica com ordenação e filtro
- Scroll horizontal no mobile

### `<FilterBar />`
Props: `filters`, `onApply`, `onClear`
- Barra de filtros responsiva
- Drawer no mobile, inline no desktop

### `<ExportButton />`
Props: `type: 'excel' | 'pdf'`, `onExport`, `loading`
- Botão com estado de loading durante exportação

---

## 9. Autenticação e Controle de Acesso

### Middleware (Next.js)
```typescript
// middleware.ts
// Rotas protegidas: /dashboard/*
// Rotas públicas: /, /exemplo, /gerar, /login, /api/recibos/pdf (sem auth)
// Redirecionar usuário não autenticado em /dashboard para /login
// Redirecionar usuário autenticado em /login para /dashboard
```

### Hierarquia de papéis
| Recurso | Operador | Supervisor | Admin | Super Admin |
|---------|----------|------------|-------|-------------|
| Emitir recibo | ✓ | ✓ | ✓ | ✓ |
| Ver seus recibos | ✓ | ✓ | ✓ | ✓ |
| Ver recibos da loja | ✗ | ✓ | ✓ | ✓ |
| Ver relatórios | ✗ | ✓ | ✓ | ✓ |
| Gerenciar usuários | ✗ | ✗ | ✓ | ✓ |
| Gerenciar lojas | ✗ | ✗ | ✓ | ✓ |
| Gerenciar setores | ✗ | ✗ | ✓ | ✓ |
| Cancelar recibo | ✗ | ✓ | ✓ | ✓ |
| Ver todas as empresas | ✗ | ✗ | ✗ | ✓ |

---

## 10. Regras de Negócio

1. **Numeração de recibos**: Sequencial por empresa, formato `Nº XXXXXX` (6 dígitos com zero à esquerda). Reinicia a cada ano calendário (opcional: configurável).

2. **Plano gratuito**: Sem login, tipos: Aluguel, Serviço, Pagamento Geral. PDF com marca d'água. Sem histórico. Limitado a 10 PDFs por IP/dia (rate limiting).

3. **Plano Pro**: Todos os tipos. PDF sem marca d'água + logo. Histórico ilimitado. Relatórios completos. Múltiplos usuários (até 10). Múltiplas lojas.

4. **Cancelamento de recibo**: Não deleta do banco — muda status para CANCELADO. PDF ainda pode ser baixado com marca "CANCELADO" sobreposta.

5. **Valor por extenso**: Calcular automaticamente em português do Brasil. Ex: 1500.00 → "um mil e quinhentos reais".

6. **CPF/CNPJ**: Validar com algoritmo de dígito verificador. Mostrar erro inline se inválido.

7. **Exportação Excel**: Incluir uma aba "Resumo" com totais e uma aba "Detalhado" com todos os recibos linha por linha.

8. **Exportação PDF de relatório**: Incluir filtros aplicados no cabeçalho, logo da empresa, gráficos renderizados como imagem, tabela paginada.

9. **E-mail de recibo**: Ao enviar por e-mail, anexar o PDF e incluir resumo no corpo da mensagem. Usar Resend ou Nodemailer.

10. **Logo da empresa**: Aceitar PNG/JPG, máximo 2MB, redimensionar para caber no cabeçalho do PDF (max 150x60px).

---

## 11. Acessibilidade

- Todos os inputs com `label` associado via `htmlFor`
- Cores com contraste mínimo WCAG AA (4.5:1 para texto normal)
- Tabelas com `<th scope="col">` e `<caption>`
- Modais com `role="dialog"`, `aria-modal`, `aria-labelledby`, trap de foco
- Navegação por teclado funcional em todos os componentes
- `prefers-reduced-motion`: remover animações se usuário preferir
- Feedback de formulário acessível via `aria-describedby` nos erros

---

## 12. Performance

- Lazy loading de páginas do dashboard (React.lazy + Suspense)
- Imagens da landing page em formato WebP com `next/image`
- Preview do PDF com debounce de 500ms para não recalcular a cada tecla
- Tabelas grandes com virtualização se passar de 100 linhas (react-virtual)
- Caching de relatórios: cache de 5 minutos para relatórios do mesmo período

---

## 13. Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://recibopro.com.br"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email
RESEND_API_KEY="..."
EMAIL_FROM="noreply@recibopro.com.br"

# Storage (logos das empresas)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Pagamentos (Stripe ou Pagar.me)
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
STRIPE_PRO_PRICE_ID="..."

# Rate limiting
UPSTASH_REDIS_URL="..."
UPSTASH_REDIS_TOKEN="..."
```

---

*Documento gerado para ReciboPro — Versão 1.0 — Abril/2026*