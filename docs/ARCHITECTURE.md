# Arquitetura

Visão técnica do projeto pra quem for navegar o repositório. O README traz o panorama; aqui fica o mapa detalhado de onde cada coisa vive.

## Comandos

O gerenciador de pacotes é **pnpm** (só existe `pnpm-lock.yaml`).

```bash
pnpm dev                 # dev server (Next.js)
pnpm build               # build de produção
pnpm lint                # ESLint
pnpm format              # Prettier
pnpm backfill:blurhash   # gera BlurHash pra imagens anteriores ao pipeline
```

Não há testes automatizados no projeto. Deploy em produção é pela integração nativa da Vercel; o workflow `.github/workflows/deploy.yml` está desativado de propósito (plano B caso o repo vire privado).

## Arquitetura

**Next.js 16 App Router** com duas superfícies no mesmo app: o site público do escritório W.VIANA (home, projetos, processo, sobre, contato) e o painel de conteúdo em `/admin`, usado pelo próprio cliente.

### Camada de dados (Supabase)

O conteúdo vive no Postgres do Supabase — tabelas `projects`, `project_gallery_images`, `home_featured`, `admin_users`, `admin_invites`, `admin_access_requests` e `audit_log`. Schema completo (com RLS) em `supabase/migrations/`.

- `src/services/projects.service.ts` — único ponto de leitura pública. Busca projetos + galerias + destaques e embrulha tudo em `unstable_cache` com tags `projects` / `home_featured` (revalidate de fallback: 3600s). Home, listagem, página de projeto e sitemap consomem a mesma função.
- Fluxo editorial **draft → published**: a query pública filtra `published_status = 'published'`. Salvar no painel não afeta o site; as actions de publicar/despublicar/excluir/reordenar/destaques chamam `updateTag` + `revalidatePath` — publicar é invalidar cache, não redeploy.
- `getAllProjectsForAdmin()` (mesmo arquivo) lê sem cache, incluindo drafts.
- `rowToProject` em `src/lib/supabase/types.ts` mapeia rows → tipo `Project` (`src/types/project.ts`).
- `src/lib/supabase/`: `client.ts` (browser), `server.ts` com dois clients — `createSupabaseServerClient` (cookies de sessão, respeita RLS) e `createSupabaseServiceRoleClient` (bypass de RLS; SÓ em código server confiável, nunca no client) — e `middleware.ts` (`updateSession`).

### Painel `/admin`

- **Auth**: Google OAuth via Supabase Auth + allowlist na tabela `admin_users`. `src/proxy.ts` (o middleware do Next 16) renova a sessão a cada request e barra `/admin` sem login; **cada server action revalida a permissão de novo** (`requireAdmin`/`requireOwner` em `_actions/guards.ts`). RLS é a última camada.
- **Papéis**: `owner` gerencia usuários em `/admin/usuarios` (área invisível pra `editor`); `editor` só edita conteúdo.
- **Convites** (migration 0004): `admin_users.id` tem FK pra `auth.users.id`, então ninguém pode ser cadastrado antes do primeiro login. O owner convida pelo e-mail (`admin_invites`, RLS sem policies — só service role enxerga); no primeiro login, o `/auth/callback` chama `promotePendingInvite` (`src/services/admin-users.service.ts`), que insere em `admin_users` com o papel do convite, apaga o convite e audita (`first_login`). Proteções: actions impedem auto-remoção e remover/rebaixar o último owner; o trigger `protect_last_owner` garante isso no banco mesmo via service role.
- **Solicitações de acesso** (migration 0005): quem entra com o Google e é barrado pode pedir acesso na tela de login (`requestAccessAction` em `_actions/auth.ts` — usa o uuid/e-mail da sessão, nada digitado; tabela `admin_access_requests`, service-role only, um pedido por conta). Como o uuid já existe em `auth.users`, aprovar em `/admin/usuarios` insere direto em `admin_users` (como editor) e o acesso vale na hora, sem novo login.
- **Server actions** em `src/app/admin/_actions/` (`projects.ts`, `users.ts`, `upload.ts`, `auth.ts`) — validação com zod, retorno `ActionResult` com `fieldErrors`.
- **Auditoria**: toda escrita chama `recordAudit` (`src/lib/audit.ts`). Edições gravam diff campo a campo (`src/components/admin/project-changes-diff.ts`); exclusões gravam snapshot completo do projeto. Append-only: a tabela não tem policy de escrita via RLS, só a service role insere. UI em `/admin/logs`. Manter esse padrão em actions novas.
- **UX de edição**: `use-admin-dirty-store` (zustand) + `use-unsaved-changes-guard` + `confirm-leave-dialog`/`guarded-link` interceptam saída com alterações não salvas; `changes-preview-dialog` mostra o diff antes de salvar; galeria com upload múltiplo, drag-and-drop (dnd-kit) e lightbox de conferência; destaques da home (3 projetos ordenados) em `/admin/home`.

### Pipeline de imagens

Duas etapas, uma única perda (evita generation loss em degradês de céu/sombra):

1. **Client** (`src/lib/image-compress.ts`): canvas SÓ redimensiona (teto 3200px, q0.95 quase-lossless) pra não trafegar a foto crua até a action. `MAX_UPLOAD_BYTES` (20MB) casa com `serverActions.bodySizeLimit` do `next.config.ts`.
2. **Server** (`_actions/upload.ts`): sharp é a única fonte da compressão final — WebP q85, max 3200px — e sobe pro bucket `project-images` com cache de 1 ano. Gera o BlurHash em paralelo ao upload.

