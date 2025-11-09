import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import PageLayout from "@/components/layout/PageLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calendar, DollarSign, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { web3Service } from '@/services/web3';
import { apiService } from '@/services/api';

interface MarketFormData {
  title: string;
  description: string;
  outcomes: string[];
  endDate: string;
  endTime: string;
  category: string;
}

const CreateMarket = () => {
  const { isConnected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isAIParsing, setIsAIParsing] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [showAIInput, setShowAIInput] = useState(true);
  const [newOutcome, setNewOutcome] = useState('');
  const [formData, setFormData] = useState<MarketFormData>({
    title: '',
    description: '',
    outcomes: [],
    endDate: '',
    endTime: '',
    category: ''
  });

  const handleInputChange = (field: keyof MarketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAIParse = async () => {
    if (!aiInput.trim()) {
      toast.error('Please describe your market idea');
      return;
    }

    setIsAIParsing(true);

    try {
      // TODO: Replace with actual AI API call to backend
      // For now, we'll simulate AI parsing with a simple parser
      toast.info('AI is analyzing your input...', { duration: 2000 });

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simple heuristic parsing (will be replaced with actual AI)
      const lines = aiInput.split('\n').filter(l => l.trim());
      const firstLine = lines[0] || aiInput.slice(0, 100);
      
      // Extract title (first sentence or line)
      const title = firstLine.length > 150 ? firstLine.slice(0, 150) + '...' : firstLine;
      
      // Use full input as description
      const description = aiInput;
      
      // Try to detect outcomes (yes/no for now)
      const hasYesNo = /\byes\b|\bno\b/i.test(aiInput.toLowerCase());
      const outcomes = hasYesNo ? ['Yes', 'No'] : [];
      
      // Try to detect category
      let category = 'General';
      const lowerInput = aiInput.toLowerCase();
      if (lowerInput.includes('bitcoin') || lowerInput.includes('crypto') || lowerInput.includes('eth')) {
        category = 'Cryptocurrency';
      } else if (lowerInput.includes('sport') || lowerInput.includes('nba') || lowerInput.includes('nfl')) {
        category = 'Sports';
      } else if (lowerInput.includes('politic') || lowerInput.includes('election')) {
        category = 'Politics';
      } else if (lowerInput.includes('tech') || lowerInput.includes('ai') || lowerInput.includes('meta')) {
        category = 'Technology';
      }
      
      // Try to detect end date
      const dateMatch = aiInput.match(/(\d{4})-(\d{2})-(\d{2})|(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
      let endDate = '';
      if (dateMatch) {
        if (dateMatch[1]) {
          endDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        }
      }

      setFormData({
        title,
        description,
        outcomes,
        category,
        endDate,
        endTime: '23:59'
      });

      setShowAIInput(false);
      
      toast.success('AI parsed your market idea!', {
        description: 'Review and adjust the details below'
      });

    } catch (error) {
      console.error('AI parsing failed:', error);
      toast.error('Failed to parse market idea', {
        description: 'Please try again or use manual entry'
      });
    } finally {
      setIsAIParsing(false);
    }
  };

  const resetToAIInput = () => {
    setShowAIInput(true);
    setFormData({
      title: '',
      description: '',
      outcomes: [],
      endDate: '',
      endTime: '',
      category: ''
    });
  };

  const addOutcome = () => {
    if (newOutcome.trim() && !formData.outcomes.includes(newOutcome.trim())) {
      setFormData(prev => ({
        ...prev,
        outcomes: [...prev.outcomes, newOutcome.trim()]
      }));
      setNewOutcome('');
    }
  };

  const removeOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Market title is required';
    if (!formData.description.trim()) return 'Market description is required';
    if (formData.outcomes.length < 2) return 'At least 2 outcomes are required';
    if (!formData.endDate) return 'End date is required';
    if (!formData.endTime) return 'End time is required';
    
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    if (endDateTime <= new Date()) return 'End time must be in the future';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Calculate end time in Unix timestamp
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const endTimeUnix = Math.floor(endDateTime.getTime() / 1000);

      // Create market on blockchain
      toast.info('Creating market on blockchain...');
      const { txHash, marketId } = await web3Service.createMarket(
        formData.title,
        formData.description,
        formData.outcomes,
        endTimeUnix,
        formData.category || 'General',
        0 // Oracle type: 0 = AI, 1 = Manual, 2 = Hybrid
      );

      toast.success('Market created on blockchain!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });

      // Save market to backend database
      const marketData = {
        title: formData.title,
        description: formData.description,
        outcomes: formData.outcomes,
        endDate: endDateTime.toISOString(), // Backend expects 'endDate' not 'endTime'
        category: formData.category || 'General',
        contractAddress: txHash, // Store transaction hash as contract address reference
        metadata: {
          blockchainMarketId: marketId || 0,
          transactionHash: txHash,
          oracleType: 0
        }
      };

      await apiService.createMarket(marketData);
      
      toast.success('Market successfully created!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        outcomes: [],
        endDate: '',
        endTime: '',
        category: ''
      });

    } catch (error) {
      console.error('Failed to create market:', error);
      toast.error('Failed to create market', {
        description: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
            <CardContent className="pt-6">
              <Alert>
                <AlertDescription>
                  Please connect your wallet to create a prediction market.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Create Market</span>
          </h1>
          <p className="text-muted-foreground">Create a new AI-powered prediction market</p>
        </div>

        <Card className="bg-gradient-card backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Market Details
            </CardTitle>
            <CardDescription>
              Create a new prediction market with AI-powered resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* AI Natural Language Input */}
            {showAIInput ? (
              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-lg">AI-Powered Market Creation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Describe your prediction market in natural language, and our AI will automatically extract the title, description, outcomes, and other details.
                  </p>
                  
                  <div className="space-y-3">
                    <Label htmlFor="ai-input" className="text-base">Describe Your Market</Label>
                    <Textarea
                      id="ai-input"
                      placeholder="Example: Will Bitcoin reach $100,000 by December 31st, 2025? This market will resolve to YES if Bitcoin (BTC) trades at or above $100,000 USD on any major exchange (Coinbase, Binance, Kraken) before midnight UTC on December 31, 2025. Otherwise it resolves to NO."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      rows={6}
                      className="bg-card border-yellow-500/30 focus:border-yellow-500/50 resize-none"
                      disabled={isAIParsing}
                    />
                    
                    <div className="flex gap-3">
                      <Button 
                        type="button"
                        onClick={handleAIParse}
                        disabled={isAIParsing || !aiInput.trim()}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold"
                      >
                        {isAIParsing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                            AI is analyzing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowAIInput(false)}
                        disabled={isAIParsing}
                        className="border-primary/40"
                      >
                        Manual Entry
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToAIInput}
                  className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Switch to AI Input
                </Button>
              </div>
            )}

            {!showAIInput && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Market Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Market Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Will Bitcoin reach $100,000 by December 2025?"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={200}
                  className="bg-card border-primary/30"
                />
              </div>

              {/* Market Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the market conditions and resolution criteria..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="bg-card border-primary/30"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Cryptocurrency, Sports, Politics"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="bg-card border-primary/30"
                />
              </div>

              {/* Outcomes */}
              <div className="space-y-2">
                <Label>Possible Outcomes *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an outcome..."
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                    className="bg-card border-primary/30"
                  />
                  <Button 
                    type="button" 
                    onClick={addOutcome}
                    disabled={!newOutcome.trim()}
                    size="icon"
                    variant="outline"
                    className="border-primary/40"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.outcomes.map((outcome, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-primary/20 text-primary">
                      {outcome}
                      <button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* End Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-card border-primary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="bg-card border-primary/30"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-card/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Preview</p>
                <p className="text-sm text-muted-foreground">
                  {formData.title || "Your market title will appear here"}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {formData.outcomes.map((outcome, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                      {outcome}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-gold hover:shadow-glow-primary" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating Market...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  </PageLayout>
);
};export default CreateMarket;