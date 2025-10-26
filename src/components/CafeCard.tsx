import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FilledYellowStar from "@/components/icons/FilledYellowStar";
import HalfFilledYellowStar from "@/components/icons/HalfFilledYellowStar";

interface CafeCardProps {
  cafe: {
    cafe_id: string;
    name: string;
    cafe_photo: string;
    cafe_location_link: string;
    review: string;
    star_rating: number;
    price: number;
    wifi: number;
    seat_comfort: number;
    electricity_socket: number;
    food_beverage: number;
    praying_room: number;
    hospitality: number;
    toilet: number;
    noise: number;
    parking: number;
    created_by: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const CafeCard = ({ cafe, onEdit, onDelete }: CafeCardProps) => {
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

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
    { icon: "🍔", value: cafe.food_beverage },
    { icon: "🪑", value: cafe.seat_comfort },
    { icon: "📶", value: cafe.wifi },
    { icon: "🔊", value: cafe.noise },
    { icon: "⚡", value: cafe.electricity_socket },
    { icon: "🕌", value: cafe.praying_room },
    { icon: "😊", value: cafe.hospitality },
    { icon: "🚽", value: cafe.toilet },
    { icon: "🅿️", value: cafe.parking },
  ].filter((badge) => badge.value && badge.value > 0);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.1 && rating % 1 <= 0.9;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FilledYellowStar key={i} className="w-4 h-4" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<HalfFilledYellowStar key="half" className="w-4 h-4" />);
    }

    return stars;
  };

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {imageError || !cafe.cafe_photo ? (
        <div className="w-full h-48 bg-gradient-to-br from-[#e5d8c2] to-[#d4c4a8] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">☕</div>
            <p className="text-[#746650] font-medium text-sm">No Image</p>
          </div>
        </div>
      ) : (
        <img
          src={cafe.cafe_photo}
          alt={cafe.name}
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
      )}
      
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
        
        {/* Rating display with custom stars */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {renderStars(cafe.star_rating)}
          </div>
          <span className="text-sm font-medium">{cafe.star_rating}</span>
          <span className="text-xs text-muted-foreground">1 reviews</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[4.5rem]">
          {cafe.review}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {badge.icon} {badge.value}/10
            </Badge>
          ))}
        </div>

        <Button
          variant="cafe"
          onClick={() => window.open(cafe.cafe_location_link, "_blank")}
          className="w-full"
        >
          See Details
        </Button>
      </div>
    </div>
  );
};

export default CafeCard;