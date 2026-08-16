'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AppPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /app/rate for now
    router.push('/app/rate')
  }, [router])

  return <div>Loading...</div>
}