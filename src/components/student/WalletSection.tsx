import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WalletSectionProps {
  profile: any;
  onUpdate: () => void;
}

const WalletSection = ({ profile, onUpdate }: WalletSectionProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [100, 250, 500, 1000];

  const topUpWallet = async (topUpAmount: number) => {
    setLoading(true);

    const newBalance = (profile?.wallet_balance || 0) + topUpAmount;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", profile.id);

    if (updateError) {
      toast({
        title: "Top-up failed",
        description: updateError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    await supabase.from("wallet_transactions").insert({
      user_id: profile.id,
      amount: topUpAmount,
      transaction_type: "topup",
      description: `Wallet top-up of ₹${topUpAmount}`,
    });

    toast({
      title: "Wallet topped up!",
      description: `₹${topUpAmount} has been added to your wallet`,
    });

    setAmount("");
    setLoading(false);
    onUpdate();
  };

  const handleCustomTopUp = () => {
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    topUpWallet(topUpAmount);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="p-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-2 text-3xl font-bold">Wallet Balance</h2>
          <p className="text-5xl font-bold text-primary">
            ₹{profile?.wallet_balance?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Custom Amount</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="10"
              />
              <Button
                onClick={handleCustomTopUp}
                disabled={loading}
                className="bg-gradient-primary whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                onClick={() => topUpWallet(quickAmount)}
                disabled={loading}
                className="text-lg font-semibold"
              >
                +₹{quickAmount}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
        </div>
        
        <div className="text-center text-muted-foreground py-8">
          Transaction history coming soon...
        </div>
      </Card>
    </div>
  );
};

export default WalletSection;
