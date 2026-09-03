import { auth } from "@/auth"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { LandingPageInteractive } from "@/components/sections/LandingPageInteractive"
import { getFeaturedFacilities } from "@/lib/actions/public"

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const featuredFacilities = await getFeaturedFacilities(12);

  return (
    <main className="min-h-screen selection:bg-primary/20 selection:text-primary bg-background">
      <Navbar isLoggedIn={isLoggedIn} />
      
      {/* Interactive Switcher + Persona-tailored Landing Sections */}
      <LandingPageInteractive 
        isLoggedIn={isLoggedIn} 
        featuredFacilities={featuredFacilities} 
      />

      <Footer />
    </main>
  )
}
