import type { Metadata } from "next";
import { Toaster } from "sonner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Painel administrativo · W.VIANA",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: adminRow } = user
    ? await supabase
        .from("admin_users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  // Sem sessão OU com sessão mas fora de admin_users: renderiza só o conteúdo
  // (na prática, a tela de login — o middleware já barrou as demais rotas do
  // painel e mandou pra /admin/login?error=unauthorized). Importante NÃO
  // redirecionar daqui: este layout também envolve o /admin/login, então um
  // redirect pro próprio login criaria loop infinito — e a sessão do barrado
  // precisa continuar viva pro botão "Solicitar acesso" funcionar.
  if (!user || !adminRow) {
    return (
      <>
        {children}
        <Toaster position="bottom-right" theme="light" richColors />
      </>
    );
  }

  return (
    // data-admin marca a sub-árvore do painel pra ajustes finos de UI
    // específicos do admin (ex.: placeholders mais leves em formulários),
    // sem vazar pro site público. Ver globals.css.
    //
    // O painel trava a altura na viewport (h-screen + overflow-hidden) e rola
    // DENTRO do <main>. Isso é o que faz o `position: sticky` (header/abas/aside/
    // footer) funcionar: o `overflow-x: hidden` global em html/body quebraria o
    // sticky relativo à janela. `data-lenis-prevent` impede o Lenis (scroll suave
    // do site público) de sequestrar o scroll do painel.
    <div
      data-admin
      className="h-screen overflow-hidden bg-background text-foreground"
    >
      <AdminNav userEmail={user.email ?? ""} isOwner={adminRow.role === "owner"} />
      <main
        data-lenis-prevent
        className="h-screen overflow-y-auto overflow-x-hidden md:ml-72"
      >
        {children}
      </main>
      <Toaster position="bottom-right" theme="light" richColors />
    </div>
  );
}
