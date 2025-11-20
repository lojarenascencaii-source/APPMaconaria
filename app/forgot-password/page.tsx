import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { sendPasswordResetEmail } from '@/lib/email'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function requestPasswordReset(formData: FormData) {
    'use server'

    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        // Don't reveal if user exists or not for security
        if (!user) {
            return { success: true, message: 'Se o email existir, você receberá instruções para redefinir sua senha.' }
        }

        // Generate reset token
        const resetToken = randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        })

        // Send email
        await sendPasswordResetEmail(user.email, resetToken)

        return { success: true, message: 'Se o email existir, você receberá instruções para redefinir sua senha.' }
    } catch (error) {
        console.error(error)
        return { error: 'Erro ao processar solicitação' }
    }
}

export default async function ForgotPasswordPage() {
    const session = await getServerSession(authOptions)

    if (session) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-amber-500 mb-2">App Maçonaria</h1>
                    <p className="text-slate-400">Recuperação de Senha</p>
                </div>

                <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-slate-200 mb-6">Esqueci minha senha</h2>

                    <p className="text-slate-400 text-sm mb-6">
                        Digite seu email cadastrado e enviaremos instruções para redefinir sua senha.
                    </p>

                    <form action={requestPasswordReset} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-200"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Enviar Link de Recuperação
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            ← Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
