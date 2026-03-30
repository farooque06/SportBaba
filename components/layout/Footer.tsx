import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50 py-24 px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
              <span className="font-black text-white text-sm">S</span>
            </div>
            <span className="text-xl font-black tracking-tighter">SportBaba</span>
          </div>
          
          <div className="flex gap-10 text-sm font-bold text-slate-400">
            {["Terms", "Privacy", "Status", "Support", "Contact"].map((item) => (
              <a key={item} href="#" className="hover:text-black transition-colors">
                {item}
              </a>
            ))}
          </div>

          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} SportBaba. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
