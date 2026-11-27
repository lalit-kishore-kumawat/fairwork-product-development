'use server'

import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { milestones, projectActivity, projects } from '@/lib/db/schema'
import type { DashboardProject, ProjectInput } from '@/lib/project-types'

function isValidDate(value: string) {
  if (typeof value !== 'string' || value.length !== 10) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function getInitials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'FW'
}

export async function createProject(input: ProjectInput): Promise<{ project?: DashboardProject; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: 'Sign in to create a project.' }
  if (session.user.accountType !== 'client') return { error: 'Only client accounts can create projects.' }

  if (!input || typeof input !== 'object') return { error: 'Check the project details and try again.' }
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const category = typeof input.category === 'string' ? input.category.trim() : ''
  const description = typeof input.description === 'string' ? input.description.trim() : ''
  const budgetCents = Math.round(Number(input.budget) * 100)
  if (!Array.isArray(input.milestones) || input.milestones.length < 1 || input.milestones.length > 20 || input.milestones.some((milestone) => !milestone || typeof milestone !== 'object')) {
    return { error: 'Add between 1 and 20 valid milestones.' }
  }
  const milestonesInput = input.milestones
  const totalCents = milestonesInput.reduce((sum, milestone) => sum + Math.round(Number(milestone.amount) * 100), 0)

  if (title.length < 3 || title.length > 120 || category.length < 2 || category.length > 80 || description.length < 10 || description.length > 5000) {
    return { error: 'Add a project title, category, and a description of at least 10 characters.' }
  }
  if (!Number.isSafeInteger(budgetCents) || budgetCents < 100 || budgetCents > 100_000_000_00) {
    return { error: 'Enter a valid project budget.' }
  }
  if (totalCents !== budgetCents) return { error: 'Milestone amounts must add up to the project budget.' }
  if (!isValidDate(input.startDate) || !isValidDate(input.dueDate) || input.dueDate < input.startDate) {
    return { error: 'Choose valid project dates. The due date must be on or after the start date.' }
  }
  if (!Number.isInteger(input.revisionLimit) || input.revisionLimit < 0 || input.revisionLimit > 20) {
    return { error: 'Revision limit must be between 0 and 20.' }
  }

  const safeMilestones = milestonesInput.map((milestone) => ({
    title: typeof milestone.title === 'string' ? milestone.title.trim() : '',
    description: typeof milestone.description === 'string' ? milestone.description.trim() : '',
    deliverable: typeof milestone.deliverable === 'string' ? milestone.deliverable.trim() : '',
    amount: Number(milestone.amount),
    dueDate: typeof milestone.dueDate === 'string' ? milestone.dueDate : '',
    acceptanceCriteria: typeof milestone.acceptanceCriteria === 'string' ? milestone.acceptanceCriteria.trim() : '',
  }))
  if (safeMilestones.some((milestone) => milestone.title.length < 2 || milestone.title.length > 120 || milestone.amount <= 0 || Math.round(milestone.amount * 100) < 1 || !Number.isFinite(milestone.amount) || !isValidDate(milestone.dueDate) || milestone.dueDate < input.startDate || milestone.dueDate > input.dueDate)) {
    return { error: 'Check each milestone title, amount, and date.' }
  }

  const safeText = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
  const projectStatus = 'Draft'

  try {
    const created = await db.transaction(async (tx) => {
      const [project] = await tx.insert(projects).values({
        clientId: session.user.id,
        invitedEmail: null,
        title,
        category,
        description,
        objectives: safeText(input.objectives, 5000) || null,
        requirements: safeText(input.requirements, 5000) || null,
        deliverables: safeText(input.deliverables, 5000) || null,
        technicalRequirements: safeText(input.technicalRequirements, 5000) || null,
        acceptanceCriteria: safeText(input.acceptanceCriteria, 5000) || null,
        revisionLimit: input.revisionLimit,
        budget: Number((budgetCents / 100).toFixed(2)),
        currency: 'INR',
        startDate: input.startDate,
        dueDate: input.dueDate,
        status: projectStatus,
      }).returning()

      const createdMilestones = await tx.insert(milestones).values(safeMilestones.map((milestone, position) => ({
        projectId: project.id,
        title: milestone.title,
        description: milestone.description,
        deliverable: milestone.deliverable,
        amount: Number((Math.round(milestone.amount * 100) / 100).toFixed(2)),
        dueDate: milestone.dueDate,
        acceptanceCriteria: milestone.acceptanceCriteria,
        position,
      }))).returning()

      await tx.insert(projectActivity).values({
        projectId: project.id,
        actorId: session.user.id,
        eventType: 'project_created',
        message: `Created the project agreement for ${title}.`,
      })

      return { project, createdMilestones }
    })

    const dashboardProject: DashboardProject = {
      id: created.project.id,
      title: created.project.title,
      category: created.project.category,
      person: 'Freelancer not assigned',
      initials: getInitials('Freelancer not assigned'),
      color: 'sage',
      budget: created.project.budget,
      progress: 0,
      due: new Date(`${created.project.dueDate}T12:00:00`).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: projectStatus,
      milestones: created.createdMilestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        amount: milestone.amount,
        status: 'Not started',
        dueDate: milestone.dueDate,
      })),
    }

    revalidatePath('/client/dashboard')
    revalidatePath('/freelancer/dashboard')
    return { project: dashboardProject }
  } catch {
    return { error: 'We could not save this project. Please try again.' }
  }
}

export async function updateMilestoneReview(milestoneId: string, decision: 'Approved' | 'Revision requested') {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { error: 'Sign in to review this milestone.' }
  if (session.user.accountType !== 'client') return { error: 'Only the client can review submitted work.' }
  if (typeof milestoneId !== 'string' || milestoneId.length > 80 || !['Approved', 'Revision requested'].includes(decision)) return { error: 'This milestone could not be found.' }

  const [record] = await db
    .select({ milestone: milestones, projectTitle: projects.title })
    .from(milestones)
    .innerJoin(projects, eq(projects.id, milestones.projectId))
    .where(and(eq(milestones.id, milestoneId), eq(projects.clientId, session.user.id)))
    .limit(1)

  if (!record || record.milestone.status !== 'Submitted') return { error: 'This milestone is no longer awaiting review.' }

  await db.transaction(async (tx) => {
    await tx.update(milestones).set({ status: decision, updatedAt: new Date() }).where(eq(milestones.id, milestoneId))
    await tx.insert(projectActivity).values({
      projectId: record.milestone.projectId,
      actorId: session.user.id,
      eventType: decision === 'Approved' ? 'milestone_approved' : 'revision_requested',
      message: decision === 'Approved'
        ? `Approved the ${record.milestone.title} milestone in ${record.projectTitle}.`
        : `Requested a revision for the ${record.milestone.title} milestone in ${record.projectTitle}.`,
    })
  })

  revalidatePath('/client/dashboard')
  revalidatePath('/freelancer/dashboard')
  return { success: true as const }
}
