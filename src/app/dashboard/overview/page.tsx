import { redirect } from "next/navigation"

export default function OverviewPage() {
  // Redirect to financial-health as the default overview view
  redirect("/dashboard/overview/financial-health")
}