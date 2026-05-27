import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client para uso no navegador (Client Components, hooks).
 * Usa a publishable key — segura para expor ao público.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
