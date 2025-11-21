// @ts-nocheck
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserDetails } from '@/app/admin-actions'
import { getActivities, getMasters } from '@/app/actions'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, Mail, Phone } from 'lucide-react'
import UserAttendanceList from './user-attendance-list'

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const { id } = await params
    const { user, attendances } = await getUserDetails(id)
    const activities = await getActivities()
    const masters = await getMasters()

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Mestre Administrador'
            case 'MASTER': return 'Mestre'
            case 'FELLOWCRAFT': return 'Companheiro'
            case 'APPRENTICE': return 'Aprendiz'
            default: return role
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Voltar para o Dashboard"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-amber-500">Detalhes do Usuário</h1>
                </div>

                {/* User Info Card */}
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-slate-500" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="text-sm text-slate-500 block mb-1">Nome</label>
                                <p className="font-semibold text-lg">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 block mb-1">Função</label>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                                    user.role === 'MASTER' ? 'bg-blue-500/10 text-blue-400' :
                                        user.role === 'FELLOWCRAFT' ? 'bg-green-500/10 text-green-400' :
                                            'bg-amber-500/10 text-amber-400'
                                    }`}>
                                    {getRoleLabel(user.role)}
                                </span>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 block mb-1">Email</label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-600" />
                                    <span>{user.email}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 block mb-1">Iniciação</label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-600" />
                                    <span>
                                        {user.initiationDate
                                            ? new Date(user.initiationDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Attendance History */}
                <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-200">Histórico de Atividades</h2>
                        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                            Total: {attendances.length}
                        </span>
                    </div>
                    <UserAttendanceList
                        attendances={attendances}
                        activities={activities}
                        masters={masters}
                    />
                </section>
            </div>
        </div>
    )
}
