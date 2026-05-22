import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";

const LAST_UPDATED = "21 de maio de 2026";

export const metadata: Metadata = pageMeta({
  title: "Termos de Uso",
  description:
    "Regras de uso do site W.VIANA, propriedade intelectual dos projetos e limitações de responsabilidade.",
  path: "/termos",
});

export default function TermosPage() {
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
              Termos de Uso
            </span>
            <h1 className="mt-4 text-architectural font-light leading-[1.05] text-foreground">
              Regras de uso do site.
            </h1>
            <p className="mt-6 text-body-lg text-muted-foreground">
              Estes termos regulam o uso do site W.VIANA. Ao navegar, você concorda com as condições abaixo. Se não concordar, recomendamos não usar o site.
            </p>
            <p className="mt-2 text-caption uppercase tracking-[0.18em] text-muted-foreground">
              Última atualização: {LAST_UPDATED}
            </p>

            <div
              className="mt-10 h-px w-full"
              style={{ background: "hsl(var(--accent) / 0.3)" }}
            />

            <Section title="1. Sobre o site">
              <p>
                Este site é operado por {legal.razaoSocial}, inscrita no CNPJ sob o nº {legal.cnpj}, com endereço comercial em {legal.enderecoComercial}. Tem caráter exclusivamente institucional, apresentando o escritório, seus projetos e canais de contato.
              </p>
            </Section>

            <Section title="2. Propriedade intelectual">
              <p>
                Todo o conteúdo publicado neste site — textos, fotos, imagens de projetos, plantas, identidade visual, marcas, layout e código — é de propriedade da W.VIANA ou de terceiros que autorizaram seu uso. É <strong>vedada</strong> a reprodução, redistribuição, modificação ou uso comercial de qualquer parte deste conteúdo sem autorização prévia e por escrito.
              </p>
              <p>
                Fotografias dos projetos podem ter sido produzidas por fotógrafos contratados, mantendo-se os respectivos créditos quando aplicáveis. A exibição dos projetos no site foi autorizada pelos clientes finais.
              </p>
            </Section>

            <Section title="3. Caráter informativo">
              <p>
                As informações apresentadas neste site têm finalidade <strong>meramente informativa</strong> e <strong>não constituem proposta comercial vinculante</strong>. Valores, prazos e escopos de projetos são definidos exclusivamente em contrato formal específico, após contato direto com o escritório.
              </p>
              <p>
                Imagens de projetos representam trabalhos já executados ou conceitos próprios do escritório, e não devem ser interpretadas como garantia de resultado idêntico em novos projetos.
              </p>
            </Section>

            <Section title="4. Uso aceitável">
              <p>Ao usar o site, você concorda em:</p>
              <ul>
                <li>Não tentar acessar áreas restritas, comprometer a segurança ou interromper o funcionamento do serviço.</li>
                <li>Não usar robôs, scrapers ou ferramentas automatizadas para extrair conteúdo em massa.</li>
                <li>Não enviar informações falsas, ofensivas ou que violem direitos de terceiros pelo formulário de contato.</li>
                <li>Não usar o conteúdo do site para fins ilícitos ou para denegrir a imagem do escritório.</li>
              </ul>
            </Section>

            <Section title="5. Links externos">
              <p>
                O site pode conter links para serviços de terceiros (Instagram, Pinterest, WhatsApp, Google Maps). Esses serviços têm seus próprios termos e políticas, sobre os quais a W.VIANA não exerce controle e pelos quais não se responsabiliza.
              </p>
            </Section>

            <Section title="6. Disponibilidade e limitação de responsabilidade">
              <p>
                O site é oferecido <strong>na forma em que se encontra</strong> (&quot;as is&quot;), sem garantia de disponibilidade ininterrupta. Eventuais indisponibilidades por manutenção, ataques de terceiros ou falhas de infraestrutura não geram responsabilidade da W.VIANA.
              </p>
              <p>
                A W.VIANA também não se responsabiliza por danos indiretos, lucros cessantes ou consequências decorrentes do uso ou impossibilidade de uso do site.
              </p>
            </Section>

            <Section title="7. Privacidade e dados pessoais">
              <p>
                O tratamento de dados pessoais segue a{" "}
                <Link href="/privacidade" className="underline underline-offset-4 hover:opacity-70">
                  Política de Privacidade
                </Link>
                , que é parte integrante destes termos.
              </p>
            </Section>

            <Section title="8. Alterações nestes termos">
              <p>
                Estes termos podem ser atualizados a qualquer momento. A versão vigente é sempre a publicada nesta página, com a data da última atualização indicada no topo. O uso continuado do site após mudanças significa concordância com os novos termos.
              </p>
            </Section>

            <Section title="9. Lei aplicável e foro">
              <p>
                Estes termos são regidos pela legislação brasileira. Eventuais conflitos serão dirimidos no <strong>foro da Comarca de Fortaleza-CE</strong>, com renúncia a qualquer outro, por mais privilegiado que seja.
              </p>
            </Section>

            <Section title="10. Contato">
              <p>
                Dúvidas sobre estes termos podem ser enviadas para{" "}
                <a
                  href={`mailto:${legal.encarregadoEmail}`}
                  className="underline underline-offset-4 hover:opacity-70"
                >
                  {legal.encarregadoEmail}
                </a>
                .
              </p>
            </Section>

            <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/contato"
                className="group inline-flex items-center justify-center gap-3 border px-6 py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-secondary"
                style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
              >
                entrar em contato
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
                href="/privacidade"
                className="text-caption uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                ver política de privacidade
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
