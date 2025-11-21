'use client'
import Link from 'next/link'

type Activity = {
    id: string
    name: string
}

type Attendance = {
    id: string
    activity: Activity
}

type User = {
    id: string
    name: string
    role: string
    attendancesAsApprentice: Attendance[]
}

const TARGETS = {
    "Sessão de Loja": 21,
    "Visitas Outras Lojas": 3,
    "Visitas Capítulo Demolay": 3,
    "Apresentação de Trabalhos": 3,
    "Seminário": 1,
    "Visitas a Instituições Filantrópicas": 2,
    "Telhamento": 1,
    "1ª Instrução": 1,
    "2ª Instrução": 1,
    "3ª Instrução": 1,
    "4ª Instrução": 1,
    "5ª Instrução": 1,
}

export default function ProgressDashboard({ users }: { users: User[] }) {
    const apprentices = users.filter(u => u.role === 'APPRENTICE')
    const fellowcrafts = users.filter(u => u.role === 'FELLOWCRAFT')

    const renderUserProgress = (user: User, excludedActivities: string[] = []) => {
        const counts = user.attendancesAsApprentice.reduce((acc, curr) => {
            const name = curr.activity.name

            // Always count the individual activity
            acc[name] = (acc[name] || 0) + 1

            // Telhamento, Instructions, and Apresentação de Trabalhos also count towards Sessão de Loja
            if (name === 'Telhamento' || name.includes('Instrução') || name === 'Apresentação de Trabalhos') {
                acc['Sessão de Loja'] = (acc['Sessão de Loja'] || 0) + 1
            }

            return acc
        }, {} as Record<string, number>)

        // Filter out excluded activities from TARGETS
        const filteredTargets = Object.entries(TARGETS).filter(
            ([activityName]) => !excludedActivities.includes(activityName)
        )

        return (
            <Link href={`/dashboard/admin/users/${user.id}`} key={user.id} className="block h-full group">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col h-full group-hover:border-amber-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-slate-200 truncate group-hover:text-amber-500 transition-colors" title={user.name}>{user.name}</h3>
                        <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">Ver Detalhes</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {filteredTargets.map(([activityName, target]) => {
                            const count = counts[activityName] || 0
                            const percentage = Math.min(100, (count / target) * 100)
                            const isComplete = count >= target

                            return (
                                <div key={activityName} className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span className="truncate pr-2" title={activityName}>{activityName}</span>
                                        <span>{count}/{target}</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-amber-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2">
                    Progresso dos Aprendizes
                    <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {apprentices.length}
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {apprentices.length > 0 ? (
                        apprentices.map(user => renderUserProgress(user))
                    ) : (
                        <p className="text-slate-400 italic col-span-full">Nenhum aprendiz encontrado.</p>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    Progresso dos Companheiros
                    <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        {fellowcrafts.length}
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {fellowcrafts.length > 0 ? (
                        fellowcrafts.map(user => renderUserProgress(user, ['Telhamento', '4ª Instrução', '5ª Instrução']))
                    ) : (
                        <p className="text-slate-400 italic col-span-full">Nenhum companheiro encontrado.</p>
                    )}
                </div>
            </section>
        </div>
    )
}
