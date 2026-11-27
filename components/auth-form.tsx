'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type AuthMode = 'login' | 'register'
type AccountType = 'client' | 'freelancer'

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('client')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (isRegister && password !== confirmPassword) {
      setError('Those passwords do not match. Please try again.')
      return
    }

    setPending(true)
    try {
      const result = isRegister
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password, accountType })
        : await authClient.signIn.email({ email: email.trim().toLowerCase(), password, rememberMe })

      if (result.error) {
        setError(isRegister
          ? 'We could not create your account with those details. Check them and try again.'
          : 'We could not sign you in. Check your email and password and try again.')
        return
      }

      const role = isRegister ? accountType : result.data?.user.accountType
      router.replace(role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again in a moment.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand" aria-label="FairWork home">
        <span className="auth-brand-mark"><i /><i /><i /></span>
        <span>fair<span>work</span></span>
      </Link>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-heading">
          <span className="auth-eyebrow">{isRegister ? 'A BETTER WAY TO WORK' : 'WELCOME BACK'}</span>
          <h1 id="auth-title">{isRegister ? 'Create your account' : 'Good to have you back.'}</h1>
          <p>{isRegister ? 'Clear agreements start with the right people at the table.' : 'Pick up where you left off with your projects.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <label className="auth-field">
                <span>Full name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={100} placeholder="Your name" />
              </label>
              <fieldset className="account-type-group">
                <legend>I&apos;m here as a</legend>
                <div className="account-type-options">
                  <button type="button" className={accountType === 'client' ? 'account-type-option is-selected' : 'account-type-option'} onClick={() => setAccountType('client')} aria-pressed={accountType === 'client'}>
                    <b>Client</b><small>Hire with confidence</small>
                  </button>
                  <button type="button" className={accountType === 'freelancer' ? 'account-type-option is-selected' : 'account-type-option'} onClick={() => setAccountType('freelancer')} aria-pressed={accountType === 'freelancer'}>
                    <b>Freelancer</b><small>Deliver with clarity</small>
                  </button>
                </div>
              </fieldset>
            </>
          )}

          <label className="auth-field">
            <span>Email address</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} placeholder="you@example.com" />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <span className="password-input-wrap">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} maxLength={128} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </span>
          </label>

          {isRegister ? (
            <label className="auth-field">
              <span>Confirm password</span>
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required minLength={8} maxLength={128} placeholder="Enter your password again" />
            </label>
          ) : (
            <div className="auth-form-options">
              <label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
          )}

          {error && <p role="alert" className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={pending}>
            {pending ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            {!pending && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="auth-assurance"><ShieldCheck size={15} /><span>Your account and project records stay private.</span></div>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to FairWork?'}{' '}
          <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </p>
      </section>
      <p className="auth-footnote">By continuing, you agree to build work on clear expectations.</p>
    </main>
  )
}
