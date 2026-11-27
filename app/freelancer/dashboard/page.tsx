import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import FairWorkApp from '@/components/fairwork-app'
import { getDashboardActivity, getDashboardProjects } from '@/lib/dashboard-data'
import { auth } from '@/lib/auth'

export default async function FreelancerDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')
  if (session.user.accountType !== 'freelancer') {
    redirect(session.user.accountType === 'client' ? '/client/dashboard' : '/login')
  }
  const [initialProjects, initialActivity] = await Promise.all([
    getDashboardProjects(session.user.id, 'freelancer'),
    getDashboardActivity(session.user.id),
  ])
  return <FairWorkApp initialRole="Freelancer" currentUser={{ name: session.user.name, email: session.user.email }} initialProjects={initialProjects} initialActivity={initialActivity} />
}
