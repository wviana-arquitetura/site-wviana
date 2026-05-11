# Home Page — Documentacao Completa

Referencia de tudo que foi implementado na home do site W.VIANA.
Header, footer e providers sao compartilhados — nao serao mais alterados.

---

## 1. Arquitetura Geral

### Stack de Providers (`src/app/layout.tsx`)

```
<html lang="pt-BR">
  <body className="--font-body --font-display bg-background text-foreground">
    <GlobalIntroLoader />        <!-- Intro animation (1x por sessao) -->
    <ArchitecturalGrid />        <!-- Grid decorativo 12 colunas -->
    <QueryProvider>              <!-- TanStack React Query (staleTime: 5min) -->
      <SmoothScrollProvider>     <!-- Lenis smooth scroll + GSAP sync -->
        {children}               <!-- template.tsx > PageTransition > page -->
      </SmoothScrollProvider>
    </QueryProvider>
  </body>
</html>
```

### Fontes (localFont via next/font)

| Variavel       | Fonte          | Pesos        | Uso                   |
|----------------|----------------|--------------|-----------------------|
| `--font-body`  | Aeonik         | 300,400,500,700 | Corpo, paragrafos   |
| `--font-display` | Agrandir Grand | 300,700,800   | Titulos, headings   |

Arquivos em `src/fonts/`.

### Page Transitions (`src/app/template.tsx` + `src/components/providers/PageTransition.tsx`)

- Efeito "A Cortina": overlay taupe (`--accent`) faz wipe da esquerda
- `scaleX: 1 -> 0`, duration 0.7s, ease `power4.inOut`, delay 0.15s
- Conteudo faz `autoAlpha: 0 -> 1` em 0.5s
- Respeita `prefers-reduced-motion`

### Global Intro (`src/components/providers/GlobalIntroLoader.tsx`)

- Toca 1x por sessao (sessionStorage: `wviana:intro-played`)
- Sequencia: linha horizontal (0.8s) > logo fade-in (0.6s) > label (0.5s) > hold (0.5s) > split reveal (top/bottom deslizam para fora, 0.8s)
- Fundo preto, texto branco, linha e label em accent

### Smooth Scroll (`src/components/providers/SmoothScrollProvider.tsx`)

- Lenis: `lerp: 0.08`, `smoothWheel: true`, `syncTouch: true`
- Sincronizado com GSAP ticker
- `lagSmoothing(0)` para frame-rate independente
- Instancia acessivel via `getLenis()` de `src/lib/scroll.ts`

---

## 2. Design Tokens

### Cores (CSS vars em HSL, `src/app/globals.css`)

| Variavel        | HSL Value     | Hex      | Uso                    |
|-----------------|---------------|----------|------------------------|
| `--background`  | 0 0% 95%      | #F2F2F2  | Fundo geral            |
| `--foreground`  | 0 0% 0%       | #000000  | Texto principal         |
| `--accent`      | 27 14% 69%    | #BAAEA4  | Taupe, labels, linhas   |
| `--secondary`   | 27 14% 69%    | #BAAEA4  | Mesmo que accent        |
| `--muted`       | 0 0% 75%      |          | Texto secundario        |

Uso: `hsl(var(--accent))`, `hsl(var(--accent) / 0.4)` para opacidade.

### Tipografia (`tailwind.config.ts`)

| Classe Tailwind    | Tamanho                      | Line-height | Letter-spacing | Uso              |
|--------------------|------------------------------|-------------|----------------|------------------|
| `text-monumental`  | `clamp(4rem, 12vw, 14rem)`  | 0.88        | -0.04em        | Hero, CTA footer |
| `text-architectural` | `clamp(2.5rem, 6vw, 7rem)` | 0.95        | -0.03em        | Manifesto, titulos de projeto |
| `text-body-lg`     | `clamp(1.1rem, 1.5vw, 1.4rem)` | 1.65     | —              | Paragrafos       |
| `text-caption`     | 0.6875rem                    | 1.3         | 0.18em         | Labels pequenos  |
| `text-micro`       | 0.625rem                     | 1.2         | 0.22em         | Metadata, nav    |

