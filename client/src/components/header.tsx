import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { SidebarTrigger } from "./ui/sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex h-14 items-center">
        <SidebarTrigger className="ml-2" />
      </div>
    </header>
  )
}