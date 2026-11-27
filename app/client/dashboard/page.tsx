import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import FairWorkApp from '@/components/fairwork-app'
import { getDashboardActivity, getDashboardProjects } from '@/lib/dashboard-data'
import { auth } from '@/lib/auth'

export default async function ClientDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')
  if (session.user.accountType !== 'client') {
    redirect(session.user.accountType === 'freelancer' ? '/freelancer/dashboard' : '/login')
  }
  const [initialProjects, initialActivity] = await Promise.all([
    getDashboardProjects(session.user.id, 'client'),
    getDashboardActivity(session.user.id),
  ])
  return <FairWorkApp initialRole="Client" currentUser={{ name: session.user.name, email: session.user.email }} initialProjects={initialProjects} initialActivity={initialActivity} />
}
