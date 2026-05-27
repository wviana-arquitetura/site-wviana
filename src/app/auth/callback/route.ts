import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NEXT_COOKIE = "admin_login_next";

/**
 * Callback OAuth do Supabase.
 *
 * Após login no provider externo (Google), o Supabase redireciona pra cá com
 * um `code` em query string. Trocamos por uma sessão (cookies httpOnly) e
 * mandamos o usuário pro destino salvo em cookie (admin_login_next) ou /admin.
 *
 * Usamos cookie em vez de query string porque o Supabase rejeita
 * `redirectTo` com query e faz fallback pro Site URL — quebra o fluxo local.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");

  const cookieStore = await cookies();
  const nextFromCookie = cookieStore.get(NEXT_COOKIE)?.value;
  const next = nextFromCookie ? decodeURIComponent(nextFromCookie) : "/admin";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.delete(NEXT_COOKIE);
      return response;
    }
  }

  const failureResponse = NextResponse.redirect(
    `${origin}/admin/login?error=oauth_failed`,
  );
  failureResponse.cookies.delete(NEXT_COOKIE);
  return failureResponse;
}
