import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware roda em toda request que matchar o `config.matcher`.
 * Delega para o helper do Supabase que renova sessão e protege /admin.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em tudo, exceto:
     * - _next/static, _next/image (assets internos do Next)
     * - imagens estáticas do site
     * - favicon, robots, sitemap, manifest
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|fonts/).*)",
  ],
};
