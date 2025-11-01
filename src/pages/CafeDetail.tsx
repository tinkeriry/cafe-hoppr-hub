import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sql } from "@/integrations/neon/client";
import { Cafe, Review } from "@/integrations/neon/types";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import AddCafeModal from "@/components/AddCafeModal";
import FilledYellowStar from "@/components/icons/FilledYellowStar";
import HalfFilledYellowStar from "@/components/icons/HalfFilledYellowStar";
import EmptyYellowStar from "@/components/icons/EmptyYellowStar";
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CafeDetail = () => {
  const { cafeId } = useParams<{ cafeId: string }>();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCafeDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch cafe details
      const cafeData = await sql`
        SELECT 
          cafe_id, name, cafe_photo, cafe_location_link,
          operational_days, opening_hour, closing_hour,
          status, created_at, updated_at
        FROM cafes
        WHERE cafe_id = ${cafeId} AND status = 'approved'
      ` as Cafe[];

      if (cafeData.length === 0) {
        toast.error("Cafe not found");
        navigate("/");
        return;
      }

      setCafe(cafeData[0]);

      // Fetch all reviews for this cafe
      const reviewsData = await sql`
        SELECT *
        FROM reviews
        WHERE cafe_id = ${cafeId}
        ORDER BY created_at DESC
      ` as Review[];

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching cafe details:', error);
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

  const calculateAvgRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.star_rating, 0);
    return sum / reviews.length;
  };

  const handleImageError = () => {
    setImageError(true);
  };

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
          <Button
            variant="cafe"
            onClick={() => setShowAddModal(true)}
            className="text-sm"
          >
            Add Cafe
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Cafe Header Info */}
          <div className="mb-6">
            <h1 className="text-3xl font-medium mb-2">{cafe.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(calculateAvgRating())}
              </div>
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
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <Button
              variant="cafe"
              onClick={() => window.open(cafe.cafe_location_link, "_blank")}
              className="rounded-full px-6 py-2"
            >
              See Location
            </Button>
          </div>

          {/* Cafe Image */}
          <div className="mb-8">
            {imageError || !cafe.cafe_photo ? (
              <div className="w-full h-[400px] bg-gradient-to-br from-[#e5d8c2] to-[#d4c4a8] flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="text-8xl mb-4">☕</div>
                  <p className="text-[#746650] font-medium text-lg">No Image</p>
                </div>
              </div>
            ) : (
              <img
                src={cafe.cafe_photo}
                alt={cafe.name}
                className="w-full h-[400px] object-cover rounded-lg"
                onError={handleImageError}
              />
            )}
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
                    className="bg-white rounded-xl p-6 shadow-md"
                  >
                    <p className="self-stretch text-base font-medium text-left text-[#604926] mb-2">
                      {review.created_by}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.star_rating)}
                      </div>
                      <span className="font-medium">{review.star_rating}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 min-h-[4rem] line-clamp-3">
                      {review.review}
                    </p>

                    {/* Review Metrics */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Price className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">{review.price}</p>
                      </div>
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Seat className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">{review.seat_comfort}</p>
                      </div>
                      <div className="flex justify-center items-center relative gap-2 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Wifi className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">{review.wifi}</p>
                      </div>
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Electricity className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">{review.electricity_socket}</p>
                      </div>
                      <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                        <Food className="w-5 h-5 relative text-[#668d61]" />
                        <p className="text-sm font-medium text-left text-[#668d61]">{review.food_beverage}</p>
                      </div>
                      {review.noise > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Speaker className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">{review.noise}</p>
                        </div>
                      )}
                      {review.praying_room > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Pray className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">{review.praying_room}</p>
                        </div>
                      )}
                      {review.hospitality > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Smile className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">{review.hospitality}</p>
                        </div>
                      )}
                      {review.toilet > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Lighting className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">{review.toilet}</p>
                        </div>
                      )}
                      {review.parking > 0 && (
                        <div className="flex justify-center items-center relative gap-1 px-3 py-1 rounded-3xl bg-[#c5dbc2]/[0.24] border border-[#668d61]">
                          <Park className="w-5 h-5 relative text-[#668d61]" />
                          <p className="text-sm font-medium text-left text-[#668d61]">{review.parking}</p>
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

      {/* Add Cafe Modal */}
      <AddCafeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          // Optionally refresh the page or navigate after adding
          fetchCafeDetails();
        }}
      />
    </div>
  );
};

export default CafeDetail;

