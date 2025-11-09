import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MenuManagement = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cuisine_type: "Indian",
    is_veg: true,
    is_available: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .order("cuisine_type", { ascending: true });

    setMenuItems(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      cuisine_type: "Indian",
      is_veg: true,
      is_available: true,
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update(itemData)
        .eq("id", editingItem.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Menu item updated!" });
    } else {
      const { error } = await supabase
        .from("menu_items")
        .insert(itemData);

      if (error) {
        toast({
          title: "Creation failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Menu item created!" });
    }

    setDialogOpen(false);
    resetForm();
    fetchMenuItems();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      cuisine_type: item.cuisine_type,
      is_veg: item.is_veg,
      is_available: item.is_available,
    });
    setDialogOpen(true);
  };

  const toggleAvailability = async (item: any) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);

    if (!error) {
      toast({
        title: "Availability updated",
        description: `${item.name} is now ${!item.is_available ? "available" : "unavailable"}`,
      });
      fetchMenuItems();
    }
  };

  if (loading) {
    return <div className="text-center">Loading menu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Menu Items</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Select
                  value={formData.cuisine_type}
                  onValueChange={(value) => setFormData({ ...formData, cuisine_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_veg"
                  checked={formData.is_veg}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_veg: checked })}
                />
                <Label htmlFor="is_veg">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">Available</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.cuisine_type}</p>
              </div>
              <div className="flex gap-2">
                {item.is_veg && (
                  <Badge variant="secondary" className="gap-1">
                    <Leaf className="h-3 w-3" />
                  </Badge>
                )}
                <Badge variant={item.is_available ? "default" : "destructive"}>
                  {item.is_available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              {item.description || "No description"}
            </p>

            <div className="mb-4 text-2xl font-bold text-primary">
              ₹{item.price}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(item)}
                className="flex-1 gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant={item.is_available ? "destructive" : "default"}
                size="sm"
                onClick={() => toggleAvailability(item)}
                className="flex-1"
              >
                {item.is_available ? "Disable" : "Enable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {menuItems.length === 0 && (
        <Card className="p-12 text-center">
          <h3 className="mb-2 text-xl font-semibold">No menu items yet</h3>
          <p className="text-muted-foreground">Add your first menu item to get started</p>
        </Card>
      )}
    </div>
  );
};

export default MenuManagement;
