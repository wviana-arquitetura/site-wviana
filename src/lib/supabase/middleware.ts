import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Atualiza a sessão do Supabase em cada request e gatekeepa `/admin`.
 *
 * - Renova cookies de sessão (necessário para tokens não expirarem)
 * - Se rota for /admin (exceto /admin/login), exige sessão válida
 * - Sem sessão → redireciona para /admin/login
 * - Com sessão mas e-mail não em admin_users → 403
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";
  const isAuthCallback = pathname.startsWith("/auth/callback");

  if (isAdminRoute && !isLoginRoute && !isAuthCallback) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verifica se o e-mail está autorizado (tabela admin_users)
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminRow) {
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = "/admin/login";
      forbiddenUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return supabaseResponse;
}
