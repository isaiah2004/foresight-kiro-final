"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FundsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/funds/overview")
  }, [router])

  return null
}