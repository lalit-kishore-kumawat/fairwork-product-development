import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

const createdAt = () => timestamp('createdAt', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow()

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  accountType: text('accountType').notNull().default('client'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [index('session_user_id_idx').on(table.userId)])

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('account_user_id_idx').on(table.userId)])

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
})

export const projects = pgTable('projects', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  clientId: text('clientId').notNull().references(() => user.id),
  freelancerId: text('freelancerId').references(() => user.id),
  invitedEmail: text('invitedEmail'),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  objectives: text('objectives'),
  requirements: text('requirements'),
  deliverables: text('deliverables'),
  technicalRequirements: text('technicalRequirements'),
  acceptanceCriteria: text('acceptanceCriteria'),
  revisionLimit: integer('revisionLimit').notNull().default(2),
  budget: numeric('budget', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  currency: text('currency').notNull().default('INR'),
  startDate: date('startDate', { mode: 'string' }),
  dueDate: date('dueDate', { mode: 'string' }).notNull(),
  status: text('status').notNull().default('Invited'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('projects_client_id_idx').on(table.clientId), index('projects_freelancer_id_idx').on(table.freelancerId)])

export const milestones = pgTable('milestones', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  deliverable: text('deliverable').notNull().default(''),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  dueDate: date('dueDate', { mode: 'string' }).notNull(),
  acceptanceCriteria: text('acceptanceCriteria').notNull().default(''),
  status: text('status').notNull().default('Not started'),
  position: integer('position').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index('milestones_project_id_idx').on(table.projectId, table.position)])

export const projectActivity = pgTable('project_activity', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  actorId: text('actorId').notNull().references(() => user.id),
  eventType: text('eventType').notNull(),
  message: text('message').notNull(),
  createdAt: createdAt(),
}, (table) => [index('project_activity_project_id_idx').on(table.projectId, table.createdAt)])

export const deliverables = pgTable('deliverables', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  milestoneId: text('milestoneId').notNull().references(() => milestones.id, { onDelete: 'cascade' }),
  submittedById: text('submittedById').notNull().references(() => user.id),
  description: text('description').notNull(),
  fileUrl: text('fileUrl'),
  fileName: text('fileName'),
  reviewStatus: text('reviewStatus').notNull().default('Submitted'),
  reviewFeedback: text('reviewFeedback'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const disputes = pgTable('disputes', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  raisedById: text('raisedById').notNull().references(() => user.id),
  category: text('category').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Open'),
  resolution: text('resolution'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const payments = pgTable('payments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
  projectId: text('projectId').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  milestoneId: text('milestoneId').notNull().references(() => milestones.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2, mode: 'number' }).notNull(),
  status: text('status').notNull().default('Pending'),
  reference: text('reference'),
  createdAt: createdAt(),
})
