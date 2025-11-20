'use client'

type Activity = {
    id: string
    name: string
}

type Attendance = {
    id: string
    activity: Activity
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

export default function PersonalProgress({
    attendances,
    excludedActivities = []
}: {
    attendances: Attendance[]
    excludedActivities?: string[]
}) {
    const counts = attendances.reduce((acc, curr) => {
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
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-2xl font-semibold text-amber-500 mb-6">Meu Progresso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTargets.map(([activityName, target]) => {
                    const count = counts[activityName] || 0
                    const percentage = Math.min(100, (count / target) * 100)
                    const isComplete = count >= target

                    return (
                        <div key={activityName} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300 font-medium truncate pr-2" title={activityName}>{activityName}</span>
                                <span className="text-slate-400 font-semibold">{count}/{target}</span>
                            </div>
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
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
    )
}
