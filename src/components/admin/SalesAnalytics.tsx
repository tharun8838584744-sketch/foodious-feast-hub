import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, DollarSign, Users } from "lucide-react";

const SalesAnalytics = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch total orders and revenue
    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount, user_id");

    if (orders) {
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0);
      const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        avgOrderValue,
      });
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-center">Loading analytics...</div>;
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Avg Order Value",
      value: `₹${stats.avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Sales Analytics</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-8">
        <h3 className="mb-4 text-xl font-semibold">Quick Insights</h3>
        <div className="space-y-4 text-muted-foreground">
          <p>📊 Your canteen has served {stats.totalOrders} orders so far</p>
          <p>💰 Total revenue generated: ₹{stats.totalRevenue.toFixed(2)}</p>
          <p>👥 {stats.totalCustomers} unique customers have ordered</p>
          <p>📈 Average order value is ₹{stats.avgOrderValue.toFixed(2)}</p>
        </div>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
