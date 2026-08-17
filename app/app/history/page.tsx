'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Submission {
  id: string
  score: number
  comment: string | null
  created_at: string
}

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login')
      return
    }
    
    const { data: subs } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false })
    
    setSubmissions(subs || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>

  const avg = submissions.length > 0 ? (submissions.reduce((s, x) => s + x.score, 0) / submissions.length).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Your History</h1>
        
        <div className="bg-gray-800 p-4 rounded mb-6">
          <p className="text-gray-400">Submissions: {submissions.length}</p>
          <p className="text-2xl font-bold text-blue-400">Average: {avg}</p>
        </div>

        <div className="space-y-2">
          {submissions.map(s => (
            <div key={s.id} className="bg-gray-800 p-3 rounded flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{s.score}</div>
              <div>
                <p className="text-gray-300 text-sm">{new Date(s.created_at).toLocaleDateString()}</p>
                {s.comment && <p className="text-gray-400 text-sm">{s.comment}</p>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/app/rate')} className="w-full mt-6 bg-blue-600 text-white py-2 rounded">Back</button>
      </div>
    </div>
  )
}