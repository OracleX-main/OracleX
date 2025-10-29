import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { MarketCategory } from "@/lib/enums";
import { formatCategoryLabel, formatDate } from "@/lib/formatters";

const CreateMarket = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MarketCategory>(MarketCategory.CRYPTO);
  const [endDate, setEndDate] = useState<Date>();
  const [outcomes, setOutcomes] = useState<string[]>(["Yes", "No"]);
  const [newOutcome, setNewOutcome] = useState("");

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setOutcomes([...outcomes, newOutcome.trim()]);
      setNewOutcome("");
    }
  };

  const removeOutcome = (index: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Create Market</span>
          </h1>
          <p className="text-muted-foreground">Create a new prediction market for the community</p>
        </div>

        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle>Market Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Market Title *</label>
              <Input
                placeholder="e.g., Will Bitcoin reach $100,000 by end of 2025?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-card border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Provide detailed information about the market and resolution criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-card border-primary/30 min-h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select value={category} onValueChange={(value) => setCategory(value as MarketCategory)}>
                  <SelectTrigger className="bg-card border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(MarketCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {formatCategoryLabel(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-card border-primary/30">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? formatDate(endDate) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Outcome Options *</label>
              <div className="space-y-2">
                {outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={outcome}
                      disabled
                      className="bg-card border-primary/30"
                    />
                    {outcomes.length > 2 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOutcome(index)}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom outcome..."
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOutcome()}
                  className="bg-card border-primary/30"
                />
                <Button onClick={addOutcome} variant="outline" className="gap-2 border-primary/40">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="bg-card/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Preview</p>
              <p className="text-sm text-muted-foreground">
                {title || "Your market title will appear here"}
              </p>
              <div className="flex gap-2 flex-wrap">
                {outcomes.map((outcome, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                    {outcome}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="flex-1 bg-gradient-gold hover:shadow-glow-primary">
                Create Market
              </Button>
              <Button variant="outline" className="flex-1 border-primary/40">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CreateMarket;