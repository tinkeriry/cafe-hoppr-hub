import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sql } from "@/integrations/neon/client";
import { Cafe, Location, Review } from "@/integrations/neon/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CafeCard from "@/components/CafeCard";
import AddCafeModal from "@/components/AddCafeModal";
import EditCafeModal from "@/components/EditCafeModal";
import DeleteCafeModal from "@/components/DeleteCafeModal";
import AddReviewModal from "@/components/AddReviewModal";
import Footer from "@/components/Footer";
import SortIcon from "@/components/icons/SortIcon";
import SortModal from "@/components/SortModal";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [activeSort, setActiveSort] = useState<string>("");
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedCafes, setDisplayedCafes] = useState<Cafe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const cafesPerPage = 9;

  useEffect(() => {
    fetchCafes();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const locationList = (await sql`
        SELECT location_id, name, created_at, updated_at
        FROM locations
        ORDER BY name ASC
      `) as Location[];
      setLocations(locationList);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    let filtered = cafes;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (cafe) =>
          cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cafe.reviews?.some((review) =>
            review.review.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter((cafe) => cafe.location_id === selectedLocation);
    }

    setFilteredCafes(filtered);

    // Reset pagination when search or filter changes
    setCurrentPage(1);
  }, [searchQuery, selectedLocation, cafes]);

  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * cafesPerPage;
    const cafesToShow = filteredCafes.slice(startIndex, endIndex);
    setDisplayedCafes(cafesToShow);
  }, [filteredCafes, currentPage]);

  // Handle click outside for location filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const locationFilter = document.querySelector("[data-location-filter]");
      if (locationFilter && !locationFilter.contains(event.target as Node) && showLocationFilter) {
        setShowLocationFilter(false);
      }
    };

    if (showLocationFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLocationFilter]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 800);
  };

  const fetchCafes = async () => {
    setIsLoading(true);
    try {
      const cafesWithReviews = (await sql`
        SELECT 
          c.cafe_id,
          c.name,
          c.cafe_photo,
          c.cafe_location_link,
          c.location_id,
          l.name as location_name,
          c.operational_days,
          c.opening_hour,
          c.closing_hour,
          c.status,
          c.created_at,
          c.updated_at,
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'review_id', r.review_id,
                'cafe_id', r.cafe_id,
                'review', r.review,
                'price', r.price,
                'wifi', r.wifi,
                'seat_comfort', r.seat_comfort,
                'electricity_socket', r.electricity_socket,
                'food_beverage', r.food_beverage,
                'praying_room', r.praying_room,
                'hospitality', r.hospitality,
                'toilet', r.toilet,
                'noise', r.noise,
                'parking', r.parking,
                'created_by', r.created_by,
                'created_at', r.created_at,
                'updated_at', r.updated_at
              ) ORDER BY r.created_at DESC
            ) FILTER (WHERE r.review_id IS NOT NULL),
            '[]'::jsonb
          ) as reviews
        FROM cafes c
        LEFT JOIN reviews r ON r.cafe_id = c.cafe_id
        LEFT JOIN locations l ON c.location_id = l.location_id
        WHERE c.status = 'approved' 
        GROUP BY c.cafe_id, c.name, c.cafe_photo, c.cafe_location_link, 
                 c.location_id, l.name, c.operational_days, c.opening_hour, c.closing_hour,
                 c.status, c.created_at, c.updated_at
        ORDER BY c.created_at DESC
      `) as Array<{
        cafe_id: string;
        name: string;
        cafe_photo: string;
        cafe_location_link: string;
        location_id: string | null;
        location_name: string | null;
        operational_days?: string[];
        opening_hour?: string;
        closing_hour?: string;
        status: string;
        created_at: string;
        updated_at: string;
        reviews: unknown;
      }>;

      // Map to Cafe interface - parse JSON reviews array
      const cafes = cafesWithReviews.map((row) => {
        let reviews: Cafe["reviews"] = [];
        if (row.reviews) {
          if (Array.isArray(row.reviews)) {
            reviews = row.reviews as Cafe["reviews"];
          } else if (typeof row.reviews === "string") {
            reviews = JSON.parse(row.reviews) as Cafe["reviews"];
          } else {
            reviews = row.reviews as Cafe["reviews"];
          }
        }
        return {
          ...row,
          reviews: reviews || [],
        };
      }) as Cafe[];

      setCafes(cafes);
      setFilteredCafes(cafes);
    } catch (error) {
      console.error("Error fetching cafes:", error);
      toast.error("Error loading cafes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCafe = () => {
    setShowAddModal(true);
  };

  const handleEditCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowEditModal(true);
  };

  const handleDeleteCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowDeleteModal(true);
  };

  const handleAddReview = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowReviewModal(true);
  };

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

  const handleSort = (sortType: string) => {
    const sortedCafes = [...filteredCafes];

    switch (sortType) {
      case "Sort by Highest Rating":
        sortedCafes.sort((a, b) => {
          const avgA = a.reviews?.length ? calculateAvgRating(a.reviews || []) : 0;
          const avgB = b.reviews?.length ? calculateAvgRating(b.reviews || []) : 0;
          return avgB - avgA;
        });
        break;
      case "Sort by Lowest Rating":
        sortedCafes.sort((a, b) => {
          const avgA = a.reviews?.length ? calculateAvgRating(a.reviews || []) : 0;
          const avgB = b.reviews?.length ? calculateAvgRating(b.reviews || []) : 0;
          return avgA - avgB;
        });
        break;
      case "Sort by A-Z":
        sortedCafes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Sort by Z-A":
        sortedCafes.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredCafes(sortedCafes);
    setActiveSort(sortType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-[inset_0_-8px_8px_rgba(248,246,244,0.8)] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button variant="cafe" onClick={handleAddCafe} className="text-sm">
            Add Cafe
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 relative mt-16">
            {/* Floating Emojis */}
            <div className="absolute inset-4 pointer-events-none hidden xl:block">
              <span
                className="absolute -top-5 left-36 text-6xl animate-bounce"
                style={{ animationDelay: "0s", animationDuration: "3s" }}
              >
                ☘️
              </span>
              <span
                className="absolute -top-4 right-36 text-6xl animate-bounce"
                style={{ animationDelay: "1s", animationDuration: "3.5s" }}
              >
                🧑‍💻
              </span>
              <span
                className="absolute -bottom-1 left-16 text-6xl animate-bounce"
                style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
              >
                ☕
              </span>
              <span
                className="absolute -bottom-2 right-16 text-6xl animate-bounce"
                style={{ animationDelay: "1.5s", animationDuration: "2.8s" }}
              >
                🥐
              </span>
            </div>

            <h1 className="font-pixel text-5xl md:text-6xl mb-4 text-foreground relative z-10">
              Cafe Hoppr
            </h1>
            <p className="text-muted-foreground mb-8 text-lg max-w-lg mx-auto">
              See our catalogue to find your WFC spot or simply "nyari angin" around Bandung
            </p>

            {/* Search */}
            <div className="flex flex-row gap-2 justify-center items-center relative max-w-xl mx-auto">
              <div
                className={`flex justify-start items-center relative gap-2 px-4 py-1 rounded-full border-2 bg-white w-full transition-all duration-300 ease-in-out ${isSearchFocused ? "border-[#668D61]" : "border-[#e5d8c2]"}`}
              >
                <Input
                  type="search"
                  placeholder="Where will you land today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto !text-lg flex-1 bg-transparent"
                />

                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                </div>

                {/* No Cafe Message when search is focused */}
                {isSearchFocused && cafes.length === 0 && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-0.5">
                    <div className="flex justify-start px-4 py-2 rounded-md border border-[#e5d8c2] bg-white w-full">
                      <p className="text-[#604926] text-lg w-full text-left font-medium">
                        Gasp! There's no cafe yet 😱
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center cursor-pointer relative gap-2 p-3 rounded-full border-2 border-[#746650]"
                  data-location-filter
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLocationFilter(!showLocationFilter);
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#746650]"
                  >
                    <path
                      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {showLocationFilter && (
                    <div className="absolute top-full right-0 mt-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div
                        className="flex flex-col justify-start items-end relative rounded-2xl bg-white min-w-[200px]"
                        style={{ boxShadow: "0px 8px 16px 0 rgba(88,60,49,0.2)" }}
                      >
                        <div
                          className="w-full text-base font-medium text-left text-[#604926] cursor-pointer hover:text-[#746650] hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-between"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLocation("");
                            setShowLocationFilter(false);
                          }}
                        >
                          <span>All Locations</span>
                          {!selectedLocation && <span className="text-green-600 text-base">✓</span>}
                        </div>
                        {locations.map((location) => (
                          <div
                            key={location.location_id}
                            className="w-full text-base font-medium text-left text-[#604926] cursor-pointer hover:text-[#746650] hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-between"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocation(location.location_id);
                              setShowLocationFilter(false);
                            }}
                          >
                            <span>{location.name}</span>
                            {selectedLocation === location.location_id && (
                              <span className="text-green-600 text-base">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="flex items-center cursor-pointer relative gap-2 p-3 rounded-full border-2 border-[#746650]"
                  data-sort-icon
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortModal(!showSortModal);
                  }}
                >
                  <SortIcon className="w-6 h-6 text-[#746650]" />
                  <SortModal
                    isOpen={showSortModal}
                    onClose={() => setShowSortModal(false)}
                    onSort={handleSort}
                    activeSort={activeSort}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cafe Cards */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="flex justify-center items-center gap-4 mb-4 text-6xl">
                <span className="animate-spin">☕</span>
              </div>
              <p className="text-xl text-muted-foreground mb-8">Loading cafes...</p>
            </div>
          ) : filteredCafes.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex justify-center items-center gap-4 mb-4 text-6xl">
                <span>🏍️</span>
                <span>💨</span>
              </div>
              <p className="text-xl text-muted-foreground mb-8">
                Whoops! Nothing here yet. Try add some!
              </p>
              <Button variant="cafe" onClick={handleAddCafe}>
                Add Cafe
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCafes.map((cafe) => (
                  <CafeCard
                    key={cafe.cafe_id}
                    cafe={cafe}
                    onEdit={() => handleEditCafe(cafe)}
                    onDelete={() => handleDeleteCafe(cafe)}
                    onAddReview={() => handleAddReview(cafe)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {displayedCafes.length < filteredCafes.length && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="cafe"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-8 py-3"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Loading...
                      </div>
                    ) : (
                      `Load More (${filteredCafes.length - displayedCafes.length} remaining)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AddCafeModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={fetchCafes} />

      <EditCafeModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        cafe={selectedCafe}
        onSuccess={fetchCafes}
      />

      <DeleteCafeModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        cafeId={selectedCafe?.cafe_id || null}
        cafeName={selectedCafe?.name || ""}
        onSuccess={fetchCafes}
      />

      <AddReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        cafe={selectedCafe}
        onSuccess={fetchCafes}
      />
    </div>
  );
};

export default Index;
