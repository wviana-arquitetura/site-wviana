'use client'

import { useState } from 'react'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const res = await loginAction(formData)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] bg-[#050505] text-[#e5e5e5] font-sans selection:bg-white selection:text-black overflow-hidden">
      {/* Structural Grid Background */}
      <div className="absolute inset-0 pointer-events-none flex justify-center">
        <div className="w-full max-w-[1200px] h-full border-x border-white/[0.04] relative flex">
          <div className="h-full w-1/3 border-r border-white/[0.04]"></div>
          <div className="h-full w-1/3 border-r border-white/[0.04]"></div>
          <div className="absolute top-1/3 w-full h-px border-t border-white/[0.04]"></div>
          <div className="absolute top-2/3 w-full h-px border-t border-white/[0.04]"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[500px] m-auto p-10 md:p-14 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-3 block">
            Acesso Restrito //
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase leading-none">
            Área<br />
            <span className="font-semibold text-white/80">Privada</span>
          </h1>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-10">
          <div className="relative group">
            <label htmlFor="password" className="text-[10px] tracking-[0.2em] uppercase text-white/40 mb-2 block">
              Credencial de Acesso
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full pb-4 text-lg tracking-[0.4em] bg-transparent border-0 border-b border-white/20 focus:outline-none focus:border-white focus:ring-0 placeholder:text-white/10 placeholder:tracking-normal transition-colors rounded-none appearance-none"
            />
          </div>

          {error && (
            <div className="text-[10px] tracking-[0.2em] uppercase text-red-500/80 animate-in fade-in">
              [ Erro: {error} ]
            </div>
          )}

          <div className="flex justify-between items-end pt-8 border-t border-white/10">
            <div className="text-[9px] tracking-[0.2em] text-white/30 uppercase max-w-[150px]">
              Insira a chave fornecida responsável.
            </div>

            <button 
              type="submit" 
              className="group relative flex items-center justify-center h-12 px-8 text-xs font-semibold tracking-[0.2em] uppercase text-black bg-white hover:bg-neutral-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Aguarde...</span>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Entrar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
