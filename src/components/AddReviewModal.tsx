import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Cafe } from "@/integrations/server/types";
import { createReview } from "@/integrations/server/reviews";
import { listCafesWithReviews } from "@/integrations/server/cafe";
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
import FilledYellowStar from "@/components/icons/FilledYellowStar";
import EmptyStar from "@/components/icons/EmptyStar";

interface AddReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafe: Cafe | null;
  onSuccess: () => void;
  token?: string;
}

const AddReviewModal = ({ open, onOpenChange, cafe, onSuccess, token }: AddReviewModalProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Page 1 fields
  const [contributorName, setContributorName] = useState("");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(cafe);
  const [cafeName, setCafeName] = useState("");
  const [review, setReview] = useState("");

  // Page 2 fields
  const [price, setPrice] = useState(0);
  const [wifi, setWifi] = useState(0);
  const [seatComfort, setSeatComfort] = useState(0);
  const [electricitySocket, setElectricitySocket] = useState(0);
  const [foodBeverage, setFoodBeverage] = useState(0);
  const [prayingRoom, setPrayingRoom] = useState(0);
  const [hospitality, setHospitality] = useState(0);
  const [toilet, setToilet] = useState(0);
  const [noise, setNoise] = useState(0);
  const [parking, setParking] = useState(0);

  const [loading, setLoading] = useState(false);

  // Dropdown states for cafe
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [isCafeDropdownOpen, setIsCafeDropdownOpen] = useState(false);
  const [isCafeLoading, setIsCafeLoading] = useState(false);
  const [cafeSearchQuery, setCafeSearchQuery] = useState("");
  const cafeDropdownRef = useRef<HTMLDivElement>(null);
  const cafeSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Only fetch cafes if cafe prop is null
      if (!cafe) {
        fetchCafes();
      } else {
        setSelectedCafe(cafe);
        setCafeName(cafe.name);
      }
    } else {
      // Reset form when modal closes
      setCurrentPage(1);
      setContributorName("");
      setSelectedCafe(cafe);
      setCafeName(cafe?.name || "");
      setReview("");
      setPrice(0);
      setWifi(0);
      setSeatComfort(0);
      setElectricitySocket(0);
      setFoodBeverage(0);
      setPrayingRoom(0);
      setHospitality(0);
      setToilet(0);
      setNoise(0);
      setParking(0);
      setCafeSearchQuery("");
    }
  }, [open, cafe]);

  const fetchCafes = async () => {
    setIsCafeLoading(true);
    try {
      const cafeList = await listCafesWithReviews();
      setCafes(cafeList);
      setFilteredCafes(cafeList);
    } catch (error) {
      console.error("Error fetching cafes:", error);
      toast.error("Error loading cafe list");
    } finally {
      setIsCafeLoading(false);
    }
  };

  useEffect(() => {
    if (cafeSearchQuery.trim()) {
      const filtered = cafes.filter((cafe) =>
        cafe.name.toLowerCase().includes(cafeSearchQuery.toLowerCase())
      );
      setFilteredCafes(filtered);
    } else {
      setFilteredCafes(cafes);
    }
  }, [cafeSearchQuery, cafes]);

  useEffect(() => {
    if (isCafeDropdownOpen && cafeSearchInputRef.current) {
      cafeSearchInputRef.current.focus();
    }
  }, [isCafeDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cafeDropdownRef.current && !cafeDropdownRef.current.contains(event.target as Node)) {
        setIsCafeDropdownOpen(false);
      }
    };

    if (isCafeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCafeDropdownOpen]);

  const handleRatingFieldChange = (field: string, rating: number) => {
    switch (field) {
      case "price":
        setPrice(rating);
        break;
      case "wifi":
        setWifi(rating);
        break;
      case "seat_comfort":
        setSeatComfort(rating);
        break;
      case "electricity_socket":
        setElectricitySocket(rating);
        break;
      case "food_beverage":
        setFoodBeverage(rating);
        break;
      case "praying_room":
        setPrayingRoom(rating);
        break;
      case "hospitality":
        setHospitality(rating);
        break;
      case "toilet":
        setToilet(rating);
        break;
      case "noise":
        setNoise(rating);
        break;
      case "parking":
        setParking(rating);
        break;
    }
  };

  const renderRatingStars = (field: string, currentRating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingFieldChange(field, i)}
          className="transition-transform duration-200 hover:scale-110"
        >
          {i <= currentRating ? (
            <FilledYellowStar className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6" />
          ) : (
            <EmptyStar className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6" />
          )}
        </button>
      );
    }
    return stars;
  };

  const getRatingDescription = (field: string): string => {
    const descriptions: Record<string, string> = {
      price: "1 = Overpriced, 10 = Cheap + High quality",
      wifi: "1 = None/unusable, 10 = Fast and stable",
      seat_comfort: "1 = Painful, 10 = Super comfy",
      electricity_socket: "1 = None, 10 = Everywhere",
      food_beverage: "1 = Not worth it, 10 = Amazingly good",
      praying_room: "1 = None/unusable, 10 = Roomy and clean",
      hospitality: "1 = Karen, 10 = Friendly",
      toilet: "1 = Stay away.., 10 = Spotless",
      parking: "1 = None, 10 = Easy & Free",
      noise: "1 = Noisy, 10 = Quiet",
    };
    return descriptions[field] || "";
  };

  const renderRatingField = (
    field: string,
    label: string,
    icon: React.ReactNode,
    isRequired: boolean = false,
    currentRating: number
  ) => (
    <div className="space-y-1">
      <div>
        <Label className="flex items-center gap-1 text-sm font-medium text-[#604926]">
          {icon}
          {label}
          {isRequired && <span>*</span>}
        </Label>
        <p className="text-xs text-muted-foreground mt-1">{getRatingDescription(field)}</p>
      </div>
      <div className="flex gap-0.5 sm:gap-1 flex-wrap">
        {renderRatingStars(field, currentRating)}
      </div>
    </div>
  );

  const isPage1Valid = () => {
    return contributorName.trim() !== "" && selectedCafe !== null && review.trim() !== "";
  };

  const isPage2Valid = () => {
    return price > 0 && seatComfort > 0 && wifi > 0 && electricitySocket > 0;
  };

  const handleNext = () => {
    setCurrentPage(2);
  };

  const handlePrevious = () => {
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Use the cafe_id from the selected cafe
      const cafeId = selectedCafe?.cafe_id;
      if (!cafeId) {
        toast.error("Cafe ID not found. Please try again.");
        setLoading(false);
        return;
      }

      // Create review via API
      await createReview({
        token: token || "",
        cafe_id: cafeId,
        reviewer_name: contributorName,
        review,
        price,
        wifi,
        seat_comfort: seatComfort,
        electricity_socket: electricitySocket,
        food_beverage: foodBeverage,
        praying_room: prayingRoom,
        hospitality,
        toilet,
        noise,
        parking,
      });

      toast.success("Review added successfully!");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setCurrentPage(1);
      setContributorName("");
      setSelectedCafe(cafe);
      setCafeName(cafe?.name || "");
      setReview("");
      setPrice(0);
      setWifi(0);
      setSeatComfort(0);
      setElectricitySocket(0);
      setFoodBeverage(0);
      setPrayingRoom(0);
      setHospitality(0);
      setToilet(0);
      setNoise(0);
      setParking(0);
      setCafeSearchQuery("");
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Error adding review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Review</DialogTitle>
        </DialogHeader>

        {/* Pagination Indicators */}
        <div className="flex items-center justify-center gap-2 my-2">
          <div
            className={`w-2 h-2 rounded-full ${currentPage === 1 ? "bg-[#746650]" : "bg-[#e5d8c2]"}`}
          />
          <div
            className={`w-2 h-2 rounded-full ${currentPage === 2 ? "bg-[#746650]" : "bg-[#e5d8c2]"}`}
          />
        </div>

        {currentPage === 1 ? (
          <div className="space-y-2.5">
            {/* Contributor Name */}
            <div>
              <Label htmlFor="contributor_name">Reviewer Name *</Label>
              <Input
                id="contributor_name"
                placeholder="Enter your name"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                required
              />
            </div>

            {/* Cafe Name */}
            <div>
              <Label htmlFor="cafe_name">Cafe Name *</Label>
              {cafe ? (
                // If cafe is provided via prop, show it as disabled
                <>
                  <Input
                    id="cafe_name"
                    value={cafeName}
                    disabled
                    className="bg-[#E2DACF] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#8b7a5f] mt-1">
                    This review will be added to the selected cafe
                  </p>
                </>
              ) : (
                // If cafe is not provided, show searchable dropdown
                <div className="relative" ref={cafeDropdownRef}>
                  <Input
                    id="cafe_name"
                    placeholder="Select a cafe"
                    value={selectedCafe?.name || ""}
                    onChange={(e) => {
                      // Don't allow direct typing
                    }}
                    onClick={() => setIsCafeDropdownOpen(!isCafeDropdownOpen)}
                    required
                    className="pr-10 cursor-pointer"
                    readOnly
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="#746650"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Dropdown */}
                  {isCafeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-100">
                        <Input
                          ref={cafeSearchInputRef}
                          placeholder="Search cafes..."
                          value={cafeSearchQuery}
                          onChange={(e) => setCafeSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Cafes List */}
                      <div className="max-h-40 overflow-y-auto">
                        {isCafeLoading ? (
                          <div className="p-3 text-center text-sm text-gray-500">
                            Loading cafes...
                          </div>
                        ) : filteredCafes.length === 0 ? (
                          <div className="p-3 text-center text-sm text-gray-500">
                            {cafeSearchQuery.trim()
                              ? "No cafes found matching your search"
                              : "No cafes found"}
                          </div>
                        ) : (
                          <div className="p-2">
                            {filteredCafes.map((cafeItem) => (
                              <div
                                key={cafeItem.cafe_id}
                                onClick={() => {
                                  setSelectedCafe(cafeItem);
                                  setCafeName(cafeItem.name);
                                  setIsCafeDropdownOpen(false);
                                  setCafeSearchQuery("");
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-[#746650] hover:bg-gray-100 cursor-pointer rounded transition-colors"
                              >
                                ✓ {cafeItem.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comment/Review */}
            <div>
              <Label htmlFor="review">Comment/Review *</Label>
              <Textarea
                id="review"
                placeholder="How was the cafe?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="cafe"
                onClick={handleNext}
                disabled={!isPage1Valid()}
                className="px-8"
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {renderRatingField(
                  "price",
                  "Price",
                  <Price className="w-4 h-4 text-[#746650]" />,
                  true,
                  price
                )}
                {renderRatingField(
                  "seat_comfort",
                  "Seat Comfort",
                  <Seat className="w-4 h-4 text-[#746650]" />,
                  true,
                  seatComfort
                )}
                {renderRatingField(
                  "food_beverage",
                  "Food and Beverage",
                  <Food className="w-4 h-4 text-[#746650]" />,
                  false,
                  foodBeverage
                )}
                {renderRatingField(
                  "hospitality",
                  "Hospitality",
                  <Smile className="w-4 h-4 text-[#746650]" />,
                  false,
                  hospitality
                )}
                {renderRatingField(
                  "parking",
                  "Parking",
                  <Park className="w-4 h-4 text-[#746650]" />,
                  false,
                  parking
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {renderRatingField(
                  "wifi",
                  "Wifi",
                  <Wifi className="w-4 h-4 text-[#746650]" />,
                  true,
                  wifi
                )}
                {renderRatingField(
                  "electricity_socket",
                  "Electric Socket",
                  <Electricity className="w-4 h-4 text-[#746650]" />,
                  true,
                  electricitySocket
                )}
                {renderRatingField(
                  "praying_room",
                  "Praying Room",
                  <Pray className="w-4 h-4 text-[#746650]" />,
                  false,
                  prayingRoom
                )}
                {renderRatingField(
                  "toilet",
                  "Toilet",
                  <Lighting className="w-4 h-4 text-[#746650]" />,
                  false,
                  toilet
                )}
                {renderRatingField(
                  "noise",
                  "Noise",
                  <Speaker className="w-4 h-4 text-[#746650]" />,
                  false,
                  noise
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
              <Button
                type="button"
                variant="cafe"
                onClick={handleSubmit}
                disabled={!isPage2Valid() || loading}
              >
                {loading ? "Adding..." : "Add Review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewModal;
