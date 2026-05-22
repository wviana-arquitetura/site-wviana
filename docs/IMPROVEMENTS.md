# Melhorias futuras — site W.VIANA

Lista de melhorias mapeadas para o site institucional do escritório. Foco em valor para o cliente final (escritório de arquitetura) e para o visitante que vira lead.

Cada item tem uma estimativa grosseira de esforço e o impacto esperado. A ordem dentro de cada bloco não é prioridade — é só agrupamento temático.

## Conversão e confiança

### 1. Depoimentos / cases de clientes
Arquitetura vende via prova social. O site hoje mostra projetos, mas não mostra a fala de quem contratou.
- **Esforço:** ~2h se o cliente já tem material gravado/escrito
- **Impacto:** alto — toca diretamente na decisão "posso confiar?"

### 2. Página de processo mais concreta
Se a página `/processo` tiver etapas, prazos típicos e entregáveis de cada fase, reduz a fricção de "será que serve pro meu caso?".
- **Esforço:** ~3h
- **Impacto:** médio — qualifica leads antes do contato

### 3. Estimativa de prazo e investimento
Não precisa preço fechado. "Projetos a partir de 90 dias" / "investimento sob consulta a partir de X" já filtra leads e qualifica.
- **Esforço:** ~1h (só conteúdo, sem código novo)
- **Impacto:** médio — diminui contatos descalibrados

## SEO e aquisição

### 4. Páginas de cidade/região
Criar landing pages do tipo "arquitetura em Fortaleza", "arquiteto em Aldeota", "projetos residenciais no Ceará". Captura busca local.
- **Esforço:** ~3h por cidade (template + conteúdo)
- **Impacto:** alto a longo prazo — SEO local converte bem

### 5. Schema enriquecido em projetos
Adicionar `BreadcrumbList` na detail de projeto e `ImageObject` nas fotos. Melhora rich results no Google.
- **Esforço:** ~1h
- **Impacto:** baixo a médio — depende do volume de busca de imagem

### 6. Sitemap com lastmod por projeto
Hoje o `sitemap.ts` usa o `mtime` do `projects.json` como lastmod de tudo. Cada projeto poderia ter sua data própria (campo `updatedAt` no JSON), pra o Google reindexar só o que mudou.
- **Esforço:** ~1h
- **Impacto:** baixo

### 7. Conteúdo evergreen
1-2 posts tipo "como escolher arquiteto" / "etapas de um projeto residencial" / "diferença entre arquiteto e designer de interiores". Atrai busca informacional que pode virar lead.
- **Esforço:** ~4h por post (estrutura + escrita)
- **Impacto:** médio a longo prazo

## Performance

### 8. AVIF para imagens de projetos
`next/image` suporta AVIF (~30% menor que WebP) — basta configurar `images.formats` no `next.config`.
- **Esforço:** ~30min
- **Impacto:** baixo a médio — melhora LCP em mobile lento

### 9. Preload da hero image e fontes
Preload explícito da primeira imagem visível e das variáveis de fonte usadas above-the-fold. Melhora LCP.
- **Esforço:** ~1h
- **Impacto:** baixo a médio — depende do estado atual do Lighthouse

## UX que vira venda

### 10. CTA "Agendar visita" com Cal.com / Calendly
Visitante quente marca diretamente em vez de mandar mensagem e esperar resposta. Cal.com self-hosted ou plano free dá conta.
- **Esforço:** ~1h (integração + embed)
- **Impacto:** alto — agendamentos convertem melhor que forms

### 11. Tempo médio de resposta no FloatingContact
"Costumamos responder em 2h" ou similar perto do botão flutuante de WhatsApp. Reduz a sensação de "vou mandar e nunca vão me responder".
- **Esforço:** ~30min
- **Impacto:** baixo a médio

### 12. Galeria mais rica em projeto
- Antes/depois com slider
- Plantas baixas (linhas, não fotos)
- Mapa do imóvel (Google Maps embed ou imagem estática)
- **Esforço:** ~4h
- **Impacto:** médio — aumenta tempo de permanência e qualidade percebida

