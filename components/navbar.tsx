'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Menu, X } from 'lucide-react'

type User = {
    name?: string | null
    email?: string | null
    role: string
}

export default function Navbar({ user }: { user: User }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="text-xl font-bold text-amber-500">
                        App Maçonaria
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-slate-300 text-sm">Olá, {user.name}</span>

                        {user.role === 'ADMIN' && (
                            <>
                                <Link
                                    href="/dashboard/admin"
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Administração
                                </Link>
                                <Link
                                    href="/dashboard/approvals"
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    Minhas Aprovações
                                </Link>
                            </>
                        )}

                        {(user.role === 'MASTER' || user.role === 'FELLOWCRAFT' || user.role === 'APPRENTICE') && (
                            <Link
                                href="/dashboard/profile"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Meus Dados
                            </Link>
                        )}

                        <Link
                            href="/api/auth/signout"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800">
                    <div className="px-4 py-4 space-y-4">
                        <div className="text-slate-300 text-sm pb-2 border-b border-slate-800">
                            Olá, {user.name}
                        </div>

                        {user.role === 'ADMIN' && (
                            <>
                                <Link
                                    href="/dashboard/admin"
                                    className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Administração
                                </Link>
                                <Link
                                    href="/dashboard/approvals"
                                    className="block w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Minhas Aprovações
                                </Link>
                            </>
                        )}

                        {(user.role === 'MASTER' || user.role === 'FELLOWCRAFT' || user.role === 'APPRENTICE') && (
                            <Link
                                href="/dashboard/profile"
                                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Meus Dados
                            </Link>
                        )}

                        <Link
                            href="/api/auth/signout"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sair</span>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
