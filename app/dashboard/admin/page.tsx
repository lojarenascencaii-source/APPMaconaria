import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUsers, createUser } from '@/app/admin-actions'
import UserTable from './user-table'

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const users = await getUsers()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-amber-500">Administração de Usuários</h1>
                    <div className="flex gap-4">
                        <a
                            href="/dashboard/admin/email-config"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Configuração de Email
                        </a>
                        <a href="/dashboard" className="text-slate-400 hover:text-white">Voltar ao Dashboard</a>
                    </div>
                </div>

                <section className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-semibold text-slate-200 mb-6">Novo Usuário</h2>
                    <form action={createUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Nome</label>
                            <input type="text" name="name" required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <input type="email" name="email" required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Celular</label>
                            <input type="tel" name="phone" placeholder="(11) 99999-9999" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
                            <input type="text" name="password" required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Grau</label>
                            <select name="role" required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="APPRENTICE">Aprendiz</option>
                                <option value="FELLOWCRAFT">Companheiro</option>
                                <option value="MASTER">Mestre</option>
                                <option value="ADMIN">Mestre Administrador</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Data de Iniciação</label>
                            <input type="date" name="initiationDate" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-200" />
                        </div>
                        <button type="submit" className="lg:col-span-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                            Criar Usuário
                        </button>
                    </form>
                </section>

                <section className="bg-slate-900 rounded-xl border border-slate-800">
                    <UserTable users={users} />
                </section>
            </div>
        </div>
    )
}
