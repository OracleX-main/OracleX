import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Markets from "./pages/Markets";
import MarketDetails from "./pages/MarketDetails";
import Portfolio from "./pages/Portfolio";
import CreateMarket from "./pages/CreateMarket";
import Leaderboard from "./pages/Leaderboard";
import Staking from "./pages/Staking";
import Governance from "./pages/Governance";
import Disputes from "./pages/Disputes";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Tokenomics from "./pages/Tokenomics";
import Documentation from "./pages/Documentation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tokenomics" element={<Tokenomics />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
            <Route path="/markets/:id" element={<ProtectedRoute><MarketDetails /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/create-market" element={<ProtectedRoute><CreateMarket /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/staking" element={<ProtectedRoute><Staking /></ProtectedRoute>} />
            <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
            <Route path="/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
