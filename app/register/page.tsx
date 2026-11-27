import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    redirect(session.user.accountType === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard')
  }
  return <AuthForm mode="register" />
}
