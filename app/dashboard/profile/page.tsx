// @ts-nocheck
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCurrentUser, updateOwnProfile, updateOwnPassword } from '@/app/actions'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

import Navbar from '@/components/navbar'

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect('/login')
    }

    // Only non-admin users should access this page
    if (session.user.role === 'ADMIN') {
        redirect('/dashboard')
    }

    const user = await getCurrentUser()

    if (!user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar user={session.user} />

            <main className="container mx-auto p-4 py-8 max-w-2xl">
                <h1 className="text-3xl font-bold text-amber-500 mb-8">Meus Dados</h1>

                <div className="space-y-6">
                    {/* User Information */}
                    <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h2 className="text-xl font-semibold text-slate-200 mb-4">Informações Pessoais</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-slate-400">Nome</label>
                                <p className="text-slate-200 font-medium">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">Grau</label>
                                <p className="text-slate-200 font-medium">
                                    {user.role === 'MASTER' ? 'Mestre' :
                                        user.role === 'FELLOWCRAFT' ? 'Companheiro' : 'Aprendiz'}
                                </p>
                            </div>
                            {user.initiationDate && (
                                <div>
                                    <label className="text-sm text-slate-400">Data de Iniciação</label>
                                    <p className="text-slate-200 font-medium">
                                        {new Date(user.initiationDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Edit Profile */}
                    <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h2 className="text-xl font-semibold text-slate-200 mb-4">Editar Contato</h2>
                        <form action={async (formData) => {
                            'use server'
                            const result = await updateOwnProfile(formData)
                            if (result?.error) {
                                // Error handling will be done client-side
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={user.email}
                                    required
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Celular</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    defaultValue={user.phone || ''}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Salvar Alterações
                            </button>
                        </form>
                    </section>

                    {/* Change Password */}
                    <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h2 className="text-xl font-semibold text-slate-200 mb-4">Alterar Senha</h2>
                        <form action={async (formData) => {
                            'use server'
                            const result = await updateOwnPassword(formData)
                            if (result?.error) {
                                // Error handling will be done client-side
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Senha Atual</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    required
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nova Senha</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Alterar Senha
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    )
}