### Spacing Responsivo (padrao em todas as secoes)

```
px-8       (mobile, 32px)
md:px-16   (tablet, 64px)
lg:px-24   (desktop, 96px)
```

Max-width geral: `max-w-[1800px]` com `mx-auto`.

### Header Height

```css
--header-height: 3.5rem;  /* mobile (h-12) */
@media (min-width: 768px) {
  --header-height: 4rem;  /* desktop (h-14) */
}
```

### Grid Decorativo

- 12 colunas (`--grid-columns: 12`)
- Cor: `rgba(186, 174, 164, 0.08)`
- z-index 2, pointer-events none
- Coordenadas decorativas: "23.55 S, 46.63 W"

---

## 3. Header (`src/components/layout/site-header.tsx`)

### Estrutura

- Client component, renderizado via `createPortal(_, document.body)`
- z-index `2147483640` (maximo possivel para ficar acima de tudo)
- Altura: `h-12` mobile / `h-14` desktop

### Estados

| Estado              | Trigger                        | Efeito                                    |
|---------------------|--------------------------------|-------------------------------------------|
| `scrolled`          | `scrollY > 80px`               | Glassmorphism: bg semi-transparente + blur(8px) + border |
| `footerDarkProgress` | CustomEvent `footer-theme-progress` | Cor muda para branco quando > 0.01   |
| `isNavigationOpen`  | Zustand store                  | Cor muda para branco, label "[Fechar]"    |

### Cores dinamicas

```
useLightForeground = isNavigationOpen || footerDarkProgress > 0.01

Cor interativa:
  - Light fg: branco (#FFF)
  - Normal: accent (#BAAEA4)

Background scrolled:
  - Light fg: hsl(var(--foreground) / 0.72) — preto translucido
  - Normal: hsl(var(--background) / 0.82) — off-white translucido
```

### Logo

- Imagem: `/images/logos/brand/marca-logotipo-principal.svg`
- Responsive: `w-[10rem]` / `md:w-[12rem]` / `lg:w-[14rem]`
- z-index: `2147483647` (acima de tudo)
- Hover: `opacity-60`

### Botao de menu

- Texto: `[Index]` / `[Fechar]`
- Estilo: `text-micro`, uppercase
- ARIA: `aria-expanded`, `aria-controls="site-navigation-drawer"`

---

## 4. Navigation Drawer (`src/components/layout/navigation-drawer.tsx`)

### Rotas

| Index | href       | Label    |
|-------|------------|----------|
| 01    | /works     | Projetos |
| 02    | /process   | Processo |
| 03    | /studio    | Estudio  |
| 04    | /contact   | Contato  |

### Visual

- Full-screen, z-index `9998`, fundo `bg-foreground` (preto)
- Links: branco, `clamp(2.5rem, 7vw, 6rem)`, `font-extralight`
- Index numbers: accent color
- Contato no rodape: email, WhatsApp, Instagram, Pinterest

### Animacoes (GSAP)

**Abrir:**
1. Backdrop: `xPercent: 100 -> 0` (0.7s, `power3.inOut`)
2. Links: `autoAlpha:0, y:30 -> 1, 0` (0.6s, stagger 0.08s, `power2.out`)

**Fechar:**
1. Links: `autoAlpha:0, y:-20` (0.3s, stagger 0.04s, `power2.in`)
2. Backdrop: `xPercent: 100` (0.6s, `power3.inOut`)

### Acessibilidade

- `role="dialog"`, `aria-modal="true"`
- Focus trap: Tab circular entre elementos focaveis
- Escape fecha
- Retorna foco ao botao trigger ao fechar
- Body scroll lock: `overflow: hidden`
- Fecha ao mudar de rota (`usePathname`)

---

## 5. Footer (`src/components/layout/site-footer.tsx`)

### Transicao de Tema (Light -> Dark)

O footer implementa uma transicao progressiva de cores via ScrollTrigger:

