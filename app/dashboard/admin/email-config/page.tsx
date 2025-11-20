import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEmailConfig, saveEmailConfig, testEmailConfig } from '@/app/email-config-actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EmailConfigPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const config = await getEmailConfig()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-6">
                    <Link
                        href="/dashboard/admin"
                        className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Administração
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-amber-500 mb-8">Configuração de Email (SMTP)</h1>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                        <h3 className="text-blue-400 font-semibold mb-2">ℹ️ Como configurar Gmail</h3>
                        <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
                            <li>Acesse sua conta Gmail</li>
                            <li>Vá em: Configurações → Segurança → Verificação em duas etapas (ative)</li>
                            <li>Depois: Senhas de app → Criar senha de app</li>
                            <li>Use essa senha de app no campo "Senha" abaixo</li>
                        </ol>
                        <p className="text-xs text-slate-400 mt-2">
                            <strong>Servidor:</strong> smtp.gmail.com | <strong>Porta:</strong> 587 | <strong>Segurança:</strong> TLS
                        </p>
                    </div>

                    <form action={saveEmailConfig} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Servidor SMTP</label>
                                <input
                                    type="text"
                                    name="host"
                                    defaultValue={config?.host || 'smtp.gmail.com'}
                                    required
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Porta</label>
                                <input
                                    type="number"
                                    name="port"
                                    defaultValue={config?.port || 587}
                                    required
                                    placeholder="587"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Segurança</label>
                            <select
                                name="secure"
                                defaultValue={config?.secure ? 'true' : 'false'}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            >
                                <option value="false">TLS (porta 587)</option>
                                <option value="true">SSL (porta 465)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Usuário / Email SMTP</label>
                            <input
                                type="email"
                                name="user"
                                defaultValue={config?.user || ''}
                                required
                                placeholder="lojamaconica@gmail.com"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Senha {config ? '(deixe em branco para manter a atual)' : ''}
                            </label>
                            <input
                                type="password"
                                name="password"
                                required={!config}
                                placeholder={config ? '••••••••' : 'Senha de app do Gmail'}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Remetente</label>
                            <input
                                type="email"
                                name="fromEmail"
                                defaultValue={config?.fromEmail || ''}
                                required
                                placeholder="lojamaconica@gmail.com"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Remetente</label>
                            <input
                                type="text"
                                name="fromName"
                                defaultValue={config?.fromName || ''}
                                required
                                placeholder="Loja Maçônica"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Salvar Configuração
                        </button>
                    </form>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-200 mb-4">Testar Configuração</h2>
                    <p className="text-sm text-slate-400 mb-4">
                        Envie um email de teste para verificar se a configuração está funcionando corretamente.
                    </p>
                    <form action={testEmailConfig} className="space-y-4">
                        <input type="hidden" name="host" value={config?.host || 'smtp.gmail.com'} />
                        <input type="hidden" name="port" value={config?.port || 587} />
                        <input type="hidden" name="secure" value={config?.secure ? 'true' : 'false'} />
                        <input type="hidden" name="user" value={config?.user || ''} />
                        <input type="hidden" name="fromEmail" value={config?.fromEmail || ''} />
                        <input type="hidden" name="fromName" value={config?.fromName || ''} />

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Senha SMTP (para teste)</label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="Digite a senha novamente para testar"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email de Teste</label>
                            <input
                                type="email"
                                name="testEmail"
                                required
                                placeholder="seu@email.com"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Enviar Email de Teste
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
