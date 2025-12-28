import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import GalleryPage from "@/pages/gallery";
import PricingPage from "@/pages/pricing";
import HistoryPage from "@/pages/history";
import ProfilePage from "@/pages/profile";
import EditorPage from "@/pages/editor";
import ProjectsPage from "@/pages/projects";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/editor" component={EditorPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="spavix-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
