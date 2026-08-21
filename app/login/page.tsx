'use client'
 
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
 
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
 
    try {
      if (isSignUp) {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setError('Check your email to confirm your account')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        // Redirect to profile page instead of directly to rate
        router.push('/app/profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setLoading(false)
  }
 
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#fafaf9' }}>
      {/* Watermark Background */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g stroke="%23002147" stroke-width="2" fill="none"><circle cx="100" cy="100" r="80"/><circle cx="70" cy="75" r="5" fill="%23002147"/><circle cx="130" cy="75" r="5" fill="%23002147"/><circle cx="55" cy="100" r="5" fill="%23002147"/><circle cx="145" cy="100" r="5" fill="%23002147"/><circle cx="70" cy="125" r="5" fill="%23002147"/><circle cx="130" cy="125" r="5" fill="%23002147"/><line x1="70" y1="75" x2="130" y2="75"/><line x1="130" y1="75" x2="145" y2="100"/><line x1="145" y1="100" x2="130" y2="125"/><line x1="130" y1="125" x2="70" y2="125"/><line x1="70" y1="125" x2="55" y2="100"/><line x1="55" y1="100" x2="70" y2="75"/></g></svg>')`,
        backgroundSize: '600px 600px',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }} />
 
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo & Branding */}
          <div className="text-center mb-10">
            {/* Pulse + Tick Logo */}
            <div className="w-20 h-20 mx-auto mb-5">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Pulse Line */}
                <path d="M 10 50 L 30 50 L 35 35 L 40 65 L 45 50 L 65 50 L 70 45 L 80 50" 
                      stroke="#002147" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Tick */}
                <path d="M 75 30 L 85 40 L 95 25" 
                      stroke="#CC0000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
 
            <h1 className="text-4xl font-bold text-blue-950 mb-2">Civipulse</h1>
            <p className="text-base font-medium" style={{ color: '#CC0000' }}>Your thoughts, your voice</p>
          </div>
 
          {/* Explainer */}
          <div className="bg-white bg-opacity-85 border-l-4 px-6 py-6 rounded-lg mb-10" style={{ borderLeftColor: '#D4AF37' }}>
            <p className="text-base text-gray-800 leading-relaxed">
              Share your thoughts once per day and build a view of how the world looks to you.
            </p>
          </div>
 
          {/* Login/Sign Up Form */}
          <div className="bg-white bg-opacity-95 p-8 rounded-lg shadow-sm">
            <h3 className="text-base font-semibold text-blue-950 mb-6">
              {isSignUp ? 'Create an account' : 'Log in to your account'}
            </h3>
 
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-950 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-200"
                  style={{ color: '#002147' }}
                  required
                />
              </div>
 
              <div>
                <label className="block text-sm font-medium text-blue-950 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-200"
                  style={{ color: '#002147' }}
                  required
                />
              </div>
 
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 font-semibold text-white text-base rounded-md transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #002147 0%, #003366 100%)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {loading ? (isSignUp ? 'Creating account...' : 'Logging in...') : (isSignUp ? 'Sign up' : 'Log in')}
              </button>
            </form>
 
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}
 
            {/* Toggle between login and signup */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setError('')
                    }}
                    className="font-semibold cursor-pointer"
                    style={{ color: '#CC0000' }}
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setError('')
                    }}
                    className="font-semibold cursor-pointer"
                    style={{ color: '#CC0000' }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}