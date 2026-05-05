import Link from "next/link"
import { Globe, Zap, Trophy, ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Main footer content */}
        <div className="py-14 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand column */}
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-[-3deg]">
                <span className="font-extrabold text-primary-foreground text-lg leading-none">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                Sport<span className="text-primary">Baba</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The all-in-one management platform powering the next generation of indoor sports facilities worldwide.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Zap, Trophy].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all hover:-translate-y-0.5">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <nav className="flex flex-col gap-3">
              {["Features", "Pricing", "Integrations", "Changelog"].map((item) => (
                <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <nav className="flex flex-col gap-3">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <div className="bg-card/50 border border-border/40 rounded-2xl p-6 space-y-4 backdrop-blur-xl border-shimmer">
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-foreground">Stay updated</h4>
                <p className="text-sm text-muted-foreground">Get product updates and management tips — no spam.</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="bg-background/80 border border-border/50 rounded-lg px-4 py-2.5 text-sm flex-1 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                />
                <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/15 flex items-center gap-1.5">
                  Join
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SportBaba. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
