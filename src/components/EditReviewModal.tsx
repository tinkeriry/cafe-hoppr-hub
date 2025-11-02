import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sql } from "@/integrations/neon/client";
import { toast } from "sonner";
import { Review } from "@/integrations/neon/types";
import { Info } from "lucide-react";
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

interface EditReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: Review | null;
  cafeName?: string;
  onSuccess: () => void;
}

const EditReviewModal = ({
  open,
  onOpenChange,
  review,
  cafeName,
  onSuccess,
}: EditReviewModalProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Page 1 fields
  const [contributorName, setContributorName] = useState("");
  const [cafeNameDisplay, setCafeNameDisplay] = useState("");
  const [reviewText, setReviewText] = useState("");

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

  // Dropdown states for contributor
  const [contributors, setContributors] = useState<string[]>([]);
  const [filteredContributors, setFilteredContributors] = useState<string[]>([]);
  const [isContributorDropdownOpen, setIsContributorDropdownOpen] = useState(false);
  const [isContributorLoading, setIsContributorLoading] = useState(false);
  const [contributorSearchQuery, setContributorSearchQuery] = useState("");
  const contributorDropdownRef = useRef<HTMLDivElement>(null);
  const contributorSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && review) {
      fetchContributors();
      // Pre-fill form with review data
      setContributorName(review.created_by || "");
      setCafeNameDisplay(cafeName || "");
      setReviewText(review.review || "");
      setPrice(review.price || 0);
      setWifi(review.wifi || 0);
      setSeatComfort(review.seat_comfort || 0);
      setElectricitySocket(review.electricity_socket || 0);
      setFoodBeverage(review.food_beverage || 0);
      setPrayingRoom(review.praying_room || 0);
      setHospitality(review.hospitality || 0);
      setToilet(review.toilet || 0);
      setNoise(review.noise || 0);
      setParking(review.parking || 0);
      setCurrentPage(1);
    } else {
      // Reset form when modal closes
      setCurrentPage(1);
      setContributorName("");
      setCafeNameDisplay("");
      setReviewText("");
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
      setContributorSearchQuery("");
    }
  }, [open, review, cafeName]);

  useEffect(() => {
    if (contributorSearchQuery.trim()) {
      const filtered = contributors.filter((contributor) =>
        contributor.toLowerCase().includes(contributorSearchQuery.toLowerCase())
      );
      setFilteredContributors(filtered);
    } else {
      setFilteredContributors(contributors);
    }
  }, [contributorSearchQuery, contributors]);

  useEffect(() => {
    if (isContributorDropdownOpen && contributorSearchInputRef.current) {
      contributorSearchInputRef.current.focus();
    }
  }, [isContributorDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contributorDropdownRef.current &&
        !contributorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsContributorDropdownOpen(false);
      }
    };

    if (isContributorDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isContributorDropdownOpen]);

  const fetchContributors = async () => {
    setIsContributorLoading(true);
    try {
      const contributorList = (await sql`
        SELECT DISTINCT created_by FROM reviews 
        WHERE created_by IS NOT NULL AND created_by != ''
        ORDER BY created_by ASC
      `) as { created_by: string }[];
      const contributorNames = contributorList.map((c) => c.created_by);
      setContributors(contributorNames);
      setFilteredContributors(contributorNames);
    } catch (error) {
      console.error("Error fetching contributors:", error);
      toast.error("Error loading contributor list");
    } finally {
      setIsContributorLoading(false);
    }
  };

  const handleAddNewContributor = () => {
    if (!contributorSearchQuery.trim()) {
      toast.error("Please enter a contributor name");
      return;
    }

    const contributorExists = contributors.some(
      (contributor) => contributor.toLowerCase() === contributorSearchQuery.toLowerCase()
    );

    if (contributorExists) {
      toast.error("This contributor already exists in the list");
      return;
    }

    setContributorName(contributorSearchQuery.trim());
    setIsContributorDropdownOpen(false);
    setContributorSearchQuery("");
    toast.success("New contributor added");
  };

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

  const getRatingTooltip = (field: string): string => {
    const tooltips: Record<string, string> = {
      price: "1 star = Expensive\n5 stars = Moderate\n10 stars = Affordable",
      seat_comfort: "1 star = Uncomfortable\n5 stars = Average\n10 stars = Very Comfortable",
      food_beverage: "1 star = Poor Quality\n5 stars = Decent\n10 stars = Excellent",
      hospitality: "1 star = Unfriendly\n5 stars = Friendly\n10 stars = Exceptional Service",
      parking: "1 star = No Parking\n5 stars = Limited Parking\n10 stars = Ample Parking",
      wifi: "1 star = No Wifi\n5 stars = Slow\n10 stars = Fast",
      electricity_socket: "1 star = No Sockets\n5 stars = Limited Sockets\n10 stars = Many Sockets",
      praying_room: "1 star = No Room\n5 stars = Basic Room\n10 stars = Well-Equipped Room",
      toilet: "1 star = No Toilet\n5 stars = Basic\n10 stars = Clean & Modern",
      noise: "1 star = Very Noisy\n5 stars = Moderate Noise\n10 stars = Quiet",
    };
    return tooltips[field] || "";
  };

  const renderRatingField = (
    field: string,
    label: string,
    icon: React.ReactNode,
    isRequired: boolean = false,
    currentRating: number
  ) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm font-medium text-[#604926]">
        {icon}
        {label}
        {isRequired && <span>*</span>}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="ml-1 text-[#746650] hover:text-[#604926] transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs whitespace-pre-line">
            <p className="text-sm">{getRatingTooltip(field)}</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <div className="flex gap-0.5 sm:gap-1 flex-wrap">
        {renderRatingStars(field, currentRating)}
      </div>
    </div>
  );

  const isPage1Valid = () => {
    return (
      contributorName.trim() !== "" && cafeNameDisplay.trim() !== "" && reviewText.trim() !== ""
    );
  };

  const isPage2Valid = () => {
    // Required fields: price, seat_comfort, wifi, electricity_socket
    return price > 0 && seatComfort > 0 && wifi > 0 && electricitySocket > 0;
  };

  const handleNext = () => {
    setCurrentPage(2);
  };

  const handlePrevious = () => {
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    if (!review?.review_id) {
      toast.error("Review ID not found. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const now = new Date().toISOString();

      // Update review
      await sql`
        UPDATE reviews SET
          review = ${reviewText},
          price = ${price},
          wifi = ${wifi},
          seat_comfort = ${seatComfort},
          electricity_socket = ${electricitySocket},
          food_beverage = ${foodBeverage},
          praying_room = ${prayingRoom},
          hospitality = ${hospitality},
          toilet = ${toilet},
          noise = ${noise},
          parking = ${parking},
          created_by = ${contributorName},
          updated_at = ${now}
        WHERE review_id = ${review.review_id}
      `;

      toast.success("Review updated successfully!");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setCurrentPage(1);
      setContributorName("");
      setCafeNameDisplay("");
      setReviewText("");
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
      setContributorSearchQuery("");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Error updating review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
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
              <Label htmlFor="contributor_name">Contributor Name *</Label>
              <div className="relative" ref={contributorDropdownRef}>
                <Input
                  id="contributor_name"
                  placeholder="Select or add contributor name"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  onClick={() => setIsContributorDropdownOpen(!isContributorDropdownOpen)}
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
                {isContributorDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                      <Input
                        ref={contributorSearchInputRef}
                        placeholder="Search existing contributors to avoid duplicates or add unique contributor name"
                        value={contributorSearchQuery}
                        onChange={(e) => setContributorSearchQuery(e.target.value)}
                        className="w-full"
                        onKeyPress={(e) => e.key === "Enter" && handleAddNewContributor()}
                      />
                    </div>

                    {/* Existing Contributors List */}
                    <div className="max-h-40 overflow-y-auto">
                      {isContributorLoading ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          Loading contributors...
                        </div>
                      ) : filteredContributors.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          {contributorSearchQuery.trim()
                            ? "No existing contributors found matching your search"
                            : "No existing contributors found"}
                        </div>
                      ) : (
                        <div className="p-2">
                          <div className="text-xs text-gray-500 px-3 py-1 font-medium">
                            Existing contributors:
                          </div>
                          {filteredContributors.map((contributor, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                setContributorName(contributor);
                                setIsContributorDropdownOpen(false);
                                setContributorSearchQuery("");
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-[#746650] hover:bg-gray-100 cursor-pointer rounded transition-colors"
                            >
                              ✓ {contributor}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add New Contributor Button */}
                    {contributorSearchQuery.trim() &&
                      !contributors.some(
                        (contributor) =>
                          contributor.toLowerCase() === contributorSearchQuery.toLowerCase()
                      ) && (
                        <div className="p-3 border-t border-gray-100">
                          <Button
                            type="button"
                            variant="cafe"
                            size="sm"
                            onClick={handleAddNewContributor}
                            className="w-full"
                          >
                            Add "{contributorSearchQuery}"
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Cafe Name */}
            <div>
              <Label htmlFor="cafe_name">Cafe Name *</Label>
              <Input
                id="cafe_name"
                value={cafeNameDisplay}
                disabled
                className="bg-[#E2DACF] cursor-not-allowed"
              />
              <p className="text-xs text-[#8b7a5f] mt-1">
                This review belongs to the selected cafe
              </p>
            </div>

            {/* Comment/Review */}
            <div>
              <Label htmlFor="review">Comment/Review *</Label>
              <Textarea
                id="review"
                placeholder="How was the cafe?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
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
                {loading ? "Updating..." : "Update Review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditReviewModal;
