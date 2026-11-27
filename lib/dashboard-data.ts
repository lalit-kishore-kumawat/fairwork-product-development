import { desc, eq, inArray, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { milestones, projectActivity, projects, user } from '@/lib/db/schema'
import type { DashboardActivity, DashboardMilestone, DashboardProject, MilestoneStatus, ProjectStatus } from '@/lib/project-types'

const colorPalette: DashboardProject['color'][] = ['sage', 'lavender', 'peach', 'blue']
const knownProjectStatuses: ProjectStatus[] = ['Draft', 'In progress', 'Needs review', 'At risk', 'Completed', 'Invited']
const knownMilestoneStatuses: MilestoneStatus[] = ['Approved', 'In progress', 'Not started', 'Submitted', 'Revision requested', 'Paid']

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'FW'
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function getDashboardActivity(userId: string): Promise<DashboardActivity[]> {
  const rows = await db
    .select({
      id: projectActivity.id,
      name: user.name,
      message: projectActivity.message,
      createdAt: projectActivity.createdAt,
    })
    .from(projectActivity)
    .innerJoin(projects, eq(projects.id, projectActivity.projectId))
    .innerJoin(user, eq(user.id, projectActivity.actorId))
    .where(or(eq(projects.clientId, userId), eq(projects.freelancerId, userId)))
    .orderBy(desc(projectActivity.createdAt))
    .limit(8)

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    initials: initials(row.name),
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function getDashboardProjects(userId: string, accountType: 'client' | 'freelancer') {
  const rows = await db
    .select({ project: projects, clientName: user.name })
    .from(projects)
    .innerJoin(user, eq(user.id, projects.clientId))
    .where(or(eq(projects.clientId, userId), eq(projects.freelancerId, userId)))
    .orderBy(desc(projects.updatedAt))

  if (rows.length === 0) return []

  const projectIds = rows.map(({ project }) => project.id)
  const partnerIds = rows
    .map(({ project }) => accountType === 'client' ? project.freelancerId : project.clientId)
    .filter((id): id is string => Boolean(id) && id !== userId)
  const [milestoneRows, partnerRows] = await Promise.all([
    db.select().from(milestones).where(inArray(milestones.projectId, projectIds)).orderBy(milestones.position),
    partnerIds.length ? db.select({ id: user.id, name: user.name }).from(user).where(inArray(user.id, partnerIds)) : Promise.resolve([]),
  ])

  const partnerNames = new Map(partnerRows.map((partner) => [partner.id, partner.name]))
  const milestonesByProject = new Map<string, DashboardMilestone[]>()
  for (const milestone of milestoneRows) {
    const status = knownMilestoneStatuses.includes(milestone.status as MilestoneStatus)
      ? milestone.status as MilestoneStatus
      : 'Not started'
    const list = milestonesByProject.get(milestone.projectId) ?? []
    list.push({ id: milestone.id, title: milestone.title, amount: milestone.amount, status, dueDate: milestone.dueDate })
    milestonesByProject.set(milestone.projectId, list)
  }

  return rows.map(({ project, clientName }, index): DashboardProject => {
    const projectMilestones = milestonesByProject.get(project.id) ?? []
    const approvedCount = projectMilestones.filter((milestone) => ['Approved', 'Paid'].includes(milestone.status)).length
    const status = knownProjectStatuses.includes(project.status as ProjectStatus)
      ? project.status as ProjectStatus
      : 'In progress'
    const partnerName = accountType === 'client'
      ? (project.freelancerId ? partnerNames.get(project.freelancerId) || 'Freelancer' : project.invitedEmail || 'Freelancer not assigned')
      : clientName || 'Client'
    return {
      id: project.id,
      title: project.title,
      category: project.category,
      person: partnerName,
      initials: initials(partnerName),
      color: colorPalette[index % colorPalette.length],
      budget: project.budget,
      progress: projectMilestones.length ? Math.round((approvedCount / projectMilestones.length) * 100) : 0,
      due: formatDate(project.dueDate),
      status,
      milestones: projectMilestones,
    }
  })
}
