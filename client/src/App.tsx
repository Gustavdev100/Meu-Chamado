import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";

import { AppSidebar } from "@/components/AppSidebar";
import PublicSubmit from "@/pages/PublicSubmit";
import Dashboard from "@/pages/Dashboard";
import TrackTicket from "@/pages/TrackTicket";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicSubmit} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/track" component={TrackTicket} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle}>
          <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6 sticky top-0 z-10 shadow-sm">
                <SidebarTrigger className="hover:bg-muted" />
                <div className="w-full flex-1">
                  <span className="font-display font-bold text-lg text-primary">HelpDesk</span>
                </div>
              </header>
              <main className="flex-1 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/30">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
