import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { Layout } from "@/components/layout";
import DeepSearch from "@/pages/deep-search";
import CompetitorMonitoring from "@/pages/competitor-monitoring";
import ConceptGenerator from "@/pages/concept-generator";
import Analysis from "@/pages/analysis";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={DeepSearch} />
        <Route path="/monitoring" component={CompetitorMonitoring} />
        <Route path="/concept" component={ConceptGenerator} />
        <Route path="/settings" component={Settings} />
        {/* 分析関連のルート */}
        <Route path="/analysis/new/3c" component={() => <Analysis type="3C" />} />
        <Route path="/analysis/new/4p" component={() => <Analysis type="4P" />} />
        <Route path="/analysis/new/pest" component={() => <Analysis type="PEST" />} />
        <Route path="/analysis/:id" component={Analysis} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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