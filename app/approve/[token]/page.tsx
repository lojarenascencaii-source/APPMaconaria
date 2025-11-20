import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { CheckCircle2, XCircle } from 'lucide-react'

const prisma = new PrismaClient()

export default async function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    if (!token) {
        return <ErrorState message="Token inválido" />
    }

    try {
        // Find attendance by token
        const attendance = await prisma.attendance.findUnique({
            where: { approvalToken: token },
            include: {
                apprentice: true,
                activity: true,
            }
        })

        if (!attendance) {
            return <ErrorState message="Solicitação não encontrada ou já processada." />
        }

        // Check if already approved
        if (attendance.status === 'APPROVED') {
            return <SuccessState
                message="Esta presença já foi aprovada anteriormente."
                apprentice={attendance.apprentice.name}
                activity={attendance.activity.name}
                date={attendance.date}
            />
        }

        // Check expiration
        if (attendance.tokenExpiry && new Date() > attendance.tokenExpiry) {
            return <ErrorState message="Este link de aprovação expirou." />
        }

        // Approve attendance
        await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                status: 'APPROVED',
                approvalToken: null, // Invalidate token after use
                tokenExpiry: null,
            }
        })

        return <SuccessState
            message="Presença aprovada com sucesso!"
            apprentice={attendance.apprentice.name}
            activity={attendance.activity.name}
            date={attendance.date}
        />

    } catch (error) {
        console.error('Error approving attendance:', error)
        return <ErrorState message="Ocorreu um erro ao processar a aprovação." />
    }
}

function SuccessState({ message, apprentice, activity, date }: { message: string, apprentice: string, activity: string, date: Date }) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-100 mb-2">{message}</h1>

                <div className="bg-slate-800/50 rounded-lg p-4 my-6 text-left">
                    <p className="text-slate-400 text-sm mb-1">Aprendiz</p>
                    <p className="text-slate-200 font-medium mb-3">{apprentice}</p>

                    <p className="text-slate-400 text-sm mb-1">Atividade</p>
                    <p className="text-slate-200 font-medium mb-3">{activity}</p>

                    <p className="text-slate-400 text-sm mb-1">Data</p>
                    <p className="text-slate-200 font-medium">
                        {new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                </div>

                <Link
                    href="/login"
                    className="inline-block w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Ir para o App
                </Link>
            </div>
        </div>
    )
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <h1 className="text-xl font-bold text-slate-100 mb-4">{message}</h1>

                <Link
                    href="/login"
                    className="inline-block px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                    Voltar para o início
                </Link>
            </div>
        </div>
    )
}
