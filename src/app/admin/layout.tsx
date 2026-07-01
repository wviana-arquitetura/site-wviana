import type { Metadata } from "next";
import { redirect } from "next/navigation";
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

  // Sem sessão? Mostra direto o conteúdo (será a tela de login ou middleware
  // já redirecionou). Não renderizamos nav nem checamos admin_users.
  if (!user) {
    return (
      <>
        {children}
        <Toaster position="bottom-right" theme="light" richColors />
      </>
    );
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Tem sessão mas não é admin? Manda pro login com erro.
  if (!adminRow) {
    redirect("/admin/login?error=unauthorized");
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
      <AdminNav userEmail={user.email ?? ""} />
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
