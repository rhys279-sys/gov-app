'use client'
 
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
 
export default function ProfilePage() {
  const [postcode, setPostcode] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
 
  const ageRanges = ['<18', '18-25', '26-35', '36-50', '50-68', '68+']
 
  useEffect(() => {
    checkAuth()
  }, [])
 
  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login')
      return
    }
    setUser(data.user)
    setPageLoading(false)
  }
 
  const validatePostcode = (pc: string): boolean => {
    // UK postcode validation regex
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
    return postcodeRegex.test(pc.trim())
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
 
    // Validate postcode if provided
    if (postcode && !validatePostcode(postcode)) {
      setError('Please enter a valid UK postcode (e.g., SW1A 1AA)')
      return
    }
 
    // At least one field must be filled
    if (!postcode && !ageRange) {
      setError('Please fill in at least one field')
      return
    }
 
    setLoading(true)
    try {
      const { error: err } = await supabase
        .from('users')
        .update({
          postcode: postcode || null,
          age_range: ageRange || null,
          profile_completed: true
        })
        .eq('id', user.id)
 
      if (err) throw err
      
      // Redirect to rating page
      router.push('/app/rate')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    }
    setLoading(false)
  }
 
  const handleSkip = () => {
    router.push('/app/rate')
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
            <h2 className="text-lg font-bold text-blue-950 mb-2">Tell us a bit about you</h2>
            <p className="text-xs text-gray-600 mb-6">This helps us understand who's sharing and where. (Optional)</p>
 
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Postcode Field */}
              <div>
                <label className="block text-sm font-medium text-blue-950 mb-1.5">Where do you live? (UK postcode)</label>
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  placeholder="e.g., SW1A 1AA"
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-200"
                  style={{ color: '#002147' }}
                />
                <p className="text-xs text-gray-500 mt-1">We use this to show local sentiment trends</p>
              </div>
 
              {/* Age Range Field */}
              <div>
                <label className="block text-sm font-medium text-blue-950 mb-1.5">Age range</label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-200"
                  style={{ color: '#002147' }}
                >
                  <option value="">Select an age range</option>
                  {ageRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Helps us understand different perspectives</p>
              </div>
 
              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
 
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white text-base rounded-md transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #002147 0%, #003366 100%)'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
 
              {/* Skip Button */}
              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-3 font-semibold text-gray-600 text-base rounded-md transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Skip for now
              </button>
            </form>
          </div>
 
          <p className="text-xs text-gray-500 text-center mt-6">You can update this later in your settings</p>
        </div>
      </div>
    </div>
  )
}
 