**BlurHash**: hash (~24 chars) gravado no banco; `src/lib/blurhash-server.ts` decodifica pra data URL PNG 32px dentro do mesmo `unstable_cache` — o placeholder vai no HTML inicial, antes da hidratação. `blurhash-client.ts` é o decoder de canvas pro client. Legados sem hash: `scripts/backfill-blurhash.mjs`.

`next.config.ts`: `images.qualities` [78, 80, 82, 85] (no Next 16 a prop `quality` do `<Image>` só aceita valores listados) e `remotePatterns` pro storage do Supabase.

### Animações

GSAP com ScrollTrigger. Sempre importar de `src/lib/gsap.ts` (ponto único de registro de plugin), nunca de `gsap` direto. Lenis pra smooth scroll via `smooth-scroll-provider` (sincronizado: `lenis.on("scroll", ScrollTrigger.update)`). Transições de página em `src/components/providers/page-transition.tsx` via `src/app/template.tsx`. Toda seção animada checa `prefers-reduced-motion` e desiste se o usuário pediu menos movimento — manter esse padrão em animações novas.

### Providers (layout.tsx)

1. Scripts inline pré-hidratação: limpeza de atributos injetados por extensões (evita hydration mismatch) e Consent Mode default `denied`
2. `PageViewTracker` + GTM (só carrega com `NEXT_PUBLIC_GTM_ID`)
3. `GlobalIntroLoader` — intro/loader do site
4. `SmoothScrollProvider` (Lenis) → `SiteChrome` → páginas
5. `CookieConsent`, Vercel `SpeedInsights` + `Analytics`

### Estado

Zustand: `src/store/use-ui-store.ts` (menu mobile) e `src/store/use-admin-dirty-store.ts` (alterações não salvas do painel).

### Styling

- Tailwind CSS; tokens da marca como CSS custom properties em `src/app/globals.css`
- Tipografia (manual de marca): `next/font/local` em `src/app/layout.tsx` — **Aeonik** (`src/fonts/AeonikTRIAL-*.otf`) → `--font-body` / `font-sans`; **Agrandir Narrow** (`src/fonts/Agrandir-Narrow.otf`) → `--font-display` / headings em `globals.css`
- Cores da marca: `#000000`, `#BAAEA4` (warm taupe), `#F2F2F2` (off-white)
- Componentes estilo shadcn/ui em `src/components/ui/`

### Rotas

Públicas:
- `/` — home (seções animadas em `src/components/sections/`; os 3 destaques vêm de `home_featured`)
- `/projetos` — listagem com filtro por tipologia; `/projetos/[slug]` — detalhe (pré-renderizado via `generateStaticParams`)
- `/processo`, `/sobre`, `/contato`, `/privacidade`, `/termos`
- `/contato/obrigado` — noindex, fora do sitemap; URL de conversão fallback pro Google Ads
- `/api/contact` — recebe o lead, envia e-mail (Resend) e grava na planilha (Apps Script) com `Promise.allSettled` (um destino falhar não perde o lead). Rate-limit 5 req/min/IP + honeypot silencioso

Admin: `/admin/login`, `/admin/projetos` (+ `/novo`, `/[id]`), `/admin/home`, `/admin/usuarios` (só owner), `/admin/logs`, `/auth/callback` (retorno do OAuth + promoção de convites).

### SEO

Helper `pageMeta` em `src/lib/seo.ts`; imagens OG geradas por `opengraph-image.tsx` por rota; JSON-LD de organização; sitemap (`src/app/sitemap.ts`) montado a partir do banco, com `lastModified` real por projeto.

### Analytics & captura de leads

Veja `docs/ANALYTICS_TRACKING.md` para o panorama de eventos, Consent Mode e responsabilidades.
- `src/lib/analytics.ts` — `trackEvent` / `trackPageView` via `window.dataLayer` (GTM)
- `src/lib/consent.ts` — Consent Mode v2: leitura/persistência no localStorage e `gtag('consent','update', …)`
- `src/components/analytics/cookie-consent.tsx` — banner inferior (Aceitar/Recusar). Espera a hero (`[data-section="hero"]`) sair da viewport antes de aparecer
- `src/components/analytics/page-view-tracker.tsx` — dispara `page_view` em cada navegação (App Router não emite automaticamente)
- `src/lib/contact-lead.ts` — wrapper `submitContactLead` (fire-and-forget, usa `keepalive` pra sobreviver ao `window.open` do WhatsApp)
- `src/lib/rate-limit.ts` — sliding window em memória (Map); em serverless, considerar Upstash/KV se o site escalar

### Variáveis de ambiente

Ver `.env.example`. Principais:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — leitura pública e auth do painel
- `SUPABASE_SERVICE_ROLE_KEY` — bypass de RLS; só em server actions/scripts, NUNCA no client
- `NEXT_PUBLIC_GTM_ID` — sem isso, GTM não carrega e o tracking fica inerte (útil pra dev)
- `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL` — envio do lead por e-mail
- `LEADS_SHEET_WEBHOOK_URL` — Apps Script que grava na planilha
