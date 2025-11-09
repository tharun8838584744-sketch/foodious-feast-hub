import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, ShieldCheck, Utensils } from "lucide-react";
import heroImage from "@/assets/hero-canteen.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white md:text-7xl">
            MEC Canteen
          </h1>
          <p className="mb-8 max-w-2xl text-xl text-white/90 md:text-2xl">
            Delicious Multicuisine Food at Your Fingertips
          </p>
        </div>
      </div>

      {/* Portal Selection */}
      <div className="container mx-auto -mt-20 px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Student Portal */}
          <Card className="group overflow-hidden bg-gradient-card shadow-card transition-all hover:shadow-hover hover:scale-105">
            <div className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-card-foreground">
                Student Portal
              </h2>
              <p className="mb-6 text-muted-foreground">
                Browse our delicious menu, place orders, track your food, and manage your wallet balance.
              </p>
              <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  Browse Multicuisine Menu
                </li>
                <li className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  Track Live Order Status
                </li>
                <li className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  Manage Digital Wallet
                </li>
              </ul>
              <Link to="/auth?portal=student">
                <Button size="lg" className="w-full bg-gradient-primary text-lg">
                  Enter Student Portal
                </Button>
              </Link>
            </div>
          </Card>

          {/* Admin Portal */}
          <Card className="group overflow-hidden bg-gradient-card shadow-card transition-all hover:shadow-hover hover:scale-105">
            <div className="p-8">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                <ShieldCheck className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-card-foreground">
                Admin Portal
              </h2>
              <p className="mb-6 text-muted-foreground">
                Manage menu items, update order status, view sales reports, and handle transactions.
              </p>
              <ul className="mb-8 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  Manage Food Menu
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  Update Order Status
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  View Analytics
                </li>
              </ul>
              <Link to="/auth?portal=admin">
                <Button size="lg" className="w-full bg-secondary text-lg">
                  Enter Admin Portal
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
