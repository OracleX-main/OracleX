import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Users, Clock, Search, Filter, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { marketService, type Market, MarketStatus } from "@/services";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<MarketStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const { data: marketsResponse, loading, error, refetch } = useApi(
    () => marketService.getMarkets(currentPage, PAGE_SIZE, selectedCategory, selectedStatus || undefined, searchQuery),
    [currentPage, selectedCategory, selectedStatus, searchQuery]
  );

  const { data: categoriesResponse } = useApi(
    () => marketService.getCategories(),
    []
  );

  const markets = marketsResponse?.data || [];
  const totalPages = marketsResponse?.totalPages || 0;
  const categories = categoriesResponse?.data || [];

  const formatTimeLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return "< 1 hour";
  };

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const calculatePercentages = (market: Market) => {
    const outcomes = market.outcomes || [];
    if (outcomes.length < 2) return { yes: 50, no: 50 };
    
    const total = outcomes.reduce((sum, outcome) => sum + parseFloat(outcome.totalStaked), 0);
    if (total === 0) return { yes: 50, no: 50 };
    
    const yesStaked = parseFloat(outcomes[0]?.totalStaked || '0');
    const noStaked = parseFloat(outcomes[1]?.totalStaked || '0');
    
    return {
      yes: Math.round((yesStaked / total) * 100),
      no: Math.round((noStaked / total) * 100)
    };
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "all" ? "" : category);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status === "all" ? "" : status as MarketStatus);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Prediction </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">Markets</span>
            </h1>
            <p className="text-muted-foreground">Discover and participate in active prediction markets</p>
          </div>
          
          <Link to="/create-market">
            <Button className="bg-gradient-gold hover:shadow-glow-primary gap-2">
              <Plus className="w-4 h-4" />
              Create Market
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-card border-primary/30"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full lg:w-48 bg-card border-primary/30">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full lg:w-48 bg-card border-primary/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Markets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading markets...</span>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-4">Failed to load markets</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-4">No markets found</p>
            <Link to="/create-market">
              <Button>Create First Market</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mb-8">
              {markets.map((market, index) => {
                const percentages = calculatePercentages(market);
                const participants = market.predictions?.length || 0;
                
                return (
                  <Link key={market.id} to={`/markets/${market.id}`}>
                    <Card 
                      className="bg-gradient-card backdrop-blur-sm border-primary/30 hover:border-primary hover:shadow-glow-card transition-all duration-300 group cursor-pointer relative overflow-hidden h-full"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      </div>
                      
                      <CardHeader className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/40 font-medium">
                            {market.category}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`gap-1 ${
                              market.status === "ACTIVE"
                                ? 'border-success/40 text-success' 
                                : market.status === "RESOLVED"
                                ? 'border-accent/40 text-accent'
                                : 'border-muted/40 text-muted-foreground'
                            }`}
                          >
                            {market.status === "ACTIVE" && <TrendingUp className="w-3 h-3" />}
                            {market.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {market.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 relative z-10">
                        {market.status === "ACTIVE" && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span className="text-success">Yes {percentages.yes}%</span>
                              <span className="text-prediction-no">No {percentages.no}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                              <div 
                                className="bg-success transition-all duration-500 ease-out hover:brightness-110"
                                style={{ width: `${percentages.yes}%` }}
                              />
                              <div 
                                className="bg-prediction-no transition-all duration-500 ease-out hover:brightness-110"
                                style={{ width: `${percentages.no}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span className="text-xs">Participants</span>
                            </div>
                            <div className="text-sm font-semibold text-foreground">{participants}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                {market.status === "ACTIVE" ? 'Closes in' : 'Ended'}
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                              {formatTimeLeft(market.endDate)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Volume</div>
                            <div className="text-sm font-semibold text-primary">
                              {formatVolume(market.totalVolume)}
                            </div>
                          </div>
                        </div>

                        <Button 
                          className={`w-full transition-all relative overflow-hidden group ${
                            market.status === "ACTIVE"
                              ? 'bg-gradient-gold hover:shadow-glow-primary'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          disabled={market.status !== "ACTIVE"}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <span className="relative font-medium">
                            {market.status === "ACTIVE"
                              ? 'Make Prediction' 
                              : market.status === "RESOLVED"
                              ? 'View Results'
                              : 'View Details'
                            }
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    if (page > totalPages) return null;
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Markets;