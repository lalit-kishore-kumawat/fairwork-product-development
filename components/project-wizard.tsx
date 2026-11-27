'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react'
import { createProject } from '@/app/actions/projects'
import type { ProjectInput } from '@/lib/project-types'

type WizardMilestone = ProjectInput['milestones'][number] & { id: string }
const steps = ['Basics', 'Scope', 'Budget & dates', 'Milestones', 'Review']
const today = new Date().toISOString().slice(0, 10)
const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export function ProjectWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [objectives, setObjectives] = useState('')
  const [requirements, setRequirements] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [technicalRequirements, setTechnicalRequirements] = useState('')
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('')
  const [revisionLimit, setRevisionLimit] = useState('2')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [dueDate, setDueDate] = useState(defaultDueDate)
  const [milestones, setMilestones] = useState<WizardMilestone[]>([{ id: 'milestone-1', title: '', description: '', deliverable: '', amount: 0, dueDate: defaultDueDate, acceptanceCriteria: '' }])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const numericBudget = Number(budget) || 0
  const milestoneTotal = useMemo(() => milestones.reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0), [milestones])
  const amountMatches = Math.round(milestoneTotal * 100) === Math.round(numericBudget * 100)

  function updateMilestone(id: string, patch: Partial<WizardMilestone>) {
    setMilestones((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  }

  function validateCurrentStep() {
    if (step === 0 && (title.trim().length < 3 || !category || description.trim().length < 10)) return 'Add a title, category, and a short project description.'
    if (step === 1 && !requirements.trim() && !deliverables.trim()) return 'Add at least the project requirements or expected deliverables.'
    if (step === 2 && (!numericBudget || numericBudget < 1 || !startDate || !dueDate || dueDate < startDate)) return 'Add a valid budget and a due date on or after the start date.'
    if (step === 3) {
      if (milestones.length < 1 || milestones.some((item) => item.title.trim().length < 2 || !Number(item.amount) || !item.dueDate || item.dueDate < startDate || item.dueDate > dueDate)) return 'Each milestone needs a title, positive amount, and date within the project schedule.'
      if (!amountMatches) return 'Milestone amounts must add up exactly to the project budget.'
    }
    return ''
  }

  function nextStep() {
    const validationError = validateCurrentStep()
    if (validationError) { setError(validationError); return }
    setError('')
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step < steps.length - 1) { nextStep(); return }
    const validationError = validateCurrentStep()
    if (validationError) { setError(validationError); setStep(3); return }
    setPending(true)
    setError('')
    const project: ProjectInput = {
      title: title.trim(), category, description: description.trim(), objectives: objectives.trim(),
      requirements: requirements.trim(), deliverables: deliverables.trim(), technicalRequirements: technicalRequirements.trim(),
      acceptanceCriteria: acceptanceCriteria.trim(), revisionLimit: Number(revisionLimit), budget: numericBudget,
      currency: 'INR', startDate, dueDate,
      milestones: milestones.map(({ id: _id, ...milestone }) => ({ ...milestone, title: milestone.title.trim() })),
    }
    const result = await createProject(project)
    setPending(false)
    if (result.error) { setError(result.error); return }
    router.push('/client/dashboard')
    router.refresh()
  }

  return (
    <main className="wizard-page">
      <header className="wizard-topbar"><Link href="/client/dashboard" className="wizard-back"><ArrowLeft size={16} /> Back to workspace</Link><span className="wizard-brand">fair<span>work</span></span></header>
      <section className="wizard-layout">
        <div className="wizard-intro"><span className="hero-kicker"><i /> A CLEAR START</span><h1>Build a fair agreement, <em>one step at a time.</em></h1><p>Set expectations before work begins. Both sides can refer back to the same scope, dates, and milestones.</p><div className="wizard-trust"><Check size={15} />Milestone amounts must match the agreed budget.</div></div>
        <div className="wizard-card">
          <div className="wizard-progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
            {steps.map((label, index) => <div className={`wizard-step${index === step ? ' is-current' : ''}${index < step ? ' is-complete' : ''}`} key={label}><span>{index < step ? <Check size={12} /> : index + 1}</span><small>{label}</small></div>)}
          </div>
          <form onSubmit={handleSubmit} noValidate>
            {step === 0 && <div className="wizard-fields"><h2>Start with the basics</h2><p>Give the agreement a clear name and purpose.</p><label className="auth-field"><span>Project title</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="e.g. E-commerce website" /></label><label className="auth-field"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Choose a category</option><option>Web development</option><option>Design</option><option>Writing</option><option>Marketing</option><option>Video and photography</option><option>Other professional services</option></select></label><label className="auth-field"><span>Project description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} rows={4} placeholder="What are you creating, and why?" /></label></div>}
            {step === 1 && <div className="wizard-fields"><h2>Define the scope</h2><p>Make it easier to agree on what is included and what completion looks like.</p><label className="auth-field"><span>Objectives <small>Optional</small></span><textarea value={objectives} onChange={(event) => setObjectives(event.target.value)} rows={3} maxLength={5000} placeholder="What should this project achieve?" /></label><label className="auth-field"><span>Requirements</span><textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} rows={3} maxLength={5000} placeholder="Describe the work that is in scope." /></label><label className="auth-field"><span>Expected deliverables</span><textarea value={deliverables} onChange={(event) => setDeliverables(event.target.value)} rows={3} maxLength={5000} placeholder="What will be handed over?" /></label><label className="auth-field"><span>Technical requirements <small>Optional</small></span><textarea value={technicalRequirements} onChange={(event) => setTechnicalRequirements(event.target.value)} rows={2} maxLength={5000} placeholder="Tools, formats, platforms, or constraints" /></label><label className="auth-field"><span>Acceptance criteria <small>Optional</small></span><textarea value={acceptanceCriteria} onChange={(event) => setAcceptanceCriteria(event.target.value)} rows={2} maxLength={5000} placeholder="How will the work be reviewed?" /></label><label className="auth-field"><span>Included revision rounds</span><input type="number" min="0" max="20" value={revisionLimit} onChange={(event) => setRevisionLimit(event.target.value)} /></label></div>}
            {step === 2 && <div className="wizard-fields"><h2>Budget and timeline</h2><p>Choose the total agreement value and the dates that frame the work.</p><label className="auth-field"><span>Total budget <small>INR</small></span><div className="wizard-budget"><span>₹</span><input type="number" min="1" step="0.01" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="48,000" /></div></label><div className="wizard-date-grid"><label className="auth-field"><span>Start date</span><input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); if (dueDate < event.target.value) setDueDate(event.target.value) }} /></label><label className="auth-field"><span>Expected completion</span><input type="date" min={startDate} value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label></div><div className="wizard-note"><Check size={15} />The budget is an agreement record. FairWork does not hold or release funds.</div></div>}
            {step === 3 && <div className="wizard-fields"><div className="wizard-milestone-heading"><div><h2>Break it into milestones</h2><p>Give each outcome a clear deadline and amount.</p></div><strong className={amountMatches ? 'amount-match' : 'amount-mismatch'}>₹{milestoneTotal.toLocaleString('en-IN')} / ₹{numericBudget.toLocaleString('en-IN')}</strong></div>{milestones.map((milestone, index) => <fieldset className="milestone-editor" key={milestone.id}><legend>Milestone {index + 1}</legend>{milestones.length > 1 && <button type="button" className="remove-milestone" aria-label={`Remove milestone ${index + 1}`} onClick={() => setMilestones((current) => current.filter((item) => item.id !== milestone.id))}><Trash2 size={15} /></button>}<label className="auth-field"><span>Milestone title</span><input value={milestone.title} onChange={(event) => updateMilestone(milestone.id, { title: event.target.value })} maxLength={120} placeholder="e.g. First design review" /></label><label className="auth-field"><span>Deliverable</span><input value={milestone.deliverable} onChange={(event) => updateMilestone(milestone.id, { deliverable: event.target.value })} maxLength={2000} placeholder="What will be submitted?" /></label><div className="wizard-date-grid"><label className="auth-field"><span>Amount</span><div className="wizard-budget"><span>₹</span><input type="number" min="0.01" step="0.01" value={milestone.amount || ''} onChange={(event) => updateMilestone(milestone.id, { amount: Number(event.target.value) })} /></div></label><label className="auth-field"><span>Due date</span><input type="date" min={startDate} max={dueDate} value={milestone.dueDate} onChange={(event) => updateMilestone(milestone.id, { dueDate: event.target.value })} /></label></div><label className="auth-field"><span>Acceptance criteria <small>Optional</small></span><textarea value={milestone.acceptanceCriteria} onChange={(event) => updateMilestone(milestone.id, { acceptanceCriteria: event.target.value })} rows={2} maxLength={2000} placeholder="What does a successful review look like?" /></label></fieldset>)}<button type="button" className="add-milestone" onClick={() => setMilestones((current) => [...current, { id: `milestone-${Date.now()}`, title: '', description: '', deliverable: '', amount: 0, dueDate, acceptanceCriteria: '' }])}><Plus size={15} />Add milestone</button><p className="milestone-sum-note">Milestone amounts need to total the full project budget.</p></div>}
            {step === 4 && <div className="wizard-fields"><h2>Review the agreement</h2><p>Check the details before saving this project.</p><div className="review-block"><span>PROJECT</span><strong>{title}</strong><p>{category} · {startDate} to {dueDate}</p><p>{description}</p></div><div className="review-block"><span>SCOPE</span><p>{requirements || 'No detailed requirements provided.'}</p><p><b>Deliverables:</b> {deliverables || 'Not specified'}</p><p><b>Revisions:</b> {revisionLimit}</p></div><div className="review-block"><span>BUDGET &amp; MILESTONES</span><strong>₹{numericBudget.toLocaleString('en-IN')}</strong>{milestones.map((milestone, index) => <p key={milestone.id}>{index + 1}. {milestone.title} · ₹{Number(milestone.amount).toLocaleString('en-IN')} · due {milestone.dueDate}</p>)}</div></div>}
            {error && <p className="auth-error wizard-error" role="alert">{error}</p>}
            <div className="wizard-actions">{step > 0 ? <button type="button" className="wizard-previous" onClick={() => { setError(''); setStep((current) => current - 1) }}><ArrowLeft size={15} />Back</button> : <Link href="/client/dashboard" className="wizard-previous"><ArrowLeft size={15} />Cancel</Link>}<button type="submit" className="auth-submit wizard-next" disabled={pending}>{pending ? 'Saving agreement…' : step === steps.length - 1 ? 'Create agreement' : 'Continue'}{!pending && (step === steps.length - 1 ? <Check size={15} /> : <ArrowRight size={15} />)}</button></div>
          </form>
        </div>
      </section>
    </main>
  )
}
