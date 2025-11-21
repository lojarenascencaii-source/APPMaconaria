// @ts-nocheck
'use client'

import { useState, useMemo } from 'react'
import { Pencil, Trash2, X, Mail, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { deleteAttendance, updateAttendance, resendApprovalRequest } from '@/app/actions'

type Activity = {
    id: string
    name: string
}

type Master = {
    id: string
    name: string
}

type AttendanceItem = {
    id: string
    date: Date
    location: string
    status: string
    observation: string | null
    activity: Activity
    master: Master
}

type SortField = 'date' | 'activity' | 'location' | 'master' | 'status'
type SortOrder = 'asc' | 'desc'

export default function AttendanceTable({
    history,
    activities,
    masters
}: {
    history: AttendanceItem[]
    activities: Activity[]
    masters: Master[]
}) {
    const [editingItem, setEditingItem] = useState<AttendanceItem | null>(null)
    const [sortField, setSortField] = useState<SortField>('date')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const sortedHistory = useMemo(() => {
        const sorted = [...history].sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sortField) {
                case 'date':
                    aValue = new Date(a.date).getTime()
                    bValue = new Date(b.date).getTime()
                    break
                case 'activity':
                    aValue = a.activity.name.toLowerCase()
                    bValue = b.activity.name.toLowerCase()
                    break
                case 'location':
                    aValue = a.location.toLowerCase()
                    bValue = b.location.toLowerCase()
                    break
                case 'master':
                    aValue = a.master.name.toLowerCase()
                    bValue = b.master.name.toLowerCase()
                    break
                case 'status':
                    aValue = a.status.toLowerCase()
                    bValue = b.status.toLowerCase()
                    break
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return sorted
    }, [history, sortField, sortOrder])

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />
        }
        return sortOrder === 'asc'
            ? <ArrowUp className="w-4 h-4 ml-1 inline text-amber-500" />
            : <ArrowDown className="w-4 h-4 ml-1 inline text-amber-500" />
    }

    return (
        <>
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 w-full max-w-md relative">
                        <button
                            onClick={() => setEditingItem(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-amber-500 mb-6">Editar Presença</h2>
                        <form action={async (formData) => {
                            const result = await updateAttendance(formData)
                            if (result?.error) {
                                alert(result.error)
                            } else {
                                setEditingItem(null)
                            }
                        }} className="space-y-4">
                            <input type="hidden" name="id" value={editingItem.id} />
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                                <input
                                    type="date"
                                    name="date"
                                    defaultValue={new Date(editingItem.date).toISOString().split('T')[0]}
                                    required
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Local</label>
                                <input
                                    type="text"
                                    name="location"
                                    defaultValue={editingItem.location}
                                    required
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Atividade</label>
                                <select
                                    name="activityId"
                                    defaultValue={editingItem.activity.id}
                                    required
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                >
                                    {activities.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Mestre Responsável</label>
                                <select
                                    name="masterId"
                                    defaultValue={editingItem.master.id}
                                    required
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                >
                                    {masters.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors">
                                Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400">
                    <tr>
                        <th
                            className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none"
                            onClick={() => handleSort('date')}
                        >
                            Data <SortIcon field="date" />
                        </th>
                        <th
                            className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none"
                            onClick={() => handleSort('activity')}
                        >
                            Atividade <SortIcon field="activity" />
                        </th>
                        <th
                            className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none"
                            onClick={() => handleSort('location')}
                        >
                            Local <SortIcon field="location" />
                        </th>
                        <th className="p-4 font-medium text-slate-400">Obs.</th>
                        <th
                            className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none"
                            onClick={() => handleSort('master')}
                        >
                            Mestre <SortIcon field="master" />
                        </th>
                        <th
                            className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none"
                            onClick={() => handleSort('status')}
                        >
                            Status <SortIcon field="status" />
                        </th>
                        <th className="p-4">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {sortedHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/50">
                            <td className="p-4">{new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                            <td className="p-4">{item.activity.name}</td>
                            <td className="p-4">{item.location}</td>
                            <td className="p-4 text-slate-400 text-sm max-w-[200px] truncate" title={item.observation || ''}>
                                {item.observation || '-'}
                            </td>
                            <td className="p-4">{item.master.name}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' :
                                    item.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                                        'bg-yellow-500/10 text-yellow-400'
                                    }`}>
                                    {item.status === 'APPROVED' ? 'Aprovado' : item.status === 'REJECTED' ? 'Rejeitado' : 'Pendente'}
                                </span>
                            </td>
                            <td className="p-4">
                                {item.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <form action={async () => {
                                            const result = await resendApprovalRequest(item.id)
                                            if (result?.error) {
                                                alert(result.error)
                                            } else {
                                                alert('Solicitação reenviada com sucesso!')
                                            }
                                        }}>
                                            <button
                                                type="submit"
                                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                                title="Reenviar Solicitação"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        </form>
                                        <form action={deleteAttendance.bind(null, item.id)}>
                                            <button
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {history.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">Nenhum registro encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    )
}