## Operacional para o cliente

### 13. Dashboard simples de leads
Em vez de email + planilha, página `/admin` privada (com basic auth ou Vercel Password Protection) listando leads do mês com filtros por data, tipo de projeto, etc.
- **Esforço:** ~1 dia
- **Impacto:** médio — facilita follow-up do cliente

### 14. Webhook para WhatsApp Business
Hoje o form leva pro `wa.me` (WhatsApp pessoal). Migrar para WhatsApp Business com webhook permite resposta automática + integração com CRM.
- **Esforço:** ~1 dia (requer aprovação Meta + provisionamento)
- **Impacto:** médio a alto

## Compliance e legal

### 15. Política de privacidade e termos de uso ✅
**Concluído** — páginas `/privacidade` e `/termos` publicadas, banner aponta para `/privacidade`, footer com CNPJ.

## Marketing — próximos passos

Pacote de configurações e integrações de marketing pensadas como evolução do que já foi configurado (GA4, GTM, Search Console). Cada item agrega à stack existente sem refatoração.

### Já configurado nesta sessão (2026-05-22)
- ✅ **GA4** (`G-FGR3V7PTSW`) coletando eventos com Consent Mode v2
- ✅ **GTM** (`GTM-WD6CCB46`) publicado, tag GA4 disparando em Initialization
- ✅ **Resend** + Google Sheets capturando leads do formulário em produção
- ✅ **Google Search Console** — propriedade verificada (Domínio), sitemap.xml enviado (20 páginas indexadas), vinculado ao GA4

### M1. Marcar eventos como Key Event no GA4
GA4 já recebe `whatsapp_click`, `whatsapp_form_submit`, `email_click`, `project_view`, `project_cta_click`. Falta marcar os relevantes como Key Event pra virarem conversão oficial e habilitarem comparação por canal.
Caminho: GA4 → Admin → Eventos → checkbox "Marcar como Key Event" nos eventos de conversão.
- **Esforço:** ~5min (no painel, sem código)
- **Impacto:** médio — habilita relatórios de conversão por canal e (futura) integração com Google Ads

