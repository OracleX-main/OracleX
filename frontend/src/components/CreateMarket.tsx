import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calendar, DollarSign } from 'lucide-react';
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

const CreateMarket: React.FC = () => {
  const { isConnected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
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
        endTimeUnix
      );

      toast.success('Market created on blockchain!', {
        description: `Transaction: ${txHash.slice(0, 10)}...`
      });

      // Save market to backend database
      const marketData = {
        title: formData.title,
        description: formData.description,
        outcomes: formData.outcomes,
        endTime: endDateTime.toISOString(),
        category: formData.category || 'General',
        creator: address,
        transactionHash: txHash,
        marketId: marketId || 0,
        status: 'active'
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Please connect your wallet to create a prediction market.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Create Prediction Market
        </CardTitle>
        <CardDescription>
          Create a new prediction market with AI-powered resolution
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              />
              <Button 
                type="button" 
                onClick={addOutcome}
                disabled={!newOutcome.trim()}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.outcomes.map((outcome, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
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
      </CardContent>
    </Card>
  );
};

export default CreateMarket;