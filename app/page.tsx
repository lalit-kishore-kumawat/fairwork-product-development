import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, CircleHelp, FileCheck2, Flag, ShieldCheck, WalletCards } from 'lucide-react'

const features = [
  { icon: FileCheck2, title: 'Agreements that stay clear', description: 'Set the scope, deliverables, revision limits, and expectations before work begins.' },
  { icon: Flag, title: 'Milestones with meaning', description: 'Break a big commitment into smaller outcomes with an owner, deadline, and acceptance criteria.' },
  { icon: ShieldCheck, title: 'A shared record of work', description: 'Keep submissions, approvals, revisions, and decisions together for both sides.' },
  { icon: WalletCards, title: 'Payment status, in context', description: 'Track what is due against each milestone. FairWork records payment status; it does not hold funds.' },
]

export default function HomePage() {
  return (
    <main className="marketing-page">
      <header className="marketing-nav">
        <Link href="/" className="marketing-brand" aria-label="FairWork home"><span className="auth-brand-mark"><i /><i /><i /></span><span>fair<span>work</span></span></Link>
        <nav aria-label="Main navigation" className="marketing-links"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#for-clients">For clients</a><a href="#for-freelancers">For freelancers</a></nav>
        <div className="marketing-actions"><Link href="/login" className="marketing-login">Log in</Link><Link href="/register" className="marketing-cta">Get started <ArrowRight size={15} /></Link></div>
      </header>

      <section className="marketing-hero">
        <div className="hero-copy">
          <span className="hero-kicker"><i /> WORK, WITH THE DETAILS TAKEN CARE OF</span>
          <h1>Freelance projects deserve <em>better accountability.</em></h1>
          <p>Stop relying on promises. Agree on the work, track milestones, and keep a shared record from kickoff to sign-off.</p>
          <div className="hero-actions"><Link href="/register" className="marketing-cta marketing-cta-large">Create your free workspace <ArrowRight size={16} /></Link><a href="#how-it-works" className="hero-secondary">See how it works <ArrowDown size={15} /></a></div>
          <div className="hero-trust"><ShieldCheck size={16} /><span>Built to keep expectations clear for both sides.</span></div>
        </div>
        <div className="hero-visual" aria-label="Illustration of a milestone-based project workspace">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="preview-window">
            <div className="preview-top"><span className="preview-brand"><span className="mini-mark">f</span> fairwork</span><span className="preview-tag">PROJECT WORKSPACE</span></div>
            <div className="preview-project"><div><span className="preview-label">PROJECT AGREEMENT</span><h2>Website redesign</h2><p>Northstar Studio <span>·</span> with Aanya Kapoor</p></div><span className="preview-status"><i /> In progress</span></div>
            <div className="preview-budget"><span>Agreed budget</span><strong>₹48,000</strong><span className="budget-progress"><i /></span><small>2 of 4 milestones approved</small></div>
            <div className="preview-milestones"><div className="preview-row is-done"><span className="milestone-check"><Check size={12} /></span><div><b>Discovery &amp; direction</b><small>Approved · ₹8,000</small></div><span className="row-date">12 Jun</span></div><div className="preview-row is-active"><span className="milestone-number">02</span><div><b>Design system</b><small>In progress · ₹12,000</small></div><span className="row-date">Due 19 Jun</span></div><div className="preview-row"><span className="milestone-number">03</span><div><b>Page templates</b><small>Not started · ₹18,000</small></div><span className="row-date">26 Jun</span></div></div>
            <div className="preview-activity"><span className="activity-dot" /><span><b>Aanya submitted</b> the first design review</span><small>Today, 10:42</small></div>
          </div>
          <div className="floating-note"><span><Check size={13} /></span><div><b>Scope stays visible</b><small>For everyone on the project</small></div></div>
        </div>
      </section>

      <section className="marketing-strip" aria-label="FairWork principles"><span>Clear scope</span><i /><span>Visible progress</span><i /><span>Documented decisions</span><i /><span>Fair to both sides</span></section>

      <section className="marketing-section how-section" id="how-it-works">
        <div className="section-heading"><span className="hero-kicker"><i /> A BETTER WAY TO COLLABORATE</span><h2>Good work starts with<br /><em>good expectations.</em></h2><p>FairWork turns informal promises into a workflow both people can see and trust.</p></div>
        <div className="steps-grid"><article><span>01</span><h3>Agree on the work</h3><p>Write down scope, budget, deadlines, revision limits, and what done means.</p></article><article><span>02</span><h3>Break it into milestones</h3><p>Turn the project into clear deliverables with dates and acceptance criteria.</p></article><article><span>03</span><h3>Share progress as it happens</h3><p>Submit work, review it, and keep decisions in one shared activity record.</p></article><article><span>04</span><h3>Close the loop fairly</h3><p>Approve, request a revision, or document a concern against the original agreement.</p></article></div>
      </section>

      <section className="marketing-section features-section" id="features">
        <div className="section-heading section-heading-row"><div><span className="hero-kicker"><i /> THE ACCOUNTABILITY LAYER</span><h2>Clarity, built into<br />the way work gets done.</h2></div><p>Not another marketplace. A shared place to keep the agreement and the work aligned.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, description }, index) => <article className="feature-card" key={title}><span className={`feature-icon feature-icon-${index}`}><Icon size={19} /></span><h3>{title}</h3><p>{description}</p><ArrowUpRight size={15} className="feature-arrow" /></article>)}</div>
      </section>

      <section className="audience-section">
        <article id="for-clients"><span className="audience-overline">FOR CLIENTS</span><h2>Know what you&apos;re paying for.</h2><p>Set the scope before kickoff. See progress against agreed milestones. Review deliverables with the original acceptance criteria close at hand.</p><Link href="/register" className="text-link">Start as a client <ArrowRight size={14} /></Link></article>
        <article id="for-freelancers"><span className="audience-overline">FOR FREELANCERS</span><h2>Know what you&apos;re delivering.</h2><p>Get a written brief, visible milestones, and a clear record of submissions and approvals. Raise concerns with context, not guesswork.</p><Link href="/register" className="text-link">Start as a freelancer <ArrowRight size={14} /></Link></article>
      </section>

      <section className="faq-section"><div><span className="hero-kicker"><i /> GOOD TO KNOW</span><h2>Fairness is a feature.</h2><p>FairWork helps document the work. It does not decide who is right or replace a payment provider.</p></div><details><summary><CircleHelp size={16} /> Does FairWork hold payments in escrow?</summary><p>No. FairWork records agreed payment conditions and status; it does not hold or release funds.</p></details><details><summary><CircleHelp size={16} /> Is this a freelancing marketplace?</summary><p>No. Clients and freelancers bring their own working relationship. FairWork provides the shared accountability layer.</p></details><details><summary><CircleHelp size={16} /> What if a milestone needs a revision?</summary><p>The client can request a revision with written feedback, keeping the decision attached to the original agreement.</p></details></section>

      <section className="closing-cta"><div><span className="hero-kicker"><i /> TRUST. TRACK. DELIVER.</span><h2>Make the next project<br />a clearer one.</h2></div><Link href="/register" className="marketing-cta marketing-cta-large">Create your workspace <ArrowRight size={16} /></Link></section>
      <footer className="marketing-footer"><Link href="/" className="marketing-brand"><span className="auth-brand-mark"><i /><i /><i /></span><span>fair<span>work</span></span></Link><p>A shared record for better work together.</p><span>© 2026 FairWork</span></footer>
    </main>
  )
}
