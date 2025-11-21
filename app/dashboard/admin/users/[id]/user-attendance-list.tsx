// @ts-nocheck
'use client'

import { useState } from 'react'
import { Trash2, Pencil, CheckCircle, XCircle, Clock } from 'lucide-react'
import { deleteAttendance, updateAttendance } from '@/app/actions'

type Attendance = {
    id: string
    date: Date
    location: string
    status: string
    activity: { name: string }
    master: { name: string }
}

type Activity = {
    id: string
    name: string
}

type Master = {
    id: string
    name: string
}

export default function UserAttendanceList({
    attendances,
    activities,
    masters
}: {
    attendances: Attendance[],
    activities: Activity[],
    masters: Master[]
}) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> Aprovada</span>
            case 'REJECTED':
                return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> Rejeitada</span>
            default:
                return <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> Pendente</span>
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-sm">
                        <th className="p-4 font-medium">Data</th>
                        <th className="p-4 font-medium">Atividade</th>
                        <th className="p-4 font-medium">Local</th>
                        <th className="p-4 font-medium">Mestre</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {attendances.map((attendance) => (
                        <tr key={attendance.id} className="hover:bg-slate-800/50 transition-colors">
                            {editingId === attendance.id ? (
                                <td colSpan={6} className="p-4 bg-slate-800/50">
                                    <form action={async (formData) => {
                                        await updateAttendance(formData)
                                        setEditingId(null)
                                    }} className="flex flex-wrap gap-4 items-end">
                                        <input type="hidden" name="id" value={attendance.id} />

                                        <div className="flex-1 min-w-[150px]">
                                            <label className="block text-xs text-slate-400 mb-1">Data</label>
                                            <input
                                                type="date"
                                                name="date"
                                                defaultValue={new Date(attendance.date).toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs text-slate-400 mb-1">Atividade</label>
                                            <select
                                                name="activityId"
                                                defaultValue={activities.find(a => a.name === attendance.activity.name)?.id}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 outline-none focus:border-amber-500"
                                            >
                                                {activities.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs text-slate-400 mb-1">Local</label>
                                            <input
                                                type="text"
                                                name="location"
                                                defaultValue={attendance.location}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs text-slate-400 mb-1">Mestre</label>
                                            <select
                                                name="masterId"
                                                defaultValue={masters.find(m => m.name === attendance.master.name)?.id}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200 outline-none focus:border-amber-500"
                                            >
                                                {masters.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-2 pb-0.5">
                                            <button
                                                type="submit"
                                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </td>
                            ) : (
                                <>
                                    <td className="p-4 text-slate-300">
                                        {new Date(attendance.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </td>
                                    <td className="p-4 text-slate-300">{attendance.activity.name}</td>
                                    <td className="p-4 text-slate-300">{attendance.location}</td>
                                    <td className="p-4 text-slate-300">{attendance.master.name}</td>
                                    <td className="p-4">{getStatusBadge(attendance.status)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingId(attendance.id)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            {deletingId === attendance.id ? (
                                                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded border border-red-500/50 absolute right-4 mt-[-8px]">
                                                    <span className="text-xs text-red-400 font-medium px-1">Confirmar?</span>
                                                    <form action={async () => {
                                                        await deleteAttendance(attendance.id)
                                                        setDeletingId(null)
                                                    }}>
                                                        <button className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Sim</button>
                                                    </form>
                                                    <button
                                                        onClick={() => setDeletingId(null)}
                                                        className="text-xs bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-600"
                                                    >
                                                        Não
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeletingId(attendance.id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                    {attendances.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                                Nenhuma atividade registrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
