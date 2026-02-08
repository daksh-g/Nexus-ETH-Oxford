import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import DemoView from "@/views/DemoView";
import PulseView from "@/views/PulseView";
import AlertsView from "@/views/AlertsView";
import AskNexusView from "@/views/AskNexusView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/demo" replace />} />
            <Route path="/demo" element={<DemoView />} />
            <Route path="/pulse" element={<PulseView />} />
            <Route path="/alerts" element={<AlertsView />} />
            <Route path="/ask" element={<AskNexusView />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
