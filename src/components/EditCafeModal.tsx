import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Cafe {
  id: string;
  name: string;
  image_url: string;
  location_link: string;
  comment: string;
  price: string;
  food_taste: string;
  seating: string;
  signal_strength: string;
  noise: string;
  electricity: string;
  lighting: string;
  mushola: string;
  smoking_room: string;
  parking: string;
}

interface EditCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafe: Cafe | null;
  onSuccess: () => void;
}

const EditCafeModal = ({ open, onOpenChange, cafe, onSuccess }: EditCafeModalProps) => {
  const [formData, setFormData] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cafe) {
      setFormData(cafe);
    }
  }, [cafe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("cafes")
        .update(formData)
        .eq("id", formData.id);

      if (error) throw error;

      toast.success("Cafe updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  const selectOptions = {
    rating: ["Best", "Good", "Average", "Poor"],
    availability: ["Yes", "No", "Limited"],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-50"
        >
          <span className="text-2xl">✕</span>
        </button>

        <DialogHeader>
          <DialogTitle>Edit Cafe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Cafe Name*</Label>
            <Input
              id="name"
              placeholder="Enter cafe name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">Cafe Image*</Label>
            <Input
              id="image"
              placeholder="Enter image link"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Cafe Location Link*</Label>
            <Input
              id="location"
              placeholder="Enter cafe Google Maps or Apple Map link"
              value={formData.location_link}
              onChange={(e) => setFormData({ ...formData, location_link: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="comment">Comment/Review*</Label>
            <Textarea
              id="comment"
              placeholder="Enter whatever lol"
              value={formData.comment || ""}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">💲 Price</Label>
              <Select value={formData.price || ""} onValueChange={(value) => setFormData({ ...formData, price: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.rating.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="food_taste">🍔 Food Taste</Label>
              <Select value={formData.food_taste || ""} onValueChange={(value) => setFormData({ ...formData, food_taste: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.rating.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="seating">🪑 Seating</Label>
              <Input
                id="seating"
                placeholder="Banyak dan enakeun ga?"
                value={formData.seating || ""}
                onChange={(e) => setFormData({ ...formData, seating: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="signal">📶 Signal Strength</Label>
              <Select value={formData.signal_strength || ""} onValueChange={(value) => setFormData({ ...formData, signal_strength: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.rating.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="noise">🔊 Noise</Label>
              <Select value={formData.noise || ""} onValueChange={(value) => setFormData({ ...formData, noise: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.rating.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="electricity">⚡ Electricity</Label>
              <Select value={formData.electricity || ""} onValueChange={(value) => setFormData({ ...formData, electricity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.rating.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lighting">💡 Lighting</Label>
              <Select value={formData.lighting || ""} onValueChange={(value) => setFormData({ ...formData, lighting: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.rating.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mushola">🕌 Mushola</Label>
              <Select value={formData.mushola || ""} onValueChange={(value) => setFormData({ ...formData, mushola: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.availability.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="smoking">🚬 Smoking Room</Label>
              <Select value={formData.smoking_room || ""} onValueChange={(value) => setFormData({ ...formData, smoking_room: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.availability.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="parking">🅿️ Parking</Label>
              <Select value={formData.parking || ""} onValueChange={(value) => setFormData({ ...formData, parking: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.availability.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="cafe"
              disabled={loading}
              className="px-8"
            >
              {loading ? "Updating..." : "Update Cafe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCafeModal;