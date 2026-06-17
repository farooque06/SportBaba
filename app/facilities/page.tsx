import { auth } from "@/auth"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getAllFacilities } from "@/lib/actions/public"
import Link from "next/link"
import { MapPin, Trophy, Star, ArrowRight, Search, Filter } from "lucide-react"

export default async function FacilitiesDirectory({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  
  const p = await searchParams
  const currentPage = Number(p?.page) || 1
  const limit = 20

  const { data: facilities, count, success, error } = await getAllFacilities(currentPage, limit)
  const totalPages = count ? Math.ceil(count / limit) : 0

  const getGradient = (name: string) => {
    const colors = [
      "from-emerald-500/20 to-teal-500/20",
      "from-blue-500/20 to-indigo-500/20",
      "from-purple-500/20 to-pink-500/20",
      "from-orange-500/20 to-red-500/20",
      "from-primary/20 to-primary/5",
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} />
      
      <div className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.9] mb-4">
                Discover <span className="text-primary text-glow">Venues</span>
              </h1>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm opacity-70 max-w-xl">
                Browse our entire network of premium sports facilities. Find pitches, courts, and fields near you.
              </p>
            </div>
            
            {/* Search/Filter Bar Placeholder */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search venues..." 
                  className="pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:border-primary/50 w-full sm:w-[250px]"
                />
              </div>
              <button className="h-12 w-12 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grid */}
          {!success && (
            <div className="p-12 text-center text-red-500 font-bold border border-red-500/20 rounded-2xl bg-red-500/5">
              Failed to load venues. Please try again.
            </div>
          )}

          {success && facilities.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center border border-border/50 rounded-3xl bg-muted/10">
              <Trophy className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">No Venues Found</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                Check back later as we expand our network.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {success && facilities.map((facility) => (
              <Link 
                key={facility.id} 
                href={`/${facility.slug}`}
                className="group flex flex-col bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className={`h-48 w-full bg-gradient-to-br ${getGradient(facility.name)} relative overflow-hidden flex items-center justify-center shrink-0`}>
                  {facility.logo_url ? (
                    <img 
                      src={facility.logo_url} 
                      alt={facility.name} 
                      className="w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Trophy className="h-16 w-16 text-foreground/20 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  
                  <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-border/50 text-foreground">
                    {facility.sport_type}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-black uppercase tracking-tight italic mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {facility.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      4.9
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3.5 w-3.5" />
                      View Details
                    </span>
                  </div>

                  <div className="mt-auto w-full py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Book Now
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-4">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <a 
                  href={`/facilities?page=${Math.max(1, currentPage - 1)}`}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/50 hover:bg-muted ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  Previous
                </a>
                <a 
                  href={`/facilities?page=${Math.min(totalPages, currentPage + 1)}`}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/50 hover:bg-muted ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  Next
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  )
}
