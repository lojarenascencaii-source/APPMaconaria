'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type Activity = {
    id: string
    name: string
}

type Apprentice = {
    id: string
    name: string
}

type ApprovedAttendance = {
    id: string
    date: Date
    location: string
    observation: string | null
    activity: Activity
    apprentice: Apprentice
}

type SortField = 'date' | 'apprentice' | 'activity' | 'location'
type SortOrder = 'asc' | 'desc'

export default function ApprovedAttendanceTable({ approved }: { approved: ApprovedAttendance[] }) {
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

    const sortedApproved = useMemo(() => {
        const sorted = [...approved].sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sortField) {
                case 'date':
                    aValue = new Date(a.date).getTime()
                    bValue = new Date(b.date).getTime()
                    break
                case 'apprentice':
                    aValue = a.apprentice.name.toLowerCase()
                    bValue = b.apprentice.name.toLowerCase()
                    break
                case 'activity':
                    aValue = a.activity.name.toLowerCase()
                    bValue = b.activity.name.toLowerCase()
                    break
                case 'location':
                    aValue = a.location.toLowerCase()
                    bValue = b.location.toLowerCase()
                    break
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return sorted
    }, [approved, sortField, sortOrder])

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-40" />
        }
        return sortOrder === 'asc'
            ? <ArrowUp className="w-4 h-4 ml-1 inline text-amber-500" />
            : <ArrowDown className="w-4 h-4 ml-1 inline text-amber-500" />
    }

    return (
        <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400">
                <tr>
                    <th
                        className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none w-32"
                        onClick={() => handleSort('date')}
                    >
                        Data <SortIcon field="date" />
                    </th>
                    <th
                        className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none w-48"
                        onClick={() => handleSort('apprentice')}
                    >
                        Maçom <SortIcon field="apprentice" />
                    </th>
                    <th
                        className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none w-48"
                        onClick={() => handleSort('activity')}
                    >
                        Atividade <SortIcon field="activity" />
                    </th>
                    <th
                        className="p-4 cursor-pointer hover:text-amber-500 transition-colors select-none w-40"
                        onClick={() => handleSort('location')}
                    >
                        Local <SortIcon field="location" />
                    </th>
                    <th className="p-4 font-medium text-slate-400 w-64">Obs.</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {sortedApproved.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50">
                        <td className="p-4">{new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                        <td className="p-4">{item.apprentice.name}</td>
                        <td className="p-4">{item.activity.name}</td>
                        <td className="p-4">{item.location}</td>
                        <td className="p-4 text-slate-400 text-sm max-w-[200px] truncate" title={item.observation || ''}>
                            {item.observation || '-'}
                        </td>
                    </tr>
                ))}
                {sortedApproved.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma presença aprovada.</td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}
