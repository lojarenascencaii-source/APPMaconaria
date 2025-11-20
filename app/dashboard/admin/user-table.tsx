'use client'

import { useState, useRef, useEffect } from 'react'
import { Trash2, Key, Pencil, X } from 'lucide-react'
import { deleteUser, updatePassword, updateUser } from '@/app/admin-actions'

type User = {
    id: string
    name: string
    email: string
    role: string
    level: string | null
    initiationDate: Date | null
}

export default function UserTable({ users }: { users: User[] }) {
    const [openPasswordId, setOpenPasswordId] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setOpenPasswordId(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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
        <>
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 w-full max-w-md relative">
                        <button
                            onClick={() => setEditingUser(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-amber-500 mb-6">Editar Usuário</h2>
                        <form action={async (formData) => {
                            const result = await updateUser(formData)
                            if (result?.error) {
                                alert(result.error)
                            } else {
                                setEditingUser(null)
                            }
                        }} className="space-y-4">
                            <input type="hidden" name="id" value={editingUser.id} />
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nome</label>
                                <input type="text" name="name" defaultValue={editingUser.name} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                <input type="email" name="email" defaultValue={editingUser.email} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Celular</label>
                                <input type="tel" name="phone" defaultValue={editingUser.phone || ''} placeholder="(11) 99999-9999" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Função</label>
                                <select name="role" defaultValue={editingUser.role} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                    <option value="APPRENTICE">Aprendiz</option>
                                    <option value="FELLOWCRAFT">Companheiro</option>
                                    <option value="MASTER">Mestre</option>
                                    <option value="ADMIN">Mestre Administrador</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Data de Iniciação</label>
                                <input
                                    type="date"
                                    name="initiationDate"
                                    defaultValue={editingUser.initiationDate ? new Date(editingUser.initiationDate).toISOString().split('T')[0] : ''}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-200"
                                />
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
                        <th className="p-4">Nome</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Celular</th>
                        <th className="p-4">Função</th>
                        <th className="p-4">Iniciação</th>
                        <th className="p-4">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/50">
                            <td className="p-4">{user.name}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">{user.phone || '-'}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' :
                                    user.role === 'MASTER' ? 'bg-blue-500/10 text-blue-400' :
                                        user.role === 'FELLOWCRAFT' ? 'bg-green-500/10 text-green-400' :
                                            'bg-amber-500/10 text-amber-400'
                                    }`}>
                                    {getRoleLabel(user.role)}
                                </span>
                            </td>
                            <td className="p-4 text-slate-400">
                                {user.initiationDate ? new Date(user.initiationDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                            </td>
                            <td className="p-4 flex items-center gap-2">
                                <button
                                    onClick={() => setEditingUser(user)}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>

                                <form action={deleteUser.bind(null, user.id)}>
                                    <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </form>

                                <div className="relative" ref={openPasswordId === user.id ? popupRef : null}>
                                    <button
                                        onClick={() => setOpenPasswordId(openPasswordId === user.id ? null : user.id)}
                                        className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer transition-colors"
                                        title="Alterar Senha"
                                    >
                                        <Key className="w-4 h-4" />
                                    </button>

                                    {openPasswordId === user.id && (
                                        <div className="absolute right-0 z-10 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
                                            <form action={async (formData) => {
                                                const result = await updatePassword(formData)
                                                if (result?.error) {
                                                    alert(result.error)
                                                } else {
                                                    setOpenPasswordId(null)
                                                }
                                            }} className="space-y-2">
                                                <input type="hidden" name="id" value={user.id} />
                                                <input type="text" name="password" placeholder="Nova senha" required className="w-full px-3 py-1 bg-slate-900 border border-slate-600 rounded text-sm outline-none" />
                                                <button type="submit" className="w-full px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded">
                                                    Salvar
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
