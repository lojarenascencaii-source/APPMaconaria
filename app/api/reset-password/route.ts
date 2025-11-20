import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token e senha são obrigatórios' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'A senha deve ter pelo menos 6 caracteres' },
                { status: 400 }
            )
        }

        // Find user by reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Token inválido ou expirado' },
                { status: 400 }
            )
        }

        // Check if token is expired
        if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
            return NextResponse.json(
                { error: 'Token expirado. Solicite um novo link de recuperação.' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await hash(password, 10)

        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error resetting password:', error)
        return NextResponse.json(
            { error: 'Erro ao redefinir senha' },
            { status: 500 }
        )
    }
}
