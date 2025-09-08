"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IncomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/income/overview")
  }, [router])

  return null
}