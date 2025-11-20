'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        if (!token) {
            setError('Token inválido')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (data.success) {
                setMessage('Senha redefinida com sucesso! Redirecionando...')
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                setError(data.error || 'Erro ao redefinir senha')
            }
        } catch (err) {
            setError('Erro ao processar solicitação')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Token Inválido</h1>
                    <p className="text-slate-400 mb-6">O link de recuperação é inválido ou expirou.</p>
                    <Link
                        href="/forgot-password"
                        className="inline-block px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Solicitar Novo Link
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl max-w-md w-full">
                <h1 className="text-3xl font-bold text-amber-500 mb-2">Redefinir Senha</h1>
                <p className="text-slate-400 mb-6">Digite sua nova senha abaixo.</p>

                {message && (
                    <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nova Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Confirmar Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Digite a senha novamente"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                        {loading ? 'Processando...' : 'Redefinir Senha'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-slate-400 hover:text-amber-500 transition-colors">
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-amber-500">Carregando...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
