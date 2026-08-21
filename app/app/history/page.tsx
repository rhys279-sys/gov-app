'use client'
 
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
 
export default function HistoryPage() {
  const [userSubmissions, setUserSubmissions] = useState<any[]>([])
  const [allSubmissions, setAllSubmissions] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [todayCount, setTodayCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
 
  useEffect(() => {
    loadData()
  }, [])
 
  const loadData = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login')
      return
    }
 
    setUser(data.user)
 
    // Get user's submissions
    const { data: userSubs } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: true })
 
    setUserSubmissions(userSubs || [])
 
    // Get all submissions (for community feed)
    const { data: allSubs } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
 
    setAllSubmissions(allSubs || [])
 
    // Count today's submissions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todaySubmissions } = await supabase
      .from('submissions')
      .select('*')
      .gte('created_at', today.toISOString())
 
    setTodayCount(todaySubmissions?.length || 0)
 
    // Count total submissions
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
 
    setTotalCount(count || 0)
 
    setLoading(false)
  }
 
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
 
  const handleCopyLink = async () => {
    const inviteLink = `${window.location.origin}/login`
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fafaf9' }}>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }
 
  const chartData = userSubmissions.map(sub => ({
    date: new Date(sub.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    score: sub.score
  }))
 
  const avgScore = userSubmissions.length > 0 
    ? (userSubmissions.reduce((sum, s) => sum + s.score, 0) / userSubmissions.length).toFixed(1)
    : 0
 
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
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-2">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M 10 50 L 30 50 L 35 35 L 40 65 L 45 50 L 65 50 L 70 45 L 80 50" 
                    stroke="#002147" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 75 30 L 85 40 L 95 25" 
                    stroke="#CC0000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-blue-950">Your History</h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#CC0000' }}>Your thoughts, your voice</p>
        </div>
 
        {/* Civipulses Stats */}
        <div className="bg-white bg-opacity-95 p-6 rounded-lg shadow-sm mb-6">
          <div className="flex gap-6 justify-center text-center">
            <div>
              <p className="text-2xl font-bold text-blue-950">{todayCount}</p>
              <p className="text-xs text-gray-600 mt-1">civipulses today</p>
            </div>
            <div style={{ borderLeft: '2px solid #D4AF37', paddingLeft: '24px' }}>
              <p className="text-2xl font-bold text-blue-950">{totalCount}</p>
              <p className="text-xs text-gray-600 mt-1">total civipulses</p>
            </div>
          </div>
        </div>
 
        {/* Your Personal Section */}
        <div className="bg-white bg-opacity-95 p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-bold text-blue-950 mb-4">Your Personal Pulse</h2>
 
          {userSubmissions.length > 0 ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600">Total submissions</p>
                  <p className="text-2xl font-bold text-blue-950">{userSubmissions.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-xs text-gray-600">Your average</p>
                  <p className="text-2xl font-bold" style={{ color: '#CC0000' }}>{avgScore}</p>
                </div>
              </div>
 
              {/* Chart */}
              {chartData.length > 0 && (
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ background: '#fafaf9', border: '2px solid #D4AF37', borderRadius: '6px' }}
                        formatter={(value) => [`Score: ${value}`, '']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#002147" 
                        dot={{ fill: '#CC0000', r: 5 }}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
 
              {/* Your Submissions List */}
              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Your submissions</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...userSubmissions].reverse().map((sub, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded flex gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" 
                           style={{ background: 'linear-gradient(135deg, #002147 0%, #003366 100%)' }}>
                        {sub.score}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">{new Date(sub.created_at).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        {sub.comment && <p className="text-sm text-gray-700 mt-1">"{sub.comment}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-center py-8">No submissions yet. Share your thoughts to get started!</p>
          )}
        </div>
 
        {/* Community Feed */}
        <div className="bg-white bg-opacity-95 p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-bold text-blue-950 mb-4">What Others Are Thinking</h2>
          <p className="text-xs text-gray-600 mb-4">Recent anonymous civipulses from the community</p>
 
          {allSubmissions.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allSubmissions.map((sub, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" 
                       style={{ background: 'linear-gradient(135deg, #002147 0%, #003366 100%)' }}>
                    {sub.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600">{new Date(sub.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    {sub.comment && <p className="text-sm text-gray-700 mt-1 break-words">"{sub.comment}"</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No community ratings yet.</p>
          )}
        </div>
 
        {/* Navigation */}
        <div className="bg-white bg-opacity-95 p-6 rounded-lg shadow-sm space-y-3">
          <button
            onClick={() => router.push('/app/rate')}
            className="w-full py-3 font-semibold text-white text-base rounded-md transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #002147 0%, #003366 100%)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Share Your Thoughts
          </button>
          
          <button
            onClick={handleCopyLink}
            className="w-full py-3 font-semibold text-white text-base rounded-md transition-all duration-200"
            style={{
              background: copySuccess ? '#10b981' : 'linear-gradient(135deg, #CC0000 0%, #990000 100%)'
            }}
            onMouseEnter={(e) => !copySuccess && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !copySuccess && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {copySuccess ? '✓ Link copied!' : 'Invite Others'}
          </button>
 
          <button
            onClick={handleLogout}
            className="w-full py-3 font-semibold text-gray-600 text-base rounded-md transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
 