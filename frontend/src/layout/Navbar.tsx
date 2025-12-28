import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Moon, Sun, LogOut, User, History, Sparkles, FolderKanban, Menu } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <Link href="/">
          <div className="mr-8 flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-xl">
               <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight font-heading">SPAVIX</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/">
            <span className="transition-colors hover:text-foreground/80 text-foreground cursor-pointer">Dashboard</span>
          </Link>
          <Link href="/projects">
            <span className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4" />
              Projects
            </span>
          </Link>
          <Link href="/gallery">
            <span className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer">Gallery</span>
          </Link>
          <Link href="/pricing">
            <span className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer">Pricing</span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="text-left pb-6">
                  <SheetTitle className="font-heading flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    SPAVIX
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-3 p-2 border rounded-xl bg-muted/30">
                     <Avatar className="h-10 w-10">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">John Doe</p>
                        <p className="text-xs text-muted-foreground truncate">john@example.com</p>
                     </div>
                  </div>

                  <nav className="flex flex-col space-y-1">
                    <MobileNavLink href="/">Dashboard</MobileNavLink>
                    <MobileNavLink href="/projects">Projects</MobileNavLink>
                    <MobileNavLink href="/gallery">Gallery</MobileNavLink>
                    <MobileNavLink href="/pricing">Pricing</MobileNavLink>
                    <div className="my-2 border-t" />
                    <MobileNavLink href="/profile">Profile</MobileNavLink>
                    <MobileNavLink href="/history">History</MobileNavLink>
                    <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <span className="flex items-center px-2 py-3 text-sm font-medium transition-colors hover:bg-accent rounded-lg cursor-pointer">
        {children}
      </span>
    </Link>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/history">
          <DropdownMenuItem className="cursor-pointer">
            <History className="mr-2 h-4 w-4" />
            <span>Transformation History</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
