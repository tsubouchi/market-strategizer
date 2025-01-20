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
            <p className="text-sm text-muted-foreground mb-6">
              不確実な時代の羅針盤。AIが導く羅針盤
            </p>
            <nav className="space-y-4">
              <Link href="/" className="block text-lg hover:text-primary">ホーム</Link>
              <Link href="/history" className="block text-lg hover:text-primary">作成履歴</Link>
              <Link href="/search" className="block text-lg hover:text-primary">深層検索エージェント</Link>
              <Link href="/monitoring" className="block text-lg hover:text-primary">競合他社モニタリング</Link>
              <Link href="/concept" className="block text-lg hover:text-primary">コンセプト生成</Link>
              <Link href="/requirements" className="block text-lg hover:text-primary">要件書</Link>
              <Link href="/settings" className="block text-lg hover:text-primary">設定</Link>
            </nav>
            <h3 className="text-lg font-semibold mt-8 mb-4">分析を開始</h3>
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