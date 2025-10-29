import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import MarketCard from "@/components/shared/MarketCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import { mockMarkets } from "@/lib/mockData";
import { MarketStatus, SortOrder } from "@/lib/enums";
import { Link } from "react-router-dom";

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NEWEST);
  const [selectedStatus, setSelectedStatus] = useState<MarketStatus | "all">("all");

  const filteredMarkets = mockMarkets.filter(market => {
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || market.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-gold bg-clip-text text-transparent">Explore Markets</span>
            </h1>
            <p className="text-muted-foreground">
              Browse and predict on trending prediction markets
            </p>
          </div>
          <Link to="/create-market">
            <Button className="gap-2 bg-gradient-gold hover:shadow-glow-primary">
              <Plus className="w-4 h-4" />
              Create Market
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-primary/30"
            />
          </div>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
            <SelectTrigger className="w-full md:w-48 bg-card border-primary/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SortOrder.NEWEST}>Newest</SelectItem>
              <SelectItem value={SortOrder.MOST_POPULAR}>Most Popular</SelectItem>
              <SelectItem value={SortOrder.HIGHEST_VOLUME}>Highest Volume</SelectItem>
              <SelectItem value={SortOrder.ENDING_SOON}>Ending Soon</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 border-primary/40">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-card border border-primary/30">
            <TabsTrigger value="all" onClick={() => setSelectedStatus("all")}>All</TabsTrigger>
            <TabsTrigger value="active" onClick={() => setSelectedStatus(MarketStatus.ACTIVE)}>Active</TabsTrigger>
            <TabsTrigger value="resolved" onClick={() => setSelectedStatus(MarketStatus.RESOLVED)}>Resolved</TabsTrigger>
            <TabsTrigger value="disputed" onClick={() => setSelectedStatus(MarketStatus.DISPUTED)}>Disputed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No markets found matching your criteria</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Markets;