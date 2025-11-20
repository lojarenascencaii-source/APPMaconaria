import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPendingAttendance, getApprovedAttendance, approveAttendance } from '@/app/actions'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import ApprovedAttendanceTable from '../approved-attendance-table'

export default async function ApprovalsPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect('/login')
    }

    // Only MASTER and ADMIN can access this page
    if (session.user.role !== 'MASTER' && session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const pending = await getPendingAttendance()
    const approved = await getApprovedAttendance()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <Link href="/dashboard" className="text-2xl font-bold text-amber-500">
                        App Maçonaria
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-300">Olá, {session.user.name}</span>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Dashboard
                        </Link>
                        {session.user.role === 'ADMIN' && (
                            <Link
                                href="/dashboard/admin"
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Administração
                            </Link>
                        )}
                        <Link
                            href="/api/auth/signout"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-4 py-8">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold text-amber-500 mb-4">Aprovações Pendentes</h2>
                        <div className="grid gap-4">
                            {pending.map((item: any) => (
                                <div key={item.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-200">{item.apprentice.name}</h3>
                                        <p className="text-slate-400 text-sm">
                                            {item.activity.name} • {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </p>
                                        <p className="text-slate-500 text-sm mt-1">{item.location}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={approveAttendance.bind(null, item.id)}>
                                            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                                                Atestar Presença
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                            {pending.length === 0 && (
                                <div className="p-8 text-center text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                                    Nenhuma solicitação pendente.
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Presenças Aprovadas</h2>
                        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                            <ApprovedAttendanceTable approved={approved} />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
