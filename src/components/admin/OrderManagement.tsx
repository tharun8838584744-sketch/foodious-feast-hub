import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CheckCircle2, Package, Truck, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  received: { label: "Received", icon: Clock, color: "bg-blue-500" },
  preparing: { label: "Preparing", icon: Package, color: "bg-yellow-500" },
  ready: { label: "Ready", icon: CheckCircle2, color: "bg-green-500" },
  delivered: { label: "Delivered", icon: Truck, color: "bg-gray-500" },
  cancelled: { label: "Cancelled", icon: Ban, color: "bg-red-500" },
};

const OrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // Subscribe to order updates
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        profiles (full_name, student_id),
        order_items (
          *,
          menu_items (name, price)
        )
      `)
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}`,
      });
      fetchOrders();
    }
  };

  if (loading) {
    return <div className="text-center">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Active Orders</h2>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length} Active
        </Badge>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={order.id} className="p-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.profiles?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={`gap-2 ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.menu_items.name} × {item.quantity}
                        </span>
                        <span className="font-semibold">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                <div className="border-l pl-6">
                  <h4 className="mb-4 font-semibold">Update Status</h4>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready for Pickup</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Payment: {order.payment_method === "wallet" ? "Wallet" : "Online"}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {orders.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
            <p className="text-muted-foreground">Orders will appear here</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
