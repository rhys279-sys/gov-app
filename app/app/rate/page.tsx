'use client'
 
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
 
export default function RatePage() {
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false)
  const [lastSubmission, setLastSubmission] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
 
  useEffect(() => {
    loadPage()
    
    // Set up auto-refresh at midnight
    const checkMidnight = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime()
      
      const timeout = setTimeout(() => {
        window.location.reload()
      }, timeUntilMidnight)
      
      return () => clearTimeout(timeout)
    }
    
    return checkMidnight()
  }, [])
 
  const loadPage = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login')
      return
    }
 
    setUser(data.user)
 
    const today = new Date()
    today.setHours(0, 0, 0, 0)
 
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', data.user.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
 
    if (submissions && submissions.length > 0) {
      setHasSubmittedToday(true)
      setLastSubmission(submissions[0])
    }
 
    setPageLoading(false)
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (score === 0) {
      setError('Please select a rating')
      return
    }
 
    setLoading(true)
    try {
      const { error: err } = await supabase
        .from('submissions')
        .insert({ user_id: user.id, score, comment: comment || null })
 
      if (err) throw err
      setSuccess(true)
      setScore(0)
      setComment('')
      setHasSubmittedToday(true)
      
      // Reload the page after success to show fresh state
      setTimeout(() => window.location.reload(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    }
    setLoading(false)
  }
 
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Civipulse',
          text: 'Your thoughts, your voice. Share your pulse on government daily.',
          url: window.location.origin + '/login'
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }
 
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
 
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fafaf9' }}>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-3">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M 10 50 L 30 50 L 35 35 L 40 65 L 45 50 L 65 50 L 70 45 L 80 50" 
                      stroke="#002147" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M 75 30 L 85 40 L 95 25" 
                      stroke="#CC0000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-blue-950 mb-1">Civipulse</h1>
            <p className="text-sm font-medium" style={{ color: '#CC0000' }}>Your thoughts, your voice</p>
          </div>
 
          {/* Main Card */}
          <div className="bg-white bg-opacity-95 p-8 rounded-lg shadow-sm">
            {hasSubmittedToday ? (
              <div className="space-y-4">
                {/* Already Submitted Message */}
                <div className="bg-blue-50 border-l-4 border-blue-950 px-4 py-4 rounded" style={{ borderLeftColor: '#002147' }}>
                  <p className="text-sm font-medium text-blue-950">You've already shared your thoughts today!</p>
                  <p className="text-xs text-gray-600 mt-1">Come back tomorrow to share again.</p>
                </div>
 
                {/* Today's Submission */}
                {lastSubmission && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-xs text-gray-500 mb-2">Your rating today:</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #002147 0%, #003366 100%)' }}>
                        {lastSubmission.score}
                      </div>
                      {lastSubmission.comment && (
                        <p className="text-sm text-gray-700 italic">"{lastSubmission.comment}"</p>
                      )}
                    </div>
                  </div>
                )}
 
                {/* Share Button */}
                {navigator.share && (
                  <button
                    onClick={handleShare}
                    className="w-full py-2 mt-2 font-semibold text-white text-sm rounded-md transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Share Civipulse
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question */}
                <div>
                  <p className="text-base font-medium text-gray-800 mb-4">Based on today, how do you rate today's political events?</p>
                  
                  {/* Rating Buttons */}
                  <div className="flex gap-3 justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setScore(num)}
                        className="w-12 h-12 rounded-full font-bold text-lg transition-all duration-200"
                        style={{
                          background: score === num ? 'linear-gradient(135deg, #002147 0%, #003366 100%)' : '#f0f0f0',
                          color: score === num ? 'white' : '#666',
                          transform: score === num ? 'scale(1.1)' : 'scale(1)',
                          border: score === num ? '2px solid #D4AF37' : '2px solid transparent'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 text-center">1 (Very dissatisfied) to 5 (Very satisfied)</p>
                </div>
 
                {/* Comment Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add a comment (optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 280))}
                    placeholder="What's do you want to share today?"
                    className="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-200 resize-none placeholder-blue-950""
                    style={{ color: '#002147' }}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">{comment.length} / 280</p>
                </div>
 
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={score === 0 || loading}
                  className="w-full py-3 font-semibold text-white text-base rounded-md transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #002147 0%, #003366 100%)'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Sharing...' : 'Share your thoughts'}
                </button>
              </form>
            )}
 
            {/* Error Message */}
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}
 
            {/* Success Message with Share Button */}
            {success && !hasSubmittedToday && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-green-50 border-l-4 border-green-600 rounded">
                  <p className="text-sm font-medium text-green-700">✓ Thank you! Your voice has been heard.</p>
                </div>
                {navigator.share && (
                  <button
                    onClick={handleShare}
                    className="w-full py-2 font-semibold text-white text-sm rounded-md transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Share Civipulse
                  </button>
                )}
              </div>
            )}
 
            {/* Navigation Links */}
            <div className="mt-6 space-y-2 border-t pt-6">
              <button
                onClick={() => router.push('/app/history')}
                className="w-full text-center py-2 text-sm font-medium rounded transition-colors"
                style={{ color: '#CC0000' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                View your history
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-center py-2 text-sm font-medium text-gray-500 rounded transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}