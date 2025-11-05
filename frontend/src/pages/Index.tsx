import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import TrendingPredictions from "@/components/TrendingPredictions";
import AIFeatures from "@/components/AIFeatures";
import Footer from "@/components/Footer";
import WalletTest from "@/components/WalletTest";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <WalletTest />
      <TrendingPredictions />
      <HowItWorks />
      <AIFeatures />
      <Footer />
    </div>
  );
};

export default Index;
