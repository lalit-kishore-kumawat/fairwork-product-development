import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProjectWizard } from '@/components/project-wizard'
import { auth } from '@/lib/auth'

export default async function CreateProjectPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')
  if (session.user.accountType !== 'client') {
    redirect(session.user.accountType === 'freelancer' ? '/freelancer/dashboard' : '/login')
  }
  return <ProjectWizard />
}
