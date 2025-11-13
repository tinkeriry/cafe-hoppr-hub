import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FilledYellowStar from "@/components/icons/FilledYellowStar";
import HalfFilledYellowStar from "@/components/icons/HalfFilledYellowStar";
import EmptyYellowStar from "@/components/icons/EmptyYellowStar";
import Price from "@/components/icons/Price";
import Food from "@/components/icons/Food";
import Seat from "@/components/icons/Seat";
import Wifi from "@/components/icons/Wifi";
import Speaker from "@/components/icons/Speaker";
import Electricity from "@/components/icons/Electricity";
import Lighting from "@/components/icons/Lighting";
import Pray from "@/components/icons/Pray";
import Smile from "@/components/icons/Smile";
import Park from "@/components/icons/Park";
import ThreeDots from "@/components/icons/ThreeDots";
import { MapPin, CircleDot, XCircle } from "lucide-react";
import { Review } from "@/integrations/server/types";

interface CafeCardProps {
  cafe: {
    cafe_id: string;
    name: string;
    cafe_photo: string;
    cafe_location_link: string;
    location_id?: string;
    location_name?: string;
    operational_days?: string[];
    opening_hour?: string;
    closing_hour?: string;
    reviews?: Review[];
    status: string;
    created_at: string;
    updated_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onAddReview: () => void;
}

const CafeCard = ({ cafe, onEdit, onDelete, onAddReview }: CafeCardProps) => {
  const navigate = useNavigate();
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  const handleImageError = () => {
    setImageError(true);
  };

  // Check if cafe is currently open
  const isCafeOpen = () => {
    if (!cafe.opening_hour || !cafe.closing_hour || !cafe.operational_days) {
      return null; // Unknown status
    }

    // Parse operational_days - handle different formats from database
    let operationalDays: string[] = [];
    if (Array.isArray(cafe.operational_days)) {
      operationalDays = [...cafe.operational_days];
    } else if (typeof cafe.operational_days === "string") {
      const operationalDaysStr: string = cafe.operational_days;
      try {
        const parsed = JSON.parse(operationalDaysStr);
        operationalDays = Array.isArray(parsed) ? parsed : [];
      } catch {
        // PostgreSQL array format like "{MON,TUE}"
        const cleaned = operationalDaysStr.replace(/[{}"]/g, "");
        operationalDays = cleaned ? cleaned.split(",").map((d) => d.trim()) : [];
      }
    }

    if (operationalDays.length === 0) {
      return null; // Unknown status
    }

    const now = new Date();
    // Get day abbreviation (MON, TUE, etc.)
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check if today is an operational day (case-insensitive comparison)
    const isOperationalDay = operationalDays.some((day) => day.toUpperCase().trim() === currentDay);

    if (!isOperationalDay) {
      return false; // Closed - not an operational day
    }

    // Compare time strings (HH:MM format)
    const openingTime = cafe.opening_hour.substring(0, 5);
    const closingTime = cafe.closing_hour.substring(0, 5);

    // Check if current time is between opening and closing
    return currentTime >= openingTime && currentTime <= closingTime;
  };

  // Handle click outside for action menu and calculate position
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node) &&
        actionButtonRef.current &&
        !actionButtonRef.current.contains(event.target as Node)
      ) {
        setShowActionMenu(false);
      }
    };

