import * as React from "react"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Link } from "wouter"

interface SideMenuProps {
  children: React.ReactNode
}

export function SideMenu({ children }: SideMenuProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">戦略AIコンパス</h2>
            <nav className="space-y-4">
              <Link href="/analysis/3c" className="block text-lg hover:text-primary">3C分析</Link>
              <Link href="/analysis/4p" className="block text-lg hover:text-primary">4P分析</Link>
              <Link href="/analysis/pest" className="block text-lg hover:text-primary">PEST分析</Link>
            </nav>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
