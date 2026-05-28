import type { NextConfig } from "next";

const SUPABASE_HOSTNAME = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  experimental: {
    // Default do Next é 1MB, que estoura com fotos. O canvas no navegador
    // (image-compress.ts) redimensiona pra 3200px @ q0.95 antes de enviar; em
    // fotos com muito detalhe isso pode chegar perto do MAX_SIZE de 15MB do
    // upload.ts. 20MB dá folga e cobre fallbacks (canvas falha → original cru).
    serverActions: { bodySizeLimit: "20mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16: a prop `quality` em <Image> só aceita valores que estejam aqui.
    // Padronizamos por contexto (ver components em src/components/project/v2/*).
    // Default do Next é [75]; pra portfólio de arquitetura precisamos de mais.
    qualities: [78, 80, 82, 85],
    remotePatterns: SUPABASE_HOSTNAME
      ? [
          {
            protocol: "https",
            hostname: SUPABASE_HOSTNAME,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
