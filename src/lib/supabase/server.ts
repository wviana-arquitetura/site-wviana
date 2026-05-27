import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client para Server Components, Server Actions e Route Handlers.
 * Lê e escreve cookies da sessão do usuário autenticado via @supabase/ssr.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component só lê cookies; setAll será chamado pelo middleware.
          }
        },
      },
    },
  );
}

/**
 * Cliente Supabase com privilégios totais (bypass RLS). Use SOMENTE em código
 * server-side confiável: scripts de migração, server actions de admin verificadas
 * via middleware, etc. NUNCA expor a service role key ao navegador.
 */
export function createSupabaseServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não definida. Configure em .env.local.",
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
