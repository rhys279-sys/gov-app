'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function RatePage() {
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

  useEffect(() => {
    loadPage()
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
    
    if (submissions && submissions.length > 0) {
      setHasSubmittedToday(true)
    }
  }

const handleSubmit = async (e: React.FormEvent) => {    e.preventDefault()
    if (score === 0) {
      setError('Pick a rating')
      return
    }
    
    setLoading(true)
    try {
      const { error: err } = await supabase
        .from('submissions')
        .insert({ user_id: user.id, score, comment: comment || null })
      
      if (err) throw err
      setSuccess(true)
      setHasSubmittedToday(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-4">Rate Government</h1>
        
        {hasSubmittedToday ? (
          <div className="bg-blue-900 p-4 rounded text-blue-200">
            Already submitted today. Come back tomorrow!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setScore(n)} className={`w-10 h-10 rounded-full ${score === n ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>{n}</button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value.slice(0,280))} placeholder="Comment?" className="w-full bg-gray-700 text-white p-2 rounded" rows={3} />
            <button type="submit" disabled={score === 0 || loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50">Submit</button>
          </form>
        )}
        
        {error && <p className="text-red-400 mt-2">{error}</p>}
        {success && <p className="text-green-400 mt-2">Submitted!</p>}
        <button type="button" onClick={handleLogout} className="w-full mt-2 text-gray-400 text-sm hover:text-gray-300">
  Logout
</button>
      </div>
    </div>
  )
}