```
ScrollTrigger:
  trigger: footer
  start: "top bottom"     (footer aparece na viewport)
  end: "top 30%"          (footer chega a 30% do topo)
  scrub: true

Calculo:
  bgLightness = 97 * (1 - progress)    // 97% -> 0% (off-white -> preto)
  textLightness = 100 * progress       // 0% -> 100% (preto -> branco)

Alvos de background: document.body, <main>, todos .bg-background
Alvos de texto: todos .footer-primary-text dentro do footer
```

**Comunicacao com Header:**
- CSS var: `--footer-dark-progress` (0-1) no `:root`
- CustomEvent: `window.dispatchEvent(new CustomEvent("footer-theme-progress", { detail: { progress } }))`

### Layout

**Secao principal** — min-height `calc(100dvh - var(--header-height))`:
- Label: "Proximo passo" (accent, micro)
- Titulo: "Vamos projetar." (monumental, font-light, classe `footer-primary-text`)
- Email: `contato@wvarq.com` (architectural, border-bottom accent)
- WhatsApp: link externo (architectural, border-bottom accent)
- Watermark: logo `/images/logos/brand/marca-variacao-07.svg`, opacity 16%, `filter: invert(1)`, `translateX(14%)`

**Secao copyright** — border-top accent 15%:
- "(c) 2026 W.VIANA Arquitetura | Interiores"
- Links: Instagram, Pinterest (accent 60%)
- Layout: coluna mobile / row desktop

---

## 6. Secoes da Home (em ordem)

### Composicao (`src/app/page.tsx`)

```jsx
<div className="min-h-screen bg-background text-foreground">
  <SiteHeader />
  <main>
    <ThresholdHero />           {/* h-screen */}
    <Void height="20vh" />
    <StatementSection />        {/* min-h-screen, pinned */}
    <Void height="15vh" />
    <GalleryWalkSection />      {/* snap scroll */}
    <Void height="15vh" />
    <HorizonSection />          {/* min-h-[60vh] */}
  </main>
  <SiteFooter />
</div>
```

### 6.1 ThresholdHero (`src/components/sections/v2/threshold-hero.tsx`)

**O que faz:** Hero full-screen com titulo "W.VIANA" em reveal letra-a-letra.

**Conteudo:**
- Titulo: "W.VIANA" (`text-monumental`, font-light, letter-spacing 0.15em)
- Subtitulo: "Arquitetura | Interiores" (micro, accent)
- Bottom-left: indicador de scroll (linha pulsante + "Scroll")
- Bottom-right: "Fortaleza, CE"

**Animacoes:**
1. Letras: cada `<span class="hero-char">` revela via `clipPath: inset(100% 0 0 0) -> inset(0% 0 0 0)` + opacity
   - Duration: 0.8s, stagger: 0.06s, ease: `power3.out`, delay: 0.2s
2. Subtitulo: `autoAlpha: 0 -> 1`, 1.0s, `power2.out`, delay: 1.4s
3. Saida por scroll: `autoAlpha: 0`, `scale: 0.96`, scrub: 1, start: "top top", end: "bottom top"

### 6.2 StatementSection (`src/components/sections/v2/statement-section.tsx`)

**O que faz:** Manifesto com reveal palavra-por-palavra enquanto secao fica pinada.

**Conteudo:**
- Label: "Manifesto" (micro, accent)
- Texto: "Projetamos o sentir. O conforto entre as paredes. O espaco reflete quem voce e."
- Palavras especiais (italic, secondary color): "sentir", "conforto", "voce"
- Atribuicao: "Wellington Viana, Fundador" (caption, accent)

**Layout:**
- `min-h-screen`, `bg: hsl(var(--background-warm))`
- Container: `max-w-[1800px]`, texto: `max-w-[1200px]` com `md:ml-[15%]`
- Fonte do manifesto: `text-architectural`, font-weight 300, font-family body (Aeonik)

**Animacao:**
- ScrollTrigger: `pin: true`, `start: "top top"`, `end: "+=150%"`, `scrub: 1`
- Cada palavra: opacity `0.08 -> 1`, duration 1, offset `+=0.06` na timeline

