import * as nodemailer from 'nodemailer'
import { getDecryptedEmailConfig } from '@/app/email-config-actions'

async function getTransporter() {
    const config = await getDecryptedEmailConfig()

    if (!config) {
        throw new Error('Email configuration not found. Please configure SMTP settings in admin panel.')
    }

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.password,
        },
    })
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    const config = await getDecryptedEmailConfig()

    if (!config) {
        console.error('❌ Email configuration not found')
        return { error: 'Email not configured' }
    }

    console.log('Attempting to send password reset email to:', email)
    console.log('From:', config.fromEmail)

    try {
        const transporter = await getTransporter()

        const result = await transporter.sendMail({
            from: `${config.fromName} <${config.fromEmail}>`,
            to: email,
            subject: 'Recuperação de Senha - App Maçonaria',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d97706;">Recuperação de Senha</h2>
                    <p>Você solicitou a recuperação de senha.</p>
                    <p>Clique no botão abaixo para criar uma nova senha:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #d97706; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                        Redefinir Senha
                    </a>
                    <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
                    <p style="color: #666; font-size: 14px;">Se você não solicitou esta recuperação, ignore este email.</p>
                </div>
            `,
        })
        console.log('✅ Password reset email sent successfully!', result)
        return { success: true }
    } catch (error: any) {
        console.error('❌ Error sending password reset email:', error)
        console.error('Error details:', error.message)
        return { error: 'Failed to send email' }
    }
}

export async function sendApprovalNotification(
    masterEmail: string,
    masterName: string,
    apprenticeName: string,
    activityName: string,
    date: string,
    location: string,
    attendanceId: string,
    approvalToken?: string
) {
    const approvalUrl = `${process.env.NEXTAUTH_URL}/dashboard/approvals`
    const directApprovalUrl = approvalToken ? `${process.env.NEXTAUTH_URL}/approve/${approvalToken}` : null
    const config = await getDecryptedEmailConfig()

    if (!config) {
        console.error('❌ Email configuration not found')
        return { error: 'Email not configured' }
    }

    console.log('Attempting to send approval notification to:', masterEmail)
    console.log('From:', config.fromEmail)

    try {
        const transporter = await getTransporter()

        const result = await transporter.sendMail({
            from: `${config.fromName} <${config.fromEmail}>`,
            to: masterEmail,
            subject: `Nova Presença para Aprovar - ${apprenticeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d97706;">Nova Solicitação de Aprovação</h2>
                    <p>Olá, ${masterName}!</p>
                    <p><strong>${apprenticeName}</strong> registrou uma nova presença que precisa da sua aprovação:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 8px 0;"><strong>Atividade:</strong> ${activityName}</p>
                        <p style="margin: 8px 0;"><strong>Data:</strong> ${date}</p>
                        <p style="margin: 8px 0;"><strong>Local:</strong> ${location}</p>
                    </div>

                    ${directApprovalUrl ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${directApprovalUrl}" style="display: inline-block; padding: 16px 32px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            ✅ Aprovar Atividade
                        </a>
                        <p style="color: #666; font-size: 12px; margin-top: 10px;">Este link aprova automaticamente sem precisar de senha.</p>
                    </div>
                    ` : `
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${approvalUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            Acessar Painel para Aprovar
                        </a>
                    </div>
                    `}
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Se o botão não funcionar, acesse: <a href="${approvalUrl}" style="color: #666;">${approvalUrl}</a>
                    </p>
                </div>
            `,
        })
        console.log('✅ Approval notification sent successfully!', result)
        return { success: true }
    } catch (error: any) {
        console.error('❌ Error sending approval notification:', error)
        console.error('Error details:', error.message)
        return { error: 'Failed to send email' }
    }
}
