'use server'

import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import * as nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Encryption key (should be in env, but for simplicity using a fixed key)
const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET!.slice(0, 32)
const IV_LENGTH = 16

function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt(text: string): string {
    const parts = text.split(':')
    const iv = Buffer.from(parts.shift()!, 'hex')
    const encryptedText = Buffer.from(parts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }
    return session
}

export async function getEmailConfig() {
    await checkAdmin()

    const config = await prisma.emailConfig.findFirst()

    if (!config) {
        return null
    }

    // Return config without decrypted password
    return {
        id: config.id,
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
    }
}

export async function saveEmailConfig(formData: FormData) {
    await checkAdmin()

    const host = formData.get('host') as string
    const port = parseInt(formData.get('port') as string)
    const secure = formData.get('secure') === 'true'
    const user = formData.get('user') as string
    const password = formData.get('password') as string
    const fromEmail = formData.get('fromEmail') as string
    const fromName = formData.get('fromName') as string

    if (!host || !port || !user || !password || !fromEmail || !fromName) {
        throw new Error('All fields are required')
    }

    try {
        // Encrypt password
        const encryptedPassword = encrypt(password)

        // Check if config exists
        const existingConfig = await prisma.emailConfig.findFirst()

        if (existingConfig) {
            // Update existing config
            await prisma.emailConfig.update({
                where: { id: existingConfig.id },
                data: {
                    host,
                    port,
                    secure,
                    user,
                    password: encryptedPassword,
                    fromEmail,
                    fromName,
                },
            })
        } else {
            // Create new config
            await prisma.emailConfig.create({
                data: {
                    host,
                    port,
                    secure,
                    user,
                    password: encryptedPassword,
                    fromEmail,
                    fromName,
                },
            })
        }

        revalidatePath('/dashboard/admin/email-config')
    } catch (error) {
        console.error('Error saving email config:', error)
        throw new Error('Failed to save configuration')
    }
}

export async function testEmailConfig(formData: FormData) {
    await checkAdmin()

    const host = formData.get('host') as string
    const port = parseInt(formData.get('port') as string)
    const secure = formData.get('secure') === 'true'
    const user = formData.get('user') as string
    const password = formData.get('password') as string
    const fromEmail = formData.get('fromEmail') as string
    const fromName = formData.get('fromName') as string
    const testEmail = formData.get('testEmail') as string

    if (!host || !port || !user || !password || !fromEmail || !fromName || !testEmail) {
        throw new Error('All fields are required')
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass: password,
            },
        })

        await transporter.sendMail({
            from: `${fromName} <${fromEmail}>`,
            to: testEmail,
            subject: 'Teste de Configuração SMTP - App Maçonaria',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d97706;">Teste de Configuração SMTP</h2>
                    <p>Este é um email de teste para verificar a configuração do servidor SMTP.</p>
                    <p>Se você recebeu este email, a configuração está funcionando corretamente!</p>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">
                        <strong>Configuração testada:</strong><br>
                        Servidor: ${host}:${port}<br>
                        Usuário: ${user}<br>
                        Segurança: ${secure ? 'TLS/SSL' : 'Nenhuma'}
                    </p>
                </div>
            `,
        })

        console.log('Test email sent successfully')
    } catch (error: any) {
        console.error('Error testing email config:', error)
        throw new Error(`Falha ao enviar email de teste: ${error.message}`)
    }
}

export async function getDecryptedEmailConfig() {
    // This is only used internally by email.ts, not exposed to frontend
    const config = await prisma.emailConfig.findFirst()

    if (!config) {
        return null
    }

    return {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        password: decrypt(config.password),
        fromEmail: config.fromEmail,
        fromName: config.fromName,
    }
}
