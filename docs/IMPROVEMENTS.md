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

### 15. Política de privacidade e termos de uso
Exigência LGPD. O banner de cookies já existe, mas falta o link da política em si.
- **Esforço:** ~2h (texto + página)
- **Impacto:** obrigatório — risco legal se não tiver, especialmente com Google Ads ativo

---

## Recomendação de ordem (custo × benefício)

1. **Política de privacidade** (15) — obrigação legal, ~2h
2. **Depoimentos** (1) — alto valor, ~2h se já tem material
3. **Cal.com / Calendly** (10) — converte melhor que form, ~1h
4. **Páginas de cidade** (4) — SEO local, ~3h por cidade
5. **AVIF + preload** (8 + 9) — ganho de Lighthouse, ~1h30
