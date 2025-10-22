import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CafeCardProps {
  cafe: {
    id: string;
    name: string;
    image_url: string;
    location_link: string;
    comment: string;
    price?: string;
    food_taste?: string;
    seating?: string;
    signal_strength?: string;
    noise?: string;
    electricity?: string;
    lighting?: string;
    mushola?: string;
    smoking_room?: string;
    parking?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const CafeCard = ({ cafe, onEdit, onDelete }: CafeCardProps) => {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setShowMenu(true);
    }, 500);
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowMenu(true);
    }, 500);
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const badges = [
    { icon: "💲", value: cafe.price },
    { icon: "🍔", value: cafe.food_taste },
    { icon: "🪑", value: cafe.seating },
    { icon: "📶", value: cafe.signal_strength },
    { icon: "🔊", value: cafe.noise },
    { icon: "⚡", value: cafe.electricity },
    { icon: "💡", value: cafe.lighting },
    { icon: "🕌", value: cafe.mushola },
    { icon: "🚬", value: cafe.smoking_room },
    { icon: "🅿️", value: cafe.parking },
  ].filter((badge) => badge.value);

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={cafe.image_url}
        alt={cafe.name}
        className="w-full h-48 object-cover"
      />
      
      {showMenu && (
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-2 space-y-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowMenu(false);
              onEdit();
            }}
            className="w-full"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setShowMenu(false);
              onDelete();
            }}
            className="w-full"
          >
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{cafe.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {cafe.comment}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {badge.icon} {badge.value}
            </Badge>
          ))}
        </div>

        <Button
          variant="cafe"
          onClick={() => window.open(cafe.location_link, "_blank")}
          className="w-full"
        >
          See Location 📍
        </Button>
      </div>
    </div>
  );
};

export default CafeCard;