import { getPricingPlans } from "@/app/_actions/admin/manage-pricing"
import Header from "../_components/header"
import SignupClient from "./_components/signup-client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Cadastro - VizUAU",
}

export default async function SignUpPage() {
  const plans = await getPricingPlans()
  const serializedPlans = plans.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <SignupClient plans={serializedPlans} />
      </div>
    </div>
  )
}