### 6.3 GalleryWalkSection (`src/components/sections/v2/gallery-walk-section.tsx`)

**O que faz:** Galeria de projetos com snap scrolling inteligente.

**Dados:** `getAllProjects()` de `src/services/projects.service.ts` (JSON em `src/data/projects.json`)

**Layout:**
- `px-8 py-24 / md:px-16 md:py-32 / lg:px-24 lg:py-48`
- Container: `max-w-[1800px]`
- Cada card: `min-h-[calc(100dvh-var(--header-height))]`, marcado com `data-snap`
- Espacamento entre cards: `<Void height="12vh" />`

**Reveal:** usa `useArchitecturalReveal(sectionRef)` — todas as classes `.reveal-*` dentro da secao sao animadas automaticamente.

**Snap Logic (custom, nao CSS scroll-snap):**
- Debounce: 160ms apos parar de scrollar
- Detecta direcao (up/down) comparando `scrollY`
- **Down:** card com top entre header e 80% da viewport -> snap para ele. Card "peeking" (80-100%) -> snap para esconder.
- **Up:** card mais proximo do header na metade superior -> snap para ele.
- Usa `getLenis().scrollTo(target, { duration: 1.2, easing: quartic })`

### 6.4 GalleryProjectCard (`src/components/project/v2/gallery-project-card.tsx`)

**Props:** `{ project: Project, index: number }`

**Layout:** Flex column mobile / row desktop (30% metadata | 70% conteudo)

**Coluna esquerda (metadata):**
- Numero (01, 02...), titulo, typology, location+country, year
- Tudo `text-micro`, uppercase, accent color
- Container com classe `reveal-stagger`

**Coluna direita (conteudo):**
- Imagem: `h-[55vh]`, `reveal-curtain` (clipPath horizontal)
- Titulo: `text-architectural`, `font-extrabold`, `reveal-rise`
- Summary: `text-body-lg`, `text-muted-foreground`, `reveal-illuminate`
- Link: "Ver projeto" com seta SVG, `reveal-illuminate`

**Linha superior:** `reveal-draw`, 1px, accent 30%

### 6.5 HorizonSection (`src/components/sections/v2/horizon-section.tsx`)

**O que faz:** Estatisticas com linha horizontal animada.

**Conteudo:**
- Texto: "48+ projetos entregues. 7 anos de pratica." (caption, accent)
- Linha: `max-w-[800px]`, 1px, accent 40%

**Animacao:**
- Linha: `scaleX: 0 -> 1`, `transformOrigin: left`
- ScrollTrigger: `start: "top 80%"`, `end: "bottom 50%"`, `scrub: 1`, ease: `none`

### 6.6 Void (`src/components/ui/void.tsx`)

Spacer simples. Props: `height` (default "20vh"), `className`. Renderiza `<div aria-hidden>`.

---

## 7. Sistema de Animacoes

### 7.1 GSAP Setup (`src/lib/gsap.ts`)

```typescript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export { ScrollTrigger };
export default gsap;
```

**SEMPRE** importar de `@/lib/gsap`, nunca direto de `gsap`.

### 7.2 Architectural Reveal (`src/hooks/v2/use-architectural-reveal.ts`)

Hook que aplica animacoes de scroll a elementos com classes CSS especificas:

| Classe              | De                            | Para                         | Duracao | Ease         | Trigger  |
|---------------------|-------------------------------|------------------------------|---------|--------------|----------|
| `.reveal-illuminate`| opacity: 0.06                 | opacity: 1                   | 1.4s    | power2.out   | top 88%  |
| `.reveal-rise`      | autoAlpha: 0, y: 20           | autoAlpha: 1, y: 0           | 1.0s    | power2.out   | top 88%  |
| `.reveal-curtain`   | clipPath: inset(0 100% 0 0)   | clipPath: inset(0 0% 0 0)    | 1.2s    | power3.inOut  | top 82%  |
| `.reveal-draw`      | scaleX: 0                     | scaleX: 1                    | 0.8s    | power2.out   | top 90%  |
| `.reveal-stagger`   | autoAlpha: 0, y: 20           | autoAlpha: 1, y: 0           | 1.0s    | power2.out   | top 86%  |

