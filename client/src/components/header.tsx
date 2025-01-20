import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-10 items-center px-4 md:px-6 lg:px-8">
        <SidebarTrigger className="mr-2" />
      </div>
    </header>
  );
}