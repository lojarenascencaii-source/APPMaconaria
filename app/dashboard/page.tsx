// @ts-nocheck
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getActivities, getMasters, getApprenticeAttendance, getPendingAttendance, getApprovedAttendance, getRejectedAttendance, submitAttendance, approveAttendance } from '@/app/actions'
import { getUsersProgress, getAdminPendingAttendance, getAdminApprovedAttendance } from '@/app/admin-actions'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import ProgressDashboard from './admin/progress-dashboard'
import PersonalProgress from './personal-progress'
import AttendanceTable from './attendance-table'
import ApprovedAttendanceTable from './approved-attendance-table'
import PendingApprovalsList from './approvals/pending-approvals-list'

import Navbar from '@/components/navbar'

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    const isApprentice = session.user.role === 'APPRENTICE'
    const isFellowcraft = session.user.role === 'FELLOWCRAFT'
    const isMaster = session.user.role === 'MASTER'

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navbar user={session.user} />

            <main className="container mx-auto p-4 py-8">
                {isApprentice && <ApprenticeView />}
                {isFellowcraft && <FellowcraftView />}
                {isMaster && <MasterView />}
                {session.user.role === 'ADMIN' && <AdminView />}
            </main>
        </div>
    )
}

async function ApprenticeView() {
    const activities = await getActivities()
    const masters = await getMasters()
    const history = await getApprenticeAttendance()
    const approvedAttendances = history.filter((item: any) => item.status === 'APPROVED')

    return (
        <div className="space-y-8">
            <PersonalProgress attendances={approvedAttendances} />
            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-2xl font-semibold text-amber-500 mb-6">Registrar Presença</h2>
                <form action={submitAttendance} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                            <input type="date" name="date" required className="w-full max-w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Local (Loja e Oriente)</label>
                            <input type="text" name="location" required placeholder="Ex: Loja Esperança, Oriente de SP" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Atividade</label>
                            <select name="activityId" required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">Selecione...</option>
                                {activities.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Mestre Responsável</label>
                            <select name="masterId" required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">Selecione...</option>
                                {masters.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Observações (Opcional)</label>
                        <textarea
                            name="observation"
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            placeholder="Alguma observação sobre a atividade..."
                        />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors">
                        Enviar Registro
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Minhas Presenças</h2>
                <div className="bg-slate-900 rounded-xl border border-slate-800">
                    <AttendanceTable history={history} activities={activities} masters={masters} />
                </div>
            </section>
        </div>
    )
}

async function FellowcraftView() {
    const allActivities = await getActivities()
    // Filter out activities not allowed for Fellowcraft
    const excludedActivities = ['4ª Instrução', '5ª Instrução', 'Telhamento']
    const activities = allActivities.filter((a: any) => !excludedActivities.includes(a.name))

    const masters = await getMasters()
    const history = await getApprenticeAttendance()
    const approvedAttendances = history.filter((item: any) => item.status === 'APPROVED')

    return (
        <div className="space-y-8">
            <PersonalProgress
                attendances={approvedAttendances}
                excludedActivities={['Telhamento', '4ª Instrução', '5ª Instrução']}
            />
            <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-2xl font-semibold text-amber-500 mb-6">Registrar Presença</h2>
                <form action={submitAttendance} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                            <input type="date" name="date" required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Local (Loja e Oriente)</label>
                            <input type="text" name="location" required placeholder="Ex: Loja Esperança, Oriente de SP" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Atividade</label>
                            <select name="activityId" required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">Selecione...</option>
                                {activities.map((a: any) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Mestre Responsável</label>
                            <select name="masterId" required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">Selecione...</option>
                                {masters.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Observações (Opcional)</label>
                        <textarea
                            name="observation"
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                            placeholder="Alguma observação sobre a atividade..."
                        />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors">
                        Enviar Registro
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Minhas Presenças</h2>
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <AttendanceTable history={history} activities={activities} masters={masters} />
                </div>
            </section>
        </div>
    )
}

async function MasterView() {
    const pending = await getPendingAttendance()
    const approved = await getApprovedAttendance()
    const rejected = await getRejectedAttendance()
    const masters = await getMasters()

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold text-amber-500 mb-4">Aprovações Pendentes</h2>
                <PendingApprovalsList pending={pending} masters={masters} />
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-green-400 mb-4">Presenças Aprovadas</h2>
                <div className="bg-slate-900 rounded-xl border border-slate-800">
                    <ApprovedAttendanceTable approved={approved} />
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-red-400 mb-4">Atividades Reprovadas</h2>
                <div className="bg-slate-900 rounded-xl border border-slate-800">
                    <ApprovedAttendanceTable approved={rejected} />
                </div>
            </section>
        </div>
    )
}

async function AdminView() {
    const usersProgress = await getUsersProgress()

    return (
        <div className="space-y-8">
            <ProgressDashboard users={usersProgress} />
        </div>
    )
}
