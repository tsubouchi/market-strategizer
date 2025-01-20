import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { SideMenu } from "./side-menu"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <SideMenu>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </SideMenu>
      </div>
    </header>
  )
}