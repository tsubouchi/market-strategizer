import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { Layout } from "@/components/layout";
import { SidebarProvider } from "@/components/ui/sidebar";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/history" component={() => <div>作成履歴</div>} />
        <Route path="/search" component={() => <div>深層検索エージェント</div>} />
        <Route path="/monitoring" component={() => <div>競合他社モニタリング</div>} />
        <Route path="/concept" component={() => <div>コンセプト生成</div>} />
        <Route path="/requirements" component={() => <div>要件書</div>} />
        <Route path="/settings" component={() => <div>設定</div>} />
        <Route path="/analysis/3c" component={() => <div>3C分析</div>} />
        <Route path="/analysis/4p" component={() => <div>4P分析</div>} />
        <Route path="/analysis/pest" component={() => <div>PEST分析</div>} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={false}>
        <Router />
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;