import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Wallet, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MenuSection from "@/components/student/MenuSection";
import CartSection from "@/components/student/CartSection";
import OrdersSection from "@/components/student/OrdersSection";
import WalletSection from "@/components/student/WalletSection";

const StudentPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth?portal=student");
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              MEC Canteen
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {profile?.full_name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">
                ₹{profile?.wallet_balance?.toFixed(2) || "0.00"}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
            </TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-8">
            <MenuSection />
          </TabsContent>

          <TabsContent value="cart" className="mt-8">
            <CartSection profile={profile} onOrderPlaced={() => setProfile(null)} />
          </TabsContent>

          <TabsContent value="orders" className="mt-8">
            <OrdersSection />
          </TabsContent>

          <TabsContent value="wallet" className="mt-8">
            <WalletSection profile={profile} onUpdate={checkAuth} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentPortal;