- `.reveal-stagger` agrupa por parent e aplica `stagger: 0.12s` entre siblings
- Todos: `once: true` (executa 1x)
- Respeita `prefers-reduced-motion`
- Chama `ScrollTrigger.refresh()` apos setup

**CSS will-change hints** (em `globals.css`):
- `.reveal-illuminate`: `will-change: opacity`
- `.reveal-rise`, `.reveal-stagger`: `will-change: transform, opacity; transform: translateZ(0)`
- `.reveal-curtain`: `will-change: clip-path`
- `.reveal-draw`: `will-change: transform; transform-origin: left`

**Uso:**
```tsx
const sectionRef = useRef<HTMLElement>(null);
useArchitecturalReveal(sectionRef);
// Todos os filhos com .reveal-* serao animados
```

### 7.3 Scroll Driven Reveal — Legacy (`src/hooks/use-scroll-driven-reveal.ts`)

Hook alternativo com 12+ tipos de animacao via seletores `.js-*`. **Nao usado na home**, mas disponivel para outras paginas.

| Seletor               | Efeito                                    |
|-----------------------|-------------------------------------------|
| `.js-reveal`          | fade + translateY (28px, 0.9s)            |
| `.js-card`            | stagger fade + translateY (42px, 0.85s)   |
| `.js-image-reveal`    | clipPath inset vertical (18%, 1.15s)      |
| `.js-blur-reveal`     | fade + blur(10px) + translateY (0.9s)     |
| `.js-scale-reveal`    | fade + scale 0.92->1 (1.0s)              |
| `.js-slide-left`      | fade + x:-60 (0.85s)                     |
| `.js-slide-right`     | fade + x:60 (0.85s)                      |
| `.js-line-reveal`     | yPercent lines (1.2s, stagger 0.08s)     |
| `.js-parallax-media`  | parallax em `.js-parallax-image` (scrub)  |
| `.js-scrub-title`     | yPercent -22% + fade (scrub)             |
| `.js-scroll-scale`    | scale 0.85->1 (scrub)                    |
| `.js-section-fade`    | autoAlpha 0.3 + y:-30 (scrub)            |

**Uso:**
```tsx
const sectionRef = useRef<HTMLElement>(null);
useScrollDrivenReveal(sectionRef, "", { revealSelector: ".js-reveal" });
```

### 7.4 Easings usados no projeto

| Easing         | Onde                                          |
|----------------|-----------------------------------------------|
| `power2.out`   | Maioria dos reveals, subtitle                 |
| `power3.out`   | Hero chars, blur reveal                       |
| `power3.inOut` | Curtain, navigation drawer                    |
| `power4.inOut` | Page transition, intro split                  |
| `power2.in`    | Drawer close links                            |
| `power2.inOut` | Intro line                                    |
| `none`         | Scrub animations (linear)                     |
| `expo.out`     | Line-by-line reveal (legacy)                  |

---

## 8. Dados & Tipos

### Project (`src/types/project.ts`)

```typescript
type Project = {
  slug: string;          // "casa-aurora"
  title: string;
  category: string;      // "Residencial"
  typology: "Residential" | "Hospitality" | "Workplace" | "Retail";
  status: "Completed" | "In progress";
  location: string;      // "Sao Paulo"
  country: string;       // "BR"
  year: string;          // "2026"
  imageSrc: string;      // "/images/projects/..."
  summary: string;
  scope: string[];
  client: string;
  chapters: ProjectChapter[];
  metrics: ProjectMetric[];
  gallery: ProjectGalleryItem[];
  testimonial: ProjectTestimonial;
};
```

### Service (`src/services/projects.service.ts`)

