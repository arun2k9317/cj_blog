// List of allowed admin email addresses
export const ADMIN_EMAILS = [
    // Add your admin email addresses here
    // Example: 'admin@example.com',
    'arun2k9317@gmail.com',
    'arun.subramanian.4505@gmail.com',
    'nitinjamdar@gmail.com',
    'sreenisreedharan@gmail.com'
]

export function isAdminEmail(email: string | undefined): boolean {
    if (!email) return false
    return ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(email.toLowerCase())
}

