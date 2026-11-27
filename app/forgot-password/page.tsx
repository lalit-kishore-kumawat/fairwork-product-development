import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand" aria-label="FairWork home"><span className="auth-brand-mark"><i /><i /><i /></span><span>fair<span>work</span></span></Link>
      <section className="auth-card reset-card">
        <span className="reset-icon"><Mail size={20} /></span>
        <span className="auth-eyebrow">ACCOUNT ACCESS</span>
        <h1>Password reset</h1>
        <p>Password reset emails are not enabled for this workspace yet. Contact your FairWork administrator for help recovering access.</p>
        <Link href="/login" className="auth-submit reset-return"><ArrowLeft size={15} /> Back to sign in</Link>
      </section>
      <p className="auth-footnote">Your account and project records stay private.</p>
    </main>
  )
}
