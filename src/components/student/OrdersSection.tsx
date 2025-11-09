import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Package, Truck } from "lucide-react";

const statusConfig = {
  received: {
    label: "Received",
    icon: Clock,
    color: "bg-blue-500",
  },
  preparing: {
    label: "Preparing",
    icon: Package,
    color: "bg-yellow-500",
  },
  ready: {
    label: "Ready",
    icon: CheckCircle2,
    color: "bg-green-500",
  },
  delivered: {
    label: "Delivered",
    icon: Truck,
    color: "bg-gray-500",
  },
};

const OrdersSection = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Subscribe to order updates
    const channel = supabase
      .channel("orders-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          menu_items (name, price)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
        <p className="text-muted-foreground">
          Your order history will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const status = statusConfig[order.status as keyof typeof statusConfig];
        const StatusIcon = status.icon;

        return (
          <Card key={order.id} className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Order #{order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <Badge className={`gap-2 ${status.color}`}>
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </Badge>
            </div>

            <div className="mb-4 space-y-2">
              {order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.menu_items.name} × {item.quantity}
                  </span>
                  <span>₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">
                ₹{order.total_amount}
              </span>
            </div>

            <div className="mt-2 text-sm text-muted-foreground">
              Payment: {order.payment_method === "wallet" ? "Wallet" : "Online"}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default OrdersSection;