    const updateMenuPosition = () => {
      if (actionButtonRef.current) {
        const rect = actionButtonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
        });
      }
    };

    if (showActionMenu) {
      updateMenuPosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updateMenuPosition);
      window.addEventListener("scroll", updateMenuPosition, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [showActionMenu]);

  const handleAddReview = () => {
    setShowActionMenu(false);
    onAddReview();
  };

  const handleEditCafe = () => {
    setShowActionMenu(false);
    onEdit();
  };

  const handleDeleteCafe = () => {
    setShowActionMenu(false);
    onDelete();
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
  const avgRating = (
    field:
      | "price"
      | "food_beverage"
      | "seat_comfort"
      | "wifi"
      | "noise"
      | "electricity_socket"
      | "praying_room"
      | "hospitality"
      | "toilet"
      | "parking"
  ) => {
    if (!cafe.reviews?.length) return 0;
    const sum = cafe.reviews.reduce((acc, r) => acc + (r[field] || 0), 0);
    return Math.round(sum / cafe.reviews.length);
  };

  const badges = [
    { icon: Price, value: avgRating("price") },
    { icon: Food, value: avgRating("food_beverage") },
    { icon: Seat, value: avgRating("seat_comfort") },
    { icon: Wifi, value: avgRating("wifi") },
    { icon: Speaker, value: avgRating("noise") },
    { icon: Electricity, value: avgRating("electricity_socket") },
    { icon: Pray, value: avgRating("praying_room") },
    { icon: Smile, value: avgRating("hospitality") },
    { icon: Lighting, value: avgRating("toilet") },
    { icon: Park, value: avgRating("parking") },
  ].filter((badge) => badge.value && badge.value > 0);

  // Calculate average rating from all rating fields in all reviews
  const calculateAvgRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const allRatings: number[] = [];
    reviews.forEach((r) => {
      if (r.price > 0) allRatings.push(r.price);
      if (r.wifi > 0) allRatings.push(r.wifi);
      if (r.seat_comfort > 0) allRatings.push(r.seat_comfort);
      if (r.food_beverage > 0) allRatings.push(r.food_beverage);
      if (r.hospitality > 0) allRatings.push(r.hospitality);
      if (r.parking > 0) allRatings.push(r.parking);
      if (r.electricity_socket > 0) allRatings.push(r.electricity_socket);
      if (r.praying_room > 0) allRatings.push(r.praying_room);
      if (r.toilet > 0) allRatings.push(r.toilet);
      if (r.noise > 0) allRatings.push(r.noise);
    });
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
    return sum / allRatings.length;
  };

  const avgStarRating = calculateAvgRating(cafe.reviews || []);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.1 && rating % 1 <= 0.9;

    for (let i = 1; i <= 10; i++) {
      if (i <= fullStars) {
        stars.push(<FilledYellowStar key={i} className="w-4 h-4" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<HalfFilledYellowStar key={i} className="w-4 h-4" />);
      } else {
        stars.push(<EmptyYellowStar key={i} className="w-4 h-4" />);
      }
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
      <div className="relative">
        {imageError || !cafe.cafe_photo ? (
          <div className="w-full h-[240px] bg-gradient-to-br from-[#e5d8c2] to-[#d4c4a8] flex items-center justify-center rounded-t-3xl">
            <div className="text-center">
              <div className="text-6xl mb-2">☕</div>
              <p className="text-[#746650] font-medium text-sm">No Image</p>
            </div>
          </div>
        ) : (
          <img
            src={cafe.cafe_photo}
            alt={cafe.name}
            className="w-full h-[240px] object-cover rounded-t-3xl"
            onError={handleImageError}
          />
        )}
        {/* Action Button - Top Right */}
        <button
          ref={actionButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowActionMenu(!showActionMenu);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm z-10"
          aria-label="Actions"
        >
          <ThreeDots />
        </button>
        {showActionMenu &&
          menuPosition &&
          createPortal(
            <div
              ref={actionMenuRef}
              className="fixed z-50 animate-in slide-in-from-top-2 duration-200"
              style={{
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`,
              }}
            >
              <div
                className="flex flex-col justify-start items-end relative rounded-2xl bg-white"
                style={{ boxShadow: "0px 8px 16px 0 rgba(88,60,49,0.2)" }}
              >
                <div
                  className="w-52 text-base font-medium text-left text-[#604926] cursor-pointer hover:text-[#746650] hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out"
                  onClick={handleAddReview}
                >
                  Add a Review
                </div>
                <div
                  className="w-52 text-base font-medium text-left text-[#604926] cursor-pointer hover:text-[#746650] hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out"
                  onClick={handleEditCafe}
                >
                  Edit Cafe
                </div>
                <div
                  className="w-52 text-base font-medium text-left text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out"
                  onClick={handleDeleteCafe}
                >
                  Delete Cafe
                </div>
              </div>
            </div>,
            document.body
          )}
        {/* Status Badge - Bottom Left */}
        {cafe.opening_hour && cafe.closing_hour && isCafeOpen() !== null && (
          <div
            className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm z-10 ${
              isCafeOpen() ? "bg-white/95 text-[#604926]" : "bg-white/95 text-red-600"
            }`}
          >
            {isCafeOpen() ? (
              <>
                <CircleDot className="w-4 h-4" />
                <span className="text-sm font-semibold">OPEN NOW</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">CLOSED</span>
              </>
            )}
          </div>
        )}

        {/* Location Badge - Bottom Right */}
        {cafe.location_name && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-white rounded-full shadow-sm">
            <MapPin className="w-4 h-4 text-[#604926]" />
            <span className="text-sm font-semibold text-[#604926]">{cafe.location_name}</span>
          </div>
        )}
      </div>

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
                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[4rem]">
              {latestReview.review}
            </p>
          </>
        )}

        {/* Review Metrics - Average from all reviews */}
        <div className="flex flex-wrap gap-2 mb-4 -mx-4 px-4 w-full">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]"
            >
              <badge.icon className="w-5 h-5 relative text-[#668d61]" />
              <p className="text-xs font-medium text-left text-[#668d61]">{badge.value}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end items-center gap-2">
          <Button
            variant="cafe"
            onClick={() => navigate(`/cafe/${cafe.cafe_id}`)}
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
