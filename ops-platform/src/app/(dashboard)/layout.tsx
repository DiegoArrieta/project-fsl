import { Header } from '@/components/shared/Header'
import { Navbar } from '@/components/shared/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navbar />
      <main className="container mx-auto">{children}</main>
    </div>
  )
}
