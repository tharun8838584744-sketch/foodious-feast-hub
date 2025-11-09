import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import butterChickenImage from "@/assets/butter-chicken-biryani.jpg";
import paneerWrapImage from "@/assets/paneer-tikka-wrap.jpg";
import hakkaNoodlesImage from "@/assets/veg-hakka-noodles.jpg";
import chickenManchurianImage from "@/assets/chicken-manchurian.jpg";
import coldCoffeeImage from "@/assets/cold-coffee.jpg";
import masalaChaasImage from "@/assets/masala-chaas.jpg";

const imageMap: Record<string, string> = {
  "Butter Chicken Biryani": butterChickenImage,
  "Paneer Tikka Wrap": paneerWrapImage,
  "Veg Hakka Noodles": hakkaNoodlesImage,
  "Chicken Manchurian": chickenManchurianImage,
  "Cold Coffee": coldCoffeeImage,
  "Masala Chaas": masalaChaasImage,
};

const MenuSection = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
    loadCart();
  }, []);

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("cuisine_type", { ascending: true });

    setMenuItems(data || []);
    setLoading(false);
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: Record<string, number>) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (itemId: string) => {
    const newCart = { ...cart, [itemId]: (cart[itemId] || 0) + 1 };
    saveCart(newCart);
    toast({
      title: "Added to cart",
      description: "Item added successfully",
    });
  };

  const removeFromCart = (itemId: string) => {
    const newCart = { ...cart };
    if (newCart[itemId] > 1) {
      newCart[itemId]--;
    } else {
      delete newCart[itemId];
    }
    saveCart(newCart);
  };

  const groupedItems: Record<string, any[]> = menuItems.reduce((acc, item) => {
    if (!acc[item.cuisine_type]) {
      acc[item.cuisine_type] = [];
    }
    acc[item.cuisine_type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return <div className="text-center">Loading menu...</div>;
  }

  return (
    <div className="space-y-12">
      {Object.entries(groupedItems).map(([cuisine, items]) => (
        <div key={cuisine}>
          <h2 className="mb-6 text-3xl font-bold text-foreground">{cuisine}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden bg-gradient-card shadow-card transition-all hover:shadow-hover hover:scale-105"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={imageMap[item.name] || item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-xl font-bold text-card-foreground">
                      {item.name}
                    </h3>
                    {item.is_veg && (
                      <Badge variant="secondary" className="gap-1">
                        <Leaf className="h-3 w-3" />
                        Veg
                      </Badge>
                    )}
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₹{item.price}
                    </span>
                    {cart[item.id] ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[2rem] text-center font-semibold">
                          {cart[item.id]}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item.id)}
                          className="bg-gradient-primary"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(item.id)}
                        className="gap-2 bg-gradient-primary"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuSection;
