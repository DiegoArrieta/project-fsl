import { Header } from '@/components/shared/Header'
import { Navbar } from '@/components/shared/Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-8">{children}</main>
    </div>
  )
}
