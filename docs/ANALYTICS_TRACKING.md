# Plano de Analytics e Tracking — W.VIANA

Este documento explica o que foi implementado, para que serve, quando utilizar e como operar a medicao de acessos e conversoes do site. O objetivo e manter uma estrutura profissional, pronta para Google Ads, sem complexidade excessiva.

## 1. Objetivo do tracking

- Medir acessos e navegacao (page_view) com confianca.
- Medir intencao de contato (principal objetivo do site).
- Entender interesse em projetos e comportamento basico do visitante.
- Deixar o site pronto para campanhas no Google Ads.

## 2. Stack usada e por que

- **Google Tag Manager (GTM)**: centraliza todas as tags e eventos. Facilita ajustes sem novo deploy.
- **Google Analytics 4 (GA4)**: mede acessos e eventos. A base para performance organica e paga.
- **Google Search Console (GSC)**: acompanhamento de indexacao e desempenho organico.
- **Google Ads Conversion Tracking**: recebe a conversao principal para otimizar campanhas.
- **Conversion Linker (GTM)**: garante atribuicao correta para Google Ads.

## 3. Eventos principais

### 3.1 Evento principal (key event no GA4)
- **whatsapp_form_submit**
- Ocorre quando o formulario de contato e enviado e abre o WhatsApp.
- Deve ser o **key event principal no GA4** e a **conversion principal no Google Ads**.

### 3.2 Eventos secundarios
- **whatsapp_click**: clique em qualquer CTA de WhatsApp (flutuante, footer, drawer, contato).
- **email_click**: clique em qualquer mailto.
- Estes eventos sao sinais de intencao, mas **nao devem ser usados para otimizacao principal no inicio**.

### 3.3 Eventos de interesse em projetos
- **project_view**: visualizacao de pagina de projeto (slug).
- **project_cta_click**: clique em "Ver projeto" em cards/listagens.

## 4. Page view no Next.js (App Router)

Para evitar duplicidade, deve existir **apenas uma estrategia**:

- **Opcao recomendada**: usar `page_view` via dataLayer manual (ja implementado), e **desativar** o `send_page_view` na tag GA4 Configuration do GTM.
- **Nao usar** ao mesmo tempo History Change do GTM e dataLayer manual.

## 5. Privacidade e LGPD

- **Nunca enviar dados pessoais** do formulario para GA4, GTM ou Google Ads.
- Campos como **nome, e-mail e mensagem** nao devem aparecer em parametros de evento.
- Para WhatsApp, nao enviar o link completo com query. Use apenas dominio/caminho.
- Banner simples de cookies e Consent Mode sao recomendados quando iniciar Ads.

## 6. Responsabilidades

### 6.1 Desenvolvedor
- Manter GTM instalado no layout global.
- Garantir page_view sem duplicidade.
- Garantir eventos de contato e projetos.
- Garantir ausencia de dados pessoais nos eventos.
- Validar eventos via DebugView/Tag Assistant.

### 6.2 Gestor de trafego
- Vincular GA4 ao Google Ads.
- Importar **whatsapp_form_submit** como conversion principal.
- Manter **whatsapp_click** e **email_click** como conversoes secundarias.
- Ativar auto-tagging (gclid).

### 6.3 Cliente
- Fornecer acessos as contas Google.
- Aprovar politica de privacidade/cookies.
- Definir o canal prioritario de contato.

## 7. Como utilizar (passo a passo)

### 7.1 Configurar GTM
1. Criar ou acessar o container do GTM.
2. Publicar a tag **GA4 Configuration**.
3. Desativar `send_page_view` se o site usa dataLayer manual.
4. Criar tag **GA4 Event** para ouvir o evento `page_view` do dataLayer.
5. Adicionar **Conversion Linker** com trigger em todas as paginas.

### 7.2 Configurar GA4
1. Criar propriedade GA4 e stream web.
2. Marcar **whatsapp_form_submit** como key event principal.
3. Marcar **whatsapp_click** e **email_click** como key events secundarios.

### 7.3 Configurar Google Ads
1. Vincular GA4 ao Google Ads.
2. Importar **whatsapp_form_submit** como conversion principal.
3. Importar **whatsapp_click** e **email_click** como conversions secundarias.
4. Otimizacao inicial: **apenas whatsapp_form_submit**.

## 8. Checklist de validacao

- GA4 DebugView: eventos e parametros corretos.
- GTM Preview / Tag Assistant: disparo de tags.
- Google Ads: diagnostico de conversoes importadas.
- Testar em desktop e mobile.
- Confirmar ausencia de dados pessoais nos eventos.

## 9. O que nao esta no escopo agora

- BigQuery, lead scoring, CRM, server-side tagging, dashboards enterprise.
- Eventos granulares demais (scroll por secao, view de cada imagem, etc.).

## 10. Glossario rapido

- **Key event (GA4)**: evento marcado como conversao dentro do GA4.
- **Conversion (Google Ads)**: evento usado para otimizacao de campanhas.
- **Conversion Linker**: tag do GTM que melhora atribuicao de campanhas.
- **dataLayer**: camada de eventos do GTM.

## 11. Contato e manutencao

Se houver mudanca nos CTAs, formulario ou estrutura de paginas, a instrumentacao deve ser revisada para manter a qualidade da medicao.
