import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartSectionProps {
  profile: any;
  onOrderPlaced: () => void;
}

const CartSection = ({ profile, onOrderPlaced }: CartSectionProps) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "online">("wallet");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) {
      setCartItems([]);
      return;
    }

    const cart = JSON.parse(savedCart);
    const itemIds = Object.keys(cart);

    if (itemIds.length === 0) {
      setCartItems([]);
      return;
    }

    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .in("id", itemIds);

    const items = (data || []).map((item) => ({
      ...item,
      quantity: cart[item.id],
    }));

    setCartItems(items);
  };

  const removeItem = (itemId: string) => {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return;

    const cart = JSON.parse(savedCart);
    delete cart[itemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartItems();

    toast({
      title: "Removed from cart",
      description: "Item removed successfully",
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to cart before placing order",
        variant: "destructive",
      });
      return;
    }

    const total = calculateTotal();

    if (paymentMethod === "wallet" && profile.wallet_balance < total) {
      toast({
        title: "Insufficient balance",
        description: "Please top up your wallet or choose online payment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: profile.id,
        total_amount: total,
        payment_method: paymentMethod,
        status: "received",
      })
      .select()
      .single();

    if (orderError) {
      toast({
        title: "Order failed",
        description: orderError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    // Update wallet if needed
    if (paymentMethod === "wallet") {
      await supabase
        .from("profiles")
        .update({ wallet_balance: profile.wallet_balance - total })
        .eq("id", profile.id);

      await supabase.from("wallet_transactions").insert({
        user_id: profile.id,
        amount: -total,
        transaction_type: "deduction",
        description: `Payment for order #${order.id.slice(0, 8)}`,
        order_id: order.id,
      });
    }

    // Clear cart
    localStorage.removeItem("cart");
    setCartItems([]);
    setLoading(false);

    toast({
      title: "Order placed!",
      description: "Your order has been received and is being prepared",
    });

    onOrderPlaced();
  };

  if (cartItems.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-xl font-semibold">Your cart is empty</h3>
        <p className="text-muted-foreground">
          Browse our menu and add some delicious items!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <h2 className="mb-6 text-2xl font-bold">Cart Items</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-6 sticky top-4">
          <h2 className="mb-6 text-2xl font-bold">Order Summary</h2>
          
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6">
            <Label className="mb-3 block font-semibold">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet">
                  Wallet (Balance: ₹{profile?.wallet_balance?.toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">Online Payment</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={placeOrder}
            disabled={loading}
            className="w-full bg-gradient-primary text-lg"
            size="lg"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CartSection;
