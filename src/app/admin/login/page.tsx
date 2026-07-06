"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { requestAccessAction } from "@/app/admin/_actions/auth";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:
    "Sua conta não tem acesso ao painel. Solicite acesso abaixo ou peça a um administrador para convidar seu e-mail.",
  oauth_failed: "Não foi possível concluir o login com o Google. Tente novamente.",
};

type RequestStatus = "idle" | "sending" | "sent" | "already";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [requestError, setRequestError] = useState<string | null>(null);
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] : null;

  const handleRequestAccess = async () => {
    setRequestStatus("sending");
    setRequestError(null);
    const result = await requestAccessAction();
    if (!result.ok) {
      setRequestError(result.error);
      setRequestStatus("idle");
      return;
    }
    setRequestStatus(result.already ? "already" : "sent");
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    // Salvamos o destino pós-login em cookie pra que a URL de redirectTo
    // fique limpa (sem query string). Algumas configs do Supabase rejeitam
    // redirectTo com query e fazem fallback pro Site URL.
    const nextPath = searchParams.get("next") ?? "/admin";
    document.cookie = `admin_login_next=${encodeURIComponent(nextPath)}; path=/; max-age=600; SameSite=Lax`;

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      console.error("[admin-login] OAuth error", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-[900px] flex flex-col items-center">
        <span
          className="text-micro uppercase tracking-[0.32em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          Painel administrativo
        </span>

        {/*
          O SVG tem viewBox 1920x1080 (proporção 16:9 com bastante espaço
          em volta do desenho). Em vez de escalar a altura também, fixamos
          uma altura reduzida e clipamos o excesso via overflow:hidden.
          Resultado: logo aparece grande sem gerar espaço vertical excessivo.
        */}
        <div
          className="relative -mt-12 w-full max-w-[900px] overflow-hidden"
          style={{ height: "min(28vh, 240px)" }}
        >
          <Image
            src="/images/logos/brand/marca-variacao-02.svg"
            alt="W.VIANA Arquitetura | Interiores"
            fill
            priority
            sizes="900px"
            className="object-contain"
            style={{ transform: "scale(1.6)" }}
          />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-4 w-full max-w-[420px] flex items-center justify-center gap-3 border py-4 text-caption uppercase tracking-[0.18em] text-foreground transition-all hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
        >
          {loading ? "Conectando..." : "Entrar com Google →"}
        </button>

        {errorMessage ? (
          <p
            className="mt-5 text-center text-body"
            style={{ color: "hsl(var(--accent-strong))" }}
          >
            {errorMessage}
          </p>
        ) : (
          <p className="mt-5 text-center text-micro uppercase tracking-[0.18em] text-muted-foreground">
            Acesso restrito a usuários autorizados.
          </p>
        )}

        {errorCode === "unauthorized" ? (
          <div className="mt-4 flex w-full max-w-[420px] flex-col items-center gap-3">
            {requestStatus === "sent" || requestStatus === "already" ? (
              <p className="text-center text-body text-muted-foreground">
                {requestStatus === "already"
                  ? "Você já tem um pedido pendente. Assim que for aprovado, é só entrar com o Google."
                  : "Pedido enviado! Assim que for aprovado, é só entrar com o Google."}
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRequestAccess}
                  disabled={requestStatus === "sending"}
                  className="w-full border py-3 text-caption uppercase tracking-[0.18em] text-muted-foreground transition-all hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "hsl(var(--accent) / 0.4)" }}
                >
                  {requestStatus === "sending"
                    ? "Enviando pedido..."
                    : "Solicitar acesso"}
                </button>
                {requestError ? (
                  <p
                    className="text-center text-caption"
                    style={{ color: "hsl(0 60% 50%)" }}
                  >
                    {requestError}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
