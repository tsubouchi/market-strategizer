import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Analysis from "@/pages/analysis";
import Settings from "@/pages/settings";
import Concepts from "@/pages/concepts";
import DeepSearch from "@/pages/deep-search";
import ConceptGenerator from "@/pages/concept-generator";
import CompetitorMonitoring from "@/pages/competitor-monitoring";
import RequirementDetail from "@/pages/requirement-detail";  // 追加
import Sidebar from "@/components/sidebar";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/analysis/:id" component={Analysis} />
            <Route path="/settings" component={Settings} />
            <Route path="/concepts" component={Concepts} />
            <Route path="/deep-search" component={DeepSearch} />
            <Route path="/concept-generator" component={ConceptGenerator} />
            <Route path="/competitor-monitoring" component={CompetitorMonitoring} />
            <Route path="/requirements/:id" component={RequirementDetail} />  {/* 追加 */}
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;