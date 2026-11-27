export type ProjectStatus = 'Draft' | 'In progress' | 'Needs review' | 'At risk' | 'Completed' | 'Invited'

export type MilestoneStatus = 'Approved' | 'In progress' | 'Not started' | 'Submitted' | 'Revision requested' | 'Paid'

export type DashboardMilestone = {
  id: string
  title: string
  amount: number
  status: MilestoneStatus
  dueDate: string
}

export type DashboardActivity = {
  id: string
  initials: string
  name: string
  message: string
  createdAt: string
}

export type DashboardProject = {
  id: string
  title: string
  category: string
  person: string
  initials: string
  color: 'sage' | 'lavender' | 'peach' | 'blue'
  budget: number
  progress: number
  due: string
  status: ProjectStatus
  milestones: DashboardMilestone[]
}

export type ProjectInput = {
  title: string
  category: string
  description: string
  objectives: string
  requirements: string
  deliverables: string
  technicalRequirements: string
  acceptanceCriteria: string
  revisionLimit: number
  budget: number
  currency: string
  startDate: string
  dueDate: string
  milestones: {
    title: string
    description: string
    deliverable: string
    amount: number
    dueDate: string
    acceptanceCriteria: string
  }[]
}
