import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-amber-500 tracking-tight">
            Controle de Presença
          </h1>
          <p className="text-xl text-slate-400">
            Sistema de gestão para Aprendizes Maçônicos
          </p>
        </div>

        <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
          <p className="text-slate-300 mb-8 leading-relaxed">
            Registre suas atividades, sessões e visitas. Mantenha seu histórico atualizado e obtenha a validação dos Mestres de forma simples e digital.
          </p>

          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-amber-500/20"
          >
            Acessar Sistema
          </Link>
        </div>
      </div>
    </div>
  )
}
