import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Footer from "./_components/footer"
import AuthProvider from "./_providers/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: {
    default: "VizUAU - Encontre o estabelecimento perfeito perto de você",
    template: "VizUAU - Encontre o estabelecimento perfeito perto de você - %s",
  },
  description: "Marketplace de agendamento para estabelecimentos",
  icons: {
    icon: "/favicon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} font-sans ${poppins.className}`}>
        <AuthProvider session={session}>
          <div className="flex h-full flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
