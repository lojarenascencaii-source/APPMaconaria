// @ts-nocheck
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPendingAttendance, getApprovedAttendance, getRejectedAttendance, getMasters } from '@/app/actions'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import ApprovedAttendanceTable from '../approved-attendance-table'
import PendingApprovalsList from './pending-approvals-list'

import Navbar from '@/components/navbar'

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
    const rejected = await getRejectedAttendance()
    const masters = await getMasters()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar user={session.user} />

            <main className="container mx-auto p-4 py-8">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold text-amber-500 mb-4">Aprovações Pendentes</h2>
                        <PendingApprovalsList pending={pending} masters={masters} />
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-green-400 mb-4">Presenças Aprovadas</h2>
                        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                            <ApprovedAttendanceTable approved={approved} />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-red-400 mb-4">Atividades Reprovadas</h2>
                        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                            <ApprovedAttendanceTable approved={rejected} />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
