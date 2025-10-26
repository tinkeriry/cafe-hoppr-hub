import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sql } from "@/integrations/neon/client";
import { Cafe } from "@/integrations/neon/types";
import { toast } from "sonner";

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
      await sql`
        UPDATE cafes SET
          name = ${formData.name},
          cafe_photo = ${formData.cafe_photo},
          cafe_location_link = ${formData.cafe_location_link},
          review = ${formData.review},
          star_rating = ${formData.star_rating},
          price = ${formData.price},
          wifi = ${formData.wifi},
          seat_comfort = ${formData.seat_comfort},
          electricity_socket = ${formData.electricity_socket},
          food_beverage = ${formData.food_beverage},
          praying_room = ${formData.praying_room},
          hospitality = ${formData.hospitality},
          toilet = ${formData.toilet},
          noise = ${formData.noise},
          parking = ${formData.parking},
          updated_at = ${new Date().toISOString()}
        WHERE cafe_id = ${formData.cafe_id}
      `;

      toast.success("Cafe updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error updating cafe:', error);
      toast.error("Error updating cafe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  const selectOptions = {
    rating: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    availability: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
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
              value={formData.cafe_photo}
              onChange={(e) => setFormData({ ...formData, cafe_photo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Cafe Location Link*</Label>
            <Input
              id="location"
              placeholder="Enter cafe Google Maps or Apple Map link"
              value={formData.cafe_location_link}
              onChange={(e) => setFormData({ ...formData, cafe_location_link: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="review">Comment/Review*</Label>
            <Textarea
              id="review"
              placeholder="Enter whatever lol"
              value={formData.review || ""}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">💲 Price</Label>
              <Select value={formData.price?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, price: parseInt(value) })}>
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
              <Select value={formData.food_beverage?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, food_beverage: parseInt(value) })}>
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
                value={formData.seat_comfort?.toString() || ""}
                onChange={(e) => setFormData({ ...formData, seat_comfort: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="signal">📶 Signal Strength</Label>
              <Select value={formData.wifi?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, wifi: parseInt(value) })}>
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
              <Select value={formData.noise?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, noise: parseInt(value) })}>
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
              <Select value={formData.electricity_socket?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, electricity_socket: parseInt(value) })}>
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
              <Label htmlFor="toilet">🚽 Toilet</Label>
              <Select value={formData.toilet?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, toilet: parseInt(value) })}>
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
              <Select value={formData.praying_room?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, praying_room: parseInt(value) })}>
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
              <Select value={formData.hospitality?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, hospitality: parseInt(value) })}>
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
              <Select value={formData.parking?.toString() || ""} onValueChange={(value) => setFormData({ ...formData, parking: parseInt(value) })}>
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