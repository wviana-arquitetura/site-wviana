import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";

const LAST_UPDATED = "21 de maio de 2026";

export const metadata: Metadata = pageMeta({
  title: "Política de Privacidade",
  description:
    "Como o escritório W.VIANA coleta, usa e protege os dados dos visitantes do site, conforme a LGPD.",
  path: "/privacidade",
});

export default function PrivacidadePage() {
  const { legal } = BRAND;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="px-8 pt-36 pb-24 md:px-16 md:pt-44 md:pb-32 lg:px-24">
          <div className="mx-auto flex w-full max-w-[820px] flex-col">
            <span
              className="text-micro uppercase tracking-[0.22em]"
              style={{ color: "hsl(var(--accent-strong))" }}
            >
              Política de Privacidade
            </span>
            <h1 className="mt-4 text-architectural font-light leading-[1.05] text-foreground">
              Como tratamos os seus dados.
            </h1>
            <p className="mt-6 text-body-lg text-muted-foreground">
              Esta política descreve como o escritório W.VIANA coleta, usa e protege as informações dos visitantes do site, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD) e o Marco Civil da Internet (Lei 12.965/2014).
            </p>
            <p className="mt-2 text-caption uppercase tracking-[0.18em] text-muted-foreground">
              Última atualização: {LAST_UPDATED}
            </p>

            <div
              className="mt-10 h-px w-full"
              style={{ background: "hsl(var(--accent) / 0.3)" }}
            />

            <Section title="1. Quem somos">
              <p>
                {legal.razaoSocial}, inscrita no CNPJ sob o nº {legal.cnpj}, com endereço comercial em {legal.enderecoComercial}, é a controladora dos dados pessoais coletados por meio deste site.
              </p>
            </Section>

            <Section title="2. Quais dados coletamos">
              <p>Coletamos apenas o necessário para responder ao contato e operar o site:</p>
              <ul>
                <li>
                  <strong>Dados fornecidos por você</strong> pelo formulário de contato: nome, e-mail, tipo de projeto e mensagem.
                </li>
                <li>
                  <strong>Dados de navegação</strong> coletados automaticamente: endereço IP, tipo de dispositivo, navegador, sistema operacional, páginas visitadas e tempo de permanência. Esses dados são tratados via Google Analytics 4 e Google Tag Manager.
                </li>
              </ul>
              <p>Não coletamos dados sensíveis (origem racial, religião, opinião política, saúde, biometria, etc.) nem dados de crianças e adolescentes.</p>
            </Section>

            <Section title="3. Para que usamos os dados">
              <ul>
                <li>
                  <strong>Responder ao seu contato</strong> e iniciar a conversa sobre um possível projeto (base legal: execução de procedimentos preliminares relacionados a contrato — art. 7º, V da LGPD).
                </li>
                <li>
                  <strong>Medir desempenho do site</strong> e melhorar a experiência de navegação (base legal: legítimo interesse — art. 7º, IX da LGPD).
                </li>
                <li>
                  <strong>Otimizar campanhas de Google Ads</strong>, com seu consentimento prévio via banner de cookies (base legal: consentimento — art. 7º, I da LGPD).
                </li>
              </ul>
              <p>Os dados nunca são usados para finalidade diversa da informada nem vendidos a terceiros.</p>
            </Section>

            <Section title="4. Cookies e tecnologias de rastreamento">
              <p>
                O site usa cookies próprios e de terceiros para medir desempenho e melhorar campanhas. Quando você acessa o site pela primeira vez, exibimos um banner permitindo aceitar ou recusar o uso de cookies de análise e publicidade. Sua escolha é guardada localmente no seu navegador e pode ser alterada a qualquer momento limpando os dados do site.
              </p>
              <p>Implementamos o <strong>Google Consent Mode v2</strong>: até você aceitar, nenhum cookie de análise ou anúncio é gravado. Cookies estritamente técnicos (necessários para o funcionamento do site) não dependem de consentimento.</p>
            </Section>

            <Section title="5. Com quem compartilhamos os dados">
              <p>Os dados são tratados internamente pelo escritório W.VIANA e podem ser compartilhados com os seguintes operadores, exclusivamente para viabilizar a comunicação:</p>
              <ul>
                <li><strong>Resend</strong> — envio do e-mail de notificação do lead à equipe do escritório.</li>
                <li><strong>Google Workspace</strong> — armazenamento do lead em planilha interna do escritório.</li>
                <li><strong>Google Analytics e Google Ads</strong> — medição de desempenho do site e campanhas de marketing.</li>
                <li><strong>Vercel</strong> — hospedagem do site.</li>
                <li><strong>Meta / WhatsApp</strong> — quando você opta por abrir uma conversa pelo WhatsApp.</li>
              </ul>
              <p>Esses operadores tratam os dados conforme as próprias políticas, aplicáveis em paralelo a esta. Não há transferência internacional adicional além da operação normal desses serviços.</p>
              <p>Eventualmente, os dados também são acessados por equipe de marketing <strong>interna</strong> do escritório, para acompanhamento de leads e campanhas.</p>
            </Section>

            <Section title="6. Por quanto tempo guardamos os dados">
              <p>
                Os leads do formulário de contato são mantidos por até <strong>5 (cinco) anos</strong> a partir do recebimento, prazo alinhado com a prescrição comercial. Após esse período, os dados são eliminados ou anonimizados.
              </p>
              <p>Dados de navegação seguem os prazos padrão do Google Analytics (configurável no próprio painel, atualmente 14 meses).</p>
            </Section>

            <Section title="7. Seus direitos como titular">
              <p>A LGPD garante a você, entre outros, os seguintes direitos:</p>
              <ul>
                <li>Confirmar a existência de tratamento e acessar seus dados.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                <li>Solicitar portabilidade dos dados a outro fornecedor de serviço.</li>
                <li>Revogar consentimento a qualquer momento.</li>
                <li>Opor-se a tratamento realizado com base em legítimo interesse.</li>
              </ul>
              <p>
                Para exercer qualquer um desses direitos, basta enviar um e-mail para{" "}
                <a
                  href={`mailto:${legal.encarregadoEmail}`}
                  className="underline underline-offset-4 hover:opacity-70"
                >
                  {legal.encarregadoEmail}
                </a>
                . Respondemos em até 15 dias.
              </p>
            </Section>

            <Section title="8. Segurança">
              <p>
                Adotamos medidas técnicas e administrativas razoáveis para proteger os dados contra acesso não autorizado, perda, alteração ou destruição. Apesar disso, nenhum sistema é totalmente imune a falhas — em caso de incidente que envolva risco aos titulares, comunicaremos a Autoridade Nacional de Proteção de Dados (ANPD) e os afetados, conforme exigido pela LGPD.
              </p>
            </Section>

            <Section title="9. Encarregado de proteção de dados (DPO)">
              <p>
                Em conformidade com o art. 41 da LGPD, o encarregado pelo tratamento de dados pessoais é{" "}
                <strong>{legal.encarregadoNome}</strong>, que pode ser contatado pelo e-mail{" "}
                <a
                  href={`mailto:${legal.encarregadoEmail}`}
                  className="underline underline-offset-4 hover:opacity-70"
                >
                  {legal.encarregadoEmail}
                </a>
                .
              </p>
            </Section>

            <Section title="10. Alterações nesta política">
              <p>
                Esta política pode ser atualizada periodicamente. A versão vigente é sempre a publicada nesta página, com a data da última atualização indicada no topo. Mudanças relevantes são comunicadas com destaque no site.
              </p>
            </Section>

            <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/contato"
                className="group inline-flex items-center justify-center gap-3 border px-6 py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-secondary"
                style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
              >
                falar com o encarregado
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/termos"
                className="text-caption uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                ver termos de uso
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-body-lg font-medium text-foreground">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body leading-[1.65] text-muted-foreground [&_a]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </section>
  );
}