### M2. Microsoft Clarity (heatmap + gravações)
Ferramenta gratuita e ilimitada da Microsoft. Gera mapas de calor de clique/scroll e grava sessões anônimas. Insight rápido sobre onde os visitantes travam, especialmente útil em site novo sem histórico de comportamento.
Cadastra em [clarity.microsoft.com](https://clarity.microsoft.com), pega o tracking ID, adiciona como Custom HTML tag no GTM com gatilho "Initialization - All Pages" (mesmo padrão da tag GA4).
- **Esforço:** ~10min
- **Impacto:** médio a alto — descobre problemas de UX que não aparecem em métricas agregadas
- **Dependência:** já coberto pela política de privacidade existente (gravação anonimizada, cookies declarados)

### M3. Meta Pixel + Conversions API
Item 20 acima detalhado: instalar Pixel via GTM e, idealmente, Conversions API server-side (na mesma route `/api/contact`) para enviar `Lead` event ao Meta com hash do e-mail. Habilita remarketing, lookalike e campanhas otimizadas pra conversão no Instagram/Facebook Ads.
- **Esforço:** ~2h (Pixel via GTM + CAPI server-side com `fetch` na route)
- **Impacto:** alto se houver verba de Meta Ads — sem isso anúncio roda no escuro
- **Quando fazer:** antes de iniciar qualquer campanha paga no Meta

### M4. Google Ads conversion tracking
Item 17 (Enhanced Conversions) já cobre o avançado. O passo zero é criar a tag de conversão no Google Ads para `whatsapp_form_submit` e importar como Key Event vindo do GA4. Sem isso, campanhas Google Ads não conseguem otimizar pra lead — só por clique.
- **Esforço:** ~15min (Google Ads + GTM)
- **Impacto:** alto se houver verba de Google Ads
- **Quando fazer:** antes de iniciar qualquer campanha paga no Google

### M5. Newsletter / captura de e-mail recorrente
Cliente médio de arquitetura demora 6-12 meses pra decidir. Visitante que ainda não está pronto não tem onde deixar contato sem compromisso. Adicionar formulário simples ("Receba projetos novos no e-mail") cria canal próprio independente de algoritmo.
Pode reaproveitar Resend (já configurado) + tabela do Google Sheets pra armazenar inscritos, ou usar Mailchimp/Brevo free tier. Newsletter mensal manual com 1 projeto + 1 dica de design.
- **Esforço:** ~6h (componente + integração + página de confirmação)
- **Impacto:** médio a longo prazo — nutre lead frio até a hora da decisão
- **Quando fazer:** após atingir ~5k visitas/mês (antes disso o crescimento da lista é lento demais)

### M6. Blog / conteúdo evergreen estruturado
Item 7 acima é a versão pontual ("1-2 posts"). Aqui é a estrutura: CMS simples (MDX local ou Sanity/Contentful free) + listagem `/blog` + páginas individuais com schema `Article`. Permite produção contínua sem mexer no código a cada post.
- **Esforço:** ~16h (CMS + tema + 3 posts iniciais)
- **Impacto:** alto a longo prazo (6-12 meses pra render) — único caminho sustentável de SEO orgânico contra escritórios maiores
- **Pré-requisito:** comprometimento de escrita de 1-2 posts/mês por pelo menos 12 meses

## Google Ads (lado do código)

Preparação técnica do site para campanhas. A configuração nas contas Google (vincular GA4↔Ads, importar conversões, auto-tagging, Consent Mode nas tags) é responsabilidade do gestor de tráfego.

### 16. UTM listener nos eventos e no lead
Capturar `utm_source/medium/campaign/term/content` ao chegar no site e propagar nos eventos do GTM e no e-mail/planilha do lead. Sem isso o cliente não sabe de qual campanha veio o lead.
- **Esforço:** ~1h
- **Impacto:** alto — base de qualquer relatório de campanha

### 17. Enhanced Conversions
Enviar e-mail hasheado (SHA-256) junto do `whatsapp_form_submit` para o Google reconciliar com contas Google. Aumenta atribuição em 5-10%. Depende do domínio verificado no Ads.
- **Esforço:** ~1h (código) + setup no Ads
- **Impacto:** médio — melhora atribuição e bidding

### 18. Landing pages otimizadas para anúncio
Páginas dedicadas por intenção: `/arquitetura-fortaleza`, `/projetos-residenciais-fortaleza`, `/design-de-interiores-fortaleza`. Headline alinhada com o anúncio, CTA único, sem distração. Aumenta Quality Score (CPC mais baixo) e conversão.
- **Esforço:** ~3h por landing
- **Impacto:** alto — afeta diretamente CPC e taxa de conversão das campanhas

### 19. Query param de conversion ID no `/contato/obrigado`
Aceitar `?conv=<id>` na URL de obrigado para diferenciar conversões por campanha sem precisar criar gatilhos novos no GTM toda vez.
- **Esforço:** ~30min
- **Impacto:** baixo a médio — facilita rastreamento granular

### 20. Pixel do Meta (opcional)
Se o cliente for rodar Instagram/Facebook Ads em paralelo, instalar o pixel + Conversions API server-side. Atribuição cross-channel.
- **Esforço:** ~2h
- **Impacto:** depende — só se houver Meta Ads ativo

---

## Recomendação de ordem (custo × benefício)

1. ~~**Política de privacidade** (15)~~ — concluído
2. **Depoimentos** (1) — alto valor, ~2h se já tem material
3. **UTM listener** (16) — base de relatório de campanha, ~1h
4. **Cal.com / Calendly** (10) — converte melhor que form, ~1h
5. **Páginas de cidade / landing pages** (4 + 18) — SEO local + Quality Score do Ads, ~3h cada
6. **Enhanced Conversions** (17) — atribuição de Ads, ~1h
7. **AVIF + preload** (8 + 9) — ganho de Lighthouse, ~1h30
