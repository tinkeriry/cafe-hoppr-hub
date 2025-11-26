import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { Cafe, Review } from "@/integrations/server/types";
import { getCafeById } from "@/integrations/server/cafe";
import { listReviewsByCafe } from "@/integrations/server/reviews";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import AddCafeModal from "@/components/AddCafeModal";
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
import Clock from "@/components/icons/Clock";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatPhotoUrl } from "@/lib/utils";
import { ImageCarousel } from "@/components/ui/image-carousel";

const CafeDetail = () => {
  const { cafeId } = useParams<{ cafeId: string }>();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<{ [key: string]: boolean }>({});
  const [menuPositions, setMenuPositions] = useState<{
    [key: string]: { top: number; right: number };
  }>({});
  const actionMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const actionButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const fetchCafeDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch cafe details via API
      const cafeInfo = await getCafeById(cafeId!);

      if (!cafeInfo) {
        toast.error("Cafe not found");
        navigate("/");
        return;
      }

      // Parse operational_days if it's a string (PostgreSQL array format)
      let operationalDays: string[] = [];
      if (cafeInfo.operational_days) {
        if (Array.isArray(cafeInfo.operational_days)) {
          operationalDays = [...cafeInfo.operational_days];
        } else if (typeof cafeInfo.operational_days === "string") {
          try {
            const parsed = JSON.parse(cafeInfo.operational_days);
            operationalDays = Array.isArray(parsed) ? parsed : [];
          } catch {
            // PostgreSQL array format like "{MON,TUE}"
            const operationalDaysStr = cafeInfo.operational_days as string;
            const cleaned = operationalDaysStr.replace(/[{}"]/g, "");
            operationalDays = cleaned ? cleaned.split(",").map((d) => d.trim()) : [];
          }
        }
      }

      setCafe({
        ...cafeInfo,
        operational_days: operationalDays,
      });

      // Set reviews from cafe details
      if (cafeInfo.reviews) {
        setReviews(cafeInfo.reviews);
      }
    } catch (error) {
      console.error("Error fetching cafe details:", error);
      toast.error("Error loading cafe details");
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, navigate]);

  useEffect(() => {
    if (cafeId) {
      fetchCafeDetails();
    }
  }, [cafeId, fetchCafeDetails]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.1 && rating % 1 <= 0.9;

    for (let i = 1; i <= 10; i++) {
      if (i <= fullStars) {
        stars.push(<FilledYellowStar key={i} className="w-5 h-5" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<HalfFilledYellowStar key={i} className="w-5 h-5" />);
      } else {
        stars.push(<EmptyYellowStar key={i} className="w-5 h-5" />);
      }
    }

    return stars;
  };

  const calculateReviewRating = (review: Review) => {
    // Calculate average rating for a single review from all its rating fields
    const ratings: number[] = [];
    if (review.price > 0) ratings.push(review.price);
    if (review.wifi > 0) ratings.push(review.wifi);
    if (review.seat_comfort > 0) ratings.push(review.seat_comfort);
    if (review.food_beverage > 0) ratings.push(review.food_beverage);
    if (review.hospitality > 0) ratings.push(review.hospitality);
    if (review.parking > 0) ratings.push(review.parking);
    if (review.electricity_socket > 0) ratings.push(review.electricity_socket);
    if (review.praying_room > 0) ratings.push(review.praying_room);
    if (review.toilet > 0) ratings.push(review.toilet);
    if (review.noise > 0) ratings.push(review.noise);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
  };

  const calculateAvgRating = () => {
    if (reviews.length === 0) return 0;
    // Calculate average from all reviews' average ratings
    const reviewRatings = reviews.map((r) => calculateReviewRating(r)).filter((r) => r > 0);
    if (reviewRatings.length === 0) return 0;
    const sum = reviewRatings.reduce((acc, rating) => acc + rating, 0);
    return sum / reviewRatings.length;
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setShowEditReviewModal(true);
    setShowActionMenu({});
  };

  const handleActionButtonClick = (
    reviewId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    setMenuPositions((prev) => ({
      ...prev,
      [reviewId]: {
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      },
    }));

    setShowActionMenu((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(actionMenuRefs.current).forEach((reviewId) => {
        if (
          actionMenuRefs.current[reviewId] &&
          !actionMenuRefs.current[reviewId]?.contains(event.target as Node) &&
          !actionButtonRefs.current[reviewId]?.contains(event.target as Node)
        ) {
          setShowActionMenu((prev) => ({
            ...prev,
            [reviewId]: false,
          }));
        }
      });
    };

    if (Object.values(showActionMenu).some((show) => show)) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActionMenu]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4 text-6xl">
            <span className="animate-spin">☕</span>
          </div>
          <p className="text-xl text-muted-foreground">Loading cafe details...</p>
        </div>
      </div>
    );
  }

  if (!cafe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-[inset_0_-8px_8px_rgba(248,246,244,0.8)] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="text-[#746650] hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Cafe Header Info and Image - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Cafe Header Info */}
            <div className="pt-4">
              <h1 className="text-3xl font-medium mb-2">{cafe.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">{renderStars(calculateAvgRating())}</div>
                <span className="text-lg font-medium">{calculateAvgRating().toFixed(1)}</span>
                <svg
                  width={6}
                  height={6}
                  viewBox="0 0 6 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-2 h-2 mx-1"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <circle cx={3} cy={3} r={3} fill="#D9D9D9" />
                </svg>
                <span className="text-sm text-muted-foreground">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {/* Location */}
              {cafe.location?.name && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📍</span>
                  <span className="text-base font-medium text-[#604926]">{cafe.location.name}</span>
                </div>
              )}

              {/* Operational Hours */}
              {cafe.opening_hour && cafe.closing_hour && (
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#746650]" />
                  <span className="text-base text-[#746650]">
                    {cafe.opening_hour.substring(0, 5)} - {cafe.closing_hour.substring(0, 5)}
                  </span>
                </div>
              )}

              {/* Operational Days */}
              {cafe.operational_days && cafe.operational_days.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {cafe.operational_days.map((day, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-[#c5dbc2]/[0.24] border border-[#668d61] text-sm font-medium text-[#668d61]"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Link */}
              <div className="flex items-center gap-2 mt-6">
                <Button
                  variant="cafe"
                  onClick={() => window.open(cafe.cafe_location_link, "_blank")}
                  className="rounded-full px-6 py-2"
                >
                  See Location
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Column - Cafe Image Carousel */}
            <div>
              <ImageCarousel photos={cafe.photos || []} altText={cafe.name} />
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <div className="flex justify-start items-center self-stretch relative gap-2 mb-6">
              <svg
                width={32}
                height={1}
                viewBox="0 0 32 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-grow-0 flex-shrink-0"
                preserveAspectRatio="none"
              >
                <path d="M0 0.5H32" stroke="#E2DACF" />
              </svg>
              <p className="text-sm font-medium text-left text-[#a68c66]">Reviews</p>
              <svg
                width={1179}
                height={1}
                viewBox="0 0 1179 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-grow"
                preserveAspectRatio="none"
              >
                <path d="M0 0.5H1179" stroke="#E2DACF" />
              </svg>
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No reviews yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.review_id}
                    className="bg-white rounded-xl p-6 shadow-md relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-base font-medium text-left text-[#604926]">
                          {review.created_by}
                        </p>
                        {review.created_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(review.created_at), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <button
                        ref={(el) => {
                          if (el) actionButtonRefs.current[review.review_id] = el;
                        }}
                        onClick={(e) => handleActionButtonClick(review.review_id, e)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors relative z-10"
                        aria-label="Review actions"
                      >
                        <ThreeDots />
                      </button>
                      {/* {showActionMenu[review.review_id] &&
                        menuPositions[review.review_id] &&
                        createPortal(
                          <div
                            ref={(el) => {
                              if (el) actionMenuRefs.current[review.review_id] = el;
                            }}
                            className="fixed z-50 animate-in slide-in-from-top-2 duration-200"
                            style={{
                              top: `${menuPositions[review.review_id].top}px`,
                              right: `${menuPositions[review.review_id].right}px`,
                            }}
                          >
                            <div
                              className="flex flex-col justify-start items-end relative rounded-2xl bg-white"
                              style={{ boxShadow: "0px 8px 16px 0 rgba(88,60,49,0.2)" }}
                            >
                              <div
                                className="w-52 text-base font-medium text-left text-[#604926] cursor-pointer hover:text-[#746650] hover:bg-gray-50 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out"
                                onClick={() => handleEditReview(review)}
                              >
                                Edit Review
                              </div>
                            </div>
                          </div>,
                          document.body
                        )} */}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(calculateReviewRating(review))}
                      </div>
                      <span className="font-medium">
                        {calculateReviewRating(review).toFixed(1)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 min-h-[4rem] line-clamp-3">
                      {review.review}
                    </p>

                    {/* Review Metrics */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Price className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">
                          {review.price}
                        </p>
                      </div>
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Seat className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">
                          {review.seat_comfort}
                        </p>
                      </div>
                      <div className="flex justify-center items-center relative gap-2 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Wifi className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">
                          {review.wifi}
                        </p>
                      </div>
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Electricity className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">
                          {review.electricity_socket}
                        </p>
                      </div>
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Food className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">
                          {review.food_beverage}
                        </p>
                      </div>
                      {review.noise > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Speaker className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">
                            {review.noise}
                          </p>
                        </div>
                      )}
                      {review.praying_room > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Pray className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">
                            {review.praying_room}
                          </p>
                        </div>
                      )}
                      {review.hospitality > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Smile className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">
                            {review.hospitality}
                          </p>
                        </div>
                      )}
                      {review.toilet > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Lighting className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">
                            {review.toilet}
                          </p>
                        </div>
                      )}
                      {review.parking > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Park className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">
                            {review.parking}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CafeDetail;
