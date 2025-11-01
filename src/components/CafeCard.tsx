import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FilledYellowStar from "@/components/icons/FilledYellowStar";
import HalfFilledYellowStar from "@/components/icons/HalfFilledYellowStar";
import Price from '@/components/icons/Price';
import Food from '@/components/icons/Food';
import Seat from '@/components/icons/Seat';
import Wifi from '@/components/icons/Wifi';
import Speaker from '@/components/icons/Speaker';
import Electricity from '@/components/icons/Electricity';
import Lighting from '@/components/icons/Lighting';
import Pray from '@/components/icons/Pray';
import Smile from '@/components/icons/Smile';
import Park from '@/components/icons/Park';

interface CafeCardProps {
  cafe: {
    cafe_id: string;
    name: string;
    cafe_photo: string;
    cafe_location_link: string;
    reviews?: {
      review_id: string;
      cafe_id: string;
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
      created_at: string;
      updated_at: string;
    }[];
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

  // Get the latest review or aggregate averages from all reviews
  const latestReview = cafe.reviews?.[0]; // Reviews are ordered by created_at DESC
  const reviewCount = cafe.reviews?.length || 0;
  
  // Calculate average ratings across all reviews for badges
  const avgRating = (field: 'price' | 'food_beverage' | 'seat_comfort' | 'wifi' | 'noise' | 'electricity_socket' | 'praying_room' | 'hospitality' | 'toilet' | 'parking') => {
    if (!cafe.reviews?.length) return 0;
    const sum = cafe.reviews.reduce((acc, r) => acc + (r[field] || 0), 0);
    return Math.round(sum / cafe.reviews.length);
  };

  const badges = [
    { icon: Price, value: avgRating('price') },
    { icon: Food, value: avgRating('food_beverage') },
    { icon: Seat, value: avgRating('seat_comfort') },
    { icon: Wifi, value: avgRating('wifi') },
    { icon: Speaker, value: avgRating('noise') },
    { icon: Electricity, value: avgRating('electricity_socket') },
    { icon: Pray, value: avgRating('praying_room') },
    { icon: Smile, value: avgRating('hospitality') },
    { icon: Lighting, value: avgRating('toilet') },
    { icon: Park, value: avgRating('parking') },
  ].filter((badge) => badge.value && badge.value > 0);

  // Calculate average star rating
  const avgStarRating = cafe.reviews?.length 
    ? cafe.reviews.reduce((sum, r) => sum + r.star_rating, 0) / cafe.reviews.length 
    : 0;

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
      className="relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
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
        {latestReview && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(avgStarRating * 10) / 10)}
              </div>
              <span className="text-sm font-medium">{Math.round(avgStarRating * 10) / 10}</span>
              <span className="text-xs text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[4rem]">
              {latestReview.review}
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <badge.icon className="w-2 h-2 mr-1" /> {badge.value}/10
            </Badge>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="cafe"
            onClick={() => window.open(cafe.cafe_location_link, "_blank")}
            className="rounded-full px-6 py-2"
          >
            See Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CafeCard;