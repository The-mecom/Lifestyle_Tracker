import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthScreen() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const clearMessages = () => { setError(''); setMessage('') }

  const handleSignUp = async () => {
    if (!username.trim()) { setError('Please enter a username'); return }
    if (!email.trim()) { setError('Please enter your email'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); clearMessages()
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: username.trim() } }
    })
    setLoading(false)
    if (error) { setError(error.message) }
    else { setMessage('Account created! You are now logged in.') }
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Please fill in all fields'); return }
    setLoading(true); clearMessages()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) { setError('Incorrect email or password') }
  }

  const handleForgot = async () => {
    if (!email.trim()) { setError('Please enter your email address'); return }
    setLoading(true); clearMessages()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
    setLoading(false)
    if (error) { setError(error.message) }
    else { setMessage('Password reset link sent — check your email.') }
  }

  const handleSubmit = () => {
    if (mode === 'login') handleLogin()
    else if (mode === 'signup') handleSignUp()
    else handleForgot()
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0c', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .auth-input {
          width: 100%; background: #16161a; border: 1px solid #252529;
          color: #e8e4dc; border-radius: 10px; padding: 12px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 15px;
          outline: none; transition: border-color 0.2s;
        }
        .auth-input:focus { border-color: #c9a96e; }
        .auth-input::placeholder { color: #3a3a42; }
        .auth-btn {
          width: 100%; background: #c9a96e; color: #0a0a0c; border: none;
          padding: 13px; border-radius: 10px; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 15px; cursor: pointer;
          transition: opacity 0.2s; letter-spacing: 0.3px;
        }
        .auth-btn:hover:not(:disabled) { opacity: 0.85; }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-link { background: none; border: none; color: #c9a96e; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; text-decoration: underline;
          text-underline-offset: 3px; padding: 0;
        }
        .auth-link:hover { opacity: 0.8; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>◈</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 30,
            color: '#e8e4dc', fontWeight: 700, lineHeight: 1.1
          }}>
            Lifestyle <span style={{ color: '#c9a96e' }}>Tracker</span>
          </h1>
          <p style={{ color: '#444', fontSize: 14, marginTop: 8 }}>
            {mode === 'login' ? 'Sign in to your account' :
             mode === 'signup' ? 'Create your free account' :
             'Reset your password'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111115', border: '1px solid #1c1c22',
          borderRadius: 16, padding: 32,
        }}>
          <div style={{ display: 'grid', gap: 14 }}>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: 6 }}>
                  Username
                </label>
                <input className="auth-input" type="text" placeholder="e.g. john_doe"
                  value={username} onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input className="auth-input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input className="auth-input" type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    style={{ paddingRight: 48 }} />
                  <button onClick={() => setShowPassword(v => !v)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14
                  }}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>
            )}

            {/* Error / success messages */}
            {error && (
              <div style={{ background: '#1a0a0a', border: '1px solid #3a1010', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                ⚠ {error}
              </div>
            )}
            {message && (
              <div style={{ background: '#0a1a0a', border: '1px solid #1a3a1a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#4ade80' }}>
                ✓ {message}
              </div>
            )}

            <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Please wait...' :
               mode === 'login' ? 'Sign In' :
               mode === 'signup' ? 'Create Account' :
               'Send Reset Link'}
            </button>
          </div>

          {/* Mode switcher */}
          <div style={{ marginTop: 20, textAlign: 'center', display: 'grid', gap: 10 }}>
            {mode === 'login' && (
              <>
                <p style={{ fontSize: 14, color: '#555' }}>
                  Don't have an account?{' '}
                  <button className="auth-link" onClick={() => { setMode('signup'); clearMessages() }}>Sign up free</button>
                </p>
                <button className="auth-link" style={{ fontSize: 13, color: '#444' }}
                  onClick={() => { setMode('forgot'); clearMessages() }}>
                  Forgot password?
                </button>
              </>
            )}
            {mode === 'signup' && (
              <p style={{ fontSize: 14, color: '#555' }}>
                Already have an account?{' '}
                <button className="auth-link" onClick={() => { setMode('login'); clearMessages() }}>Sign in</button>
              </p>
            )}
            {mode === 'forgot' && (
              <button className="auth-link" onClick={() => { setMode('login'); clearMessages() }}>
                ← Back to sign in
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#2a2a32', marginTop: 24 }}>
          Your data is private and encrypted. We never share it.
        </p>
      </div>
    </div>
  )
}