| Funcao                      | Retorno           | Uso                          |
|-----------------------------|-------------------|------------------------------|
| `getAllProjects()`          | `Project[]`       | Lista completa               |
| `getProjectBySlug(slug)`   | `Project \| null` | Pagina de detalhe            |
| `getRelatedProjects(slug)` | `Project[]`       | Projetos do mesmo typology   |
| `getNextProject(slug)`     | `Project \| null` | Proximo (circular)           |
| `fetchProjects()`          | `Promise<Project[]>` | Wrapper async             |
| `getProjectTypologies()`   | `ProjectTypology[]` | Typologias unicas          |

### React Query (`src/hooks/use-projects.ts`)

Wrapper client-side com `useQuery`. Config: `staleTime: 5min`, `refetchOnWindowFocus: false`.

---

## 9. Estado Global

### Zustand (`src/store/use-ui-store.ts`)

```typescript
type UiState = {
  isNavigationOpen: boolean;
  setNavigationOpen: (open: boolean) => void;
  toggleNavigation: () => void;
};
```

Consumido por: `SiteHeader`, `NavigationDrawer`.

### Brand Constants (`src/lib/brand.ts`)

```typescript
BRAND = {
  name: "W.Viana | Arquitetura",
  email: "contato@wvarq.com",
  siteUrl: "https://wviana.com.br",
  whatsappPhone: "5585996202796",
  whatsappUrl: "https://wa.me/5585996202796?text=...",
  location: "Fortaleza, CE",
  instagramUrl: "https://www.instagram.com/",
  pinterestUrl: "https://br.pinterest.com/wviana_arq/",
};
```

---

## 10. Hierarquia de Z-Index

| Z-Index       | Componente               |
|---------------|--------------------------|
| 2147483647    | Logo image               |
| 2147483646    | Logo link                |
| 2147483640    | Header container         |
| 9998          | Navigation drawer        |
| 80            | Intro loader overlay     |
| 79            | Intro loader panels      |
| 50            | Page transition overlay  |
| 10            | Page transition content  |
| 2             | Architectural grid       |
| 1 (relative)  | Footer                   |

---

## 11. Guia para Novas Paginas

### Reutilizar (ja funciona automaticamente)

- Header + Footer + Navigation Drawer (no layout)
- Providers: GlobalIntroLoader, SmoothScrollProvider, QueryProvider, PageTransition
- Design tokens: cores, tipografia, spacing
- `Void` como spacer
- Ambos os hooks de reveal: `useArchitecturalReveal` (classes `.reveal-*`) e `useScrollDrivenReveal` (classes `.js-*`)
- `BRAND` constants para links e contato
- Servico de projetos para dados

### Nao repetir (exclusivos da home)

- Hero com reveal letra-a-letra (ThresholdHero)
- Manifesto com pin + reveal palavra-por-palavra (StatementSection)
- Gallery com snap scroll customizado (GalleryWalkSection)
- Estatisticas com linha animada (HorizonSection)

### Padroes a seguir

- **GSAP:** sempre importar de `@/lib/gsap`
- **Lenis:** via `getLenis()` de `@/lib/scroll`
- **Padding:** `px-8 / md:px-16 / lg:px-24`
- **Container:** `mx-auto max-w-[1800px]`
- **Acessibilidade:** `prefers-reduced-motion`, ARIA attributes, semantic HTML
- **Cleanup:** `gsap.context()` com `ctx.revert()` no return do useLayoutEffect
- **Labels:** `text-micro`, uppercase, `tracking-[0.22em]`, cor accent
- **ScrollTrigger cleanup:** sempre dentro de `gsap.context(_, root)`

### Estrutura de componente padrao

```tsx
"use client";

import { useRef, useLayoutEffect } from "react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { useArchitecturalReveal } from "@/hooks/v2/use-architectural-reveal";

export function MinhaSecao() {
  const sectionRef = useRef<HTMLElement>(null);
  useArchitecturalReveal(sectionRef);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // animacoes GSAP aqui
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="px-8 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1800px]">
        {/* conteudo com classes .reveal-* */}
      </div>
    </section>
  );
}
```
