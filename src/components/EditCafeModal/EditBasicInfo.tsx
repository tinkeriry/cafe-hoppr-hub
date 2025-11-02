import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCafeForm } from "@/contexts/CafeFormContext";
import Clock from "@/components/icons/Clock";
import { sql } from "@/integrations/neon/client";
import { Cafe, Location } from "@/integrations/neon/types";
import { toast } from "sonner";

interface EditBasicInfoProps {
  onSubmit: () => void;
  loading: boolean;
  cafeId: string;
}

const EditBasicInfo: React.FC<EditBasicInfoProps> = ({ onSubmit, loading, cafeId }) => {
  const { formData, updateFormData } = useCafeForm();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Location dropdown state
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCafes();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = cafes.filter((cafe) =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCafes(filtered);
    } else {
      setFilteredCafes(cafes);
    }
  }, [searchQuery, cafes]);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isLocationDropdownOpen && locationSearchInputRef.current) {
      locationSearchInputRef.current.focus();
    }
  }, [isLocationDropdownOpen]);

  useEffect(() => {
    if (locationSearchQuery.trim()) {
      const filtered = locations.filter((location) =>
        location.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [locationSearchQuery, locations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isLocationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isLocationDropdownOpen]);

  const fetchCafes = async () => {
    setIsLoading(true);
    try {
      const cafeList = (await sql`
        SELECT DISTINCT name FROM cafes 
        WHERE status = 'approved' 
        ORDER BY name ASC
      `) as { name: string }[];
      const cafeData = cafeList.map((cafe) => ({
        ...cafe,
        cafe_id: "",
        cafe_photo: "",
        cafe_location_link: "",
        review: "",
        price: 0,
        wifi: 0,
        seat_comfort: 0,
        electricity_socket: 0,
        food_beverage: 0,
        praying_room: 0,
        hospitality: 0,
        toilet: 0,
        noise: 0,
        parking: 0,
        created_by: "",
        status: "",
        created_at: "",
        updated_at: "",
      }));
      setCafes(cafeData);
      setFilteredCafes(cafeData);
    } catch (error) {
      console.error("Error fetching cafes:", error);
      toast.error("Error loading cafe list");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    setIsLocationLoading(true);
    try {
      const locationList = (await sql`
        SELECT location_id, name, created_at, updated_at
        FROM locations
        ORDER BY name ASC
      `) as Location[];
      setLocations(locationList);
      setFilteredLocations(locationList);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Error loading location list");
    } finally {
      setIsLocationLoading(false);
    }
  };

  const handleAddNewCafe = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a cafe name");
      return;
    }

    // Check if cafe already exists
    const cafeExists = cafes.some((cafe) => cafe.name.toLowerCase() === searchQuery.toLowerCase());

    if (cafeExists) {
      toast.error("This cafe already exists in the list");
      return;
    }

    updateFormData({ name: searchQuery.trim() });
    setIsDropdownOpen(false);
    setSearchQuery("");
    toast.success("New cafe added to form");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!isValidUrl(url)) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const lowerUrl = url.toLowerCase();
    return (
      imageExtensions.some((ext) => lowerUrl.includes(ext)) ||
      lowerUrl.includes("unsplash.com") ||
      lowerUrl.includes("images.unsplash.com")
    );
  };

  const isValidHours = (): boolean => {
    if (!formData.opening_hour || !formData.closing_hour) return true; // Let required validation handle empty
    const opening = formData.opening_hour.split(":").map(Number);
    const closing = formData.closing_hour.split(":").map(Number);
    const openingMinutes = opening[0] * 60 + opening[1];
    const closingMinutes = closing[0] * 60 + closing[1];
    return openingMinutes < closingMinutes;
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.cafe_photo.trim() !== "" &&
      isValidImageUrl(formData.cafe_photo) &&
      formData.cafe_location_link.trim() !== "" &&
      isValidUrl(formData.cafe_location_link) &&
      formData.operational_days.length > 0 &&
      formData.opening_hour.trim() !== "" &&
      formData.closing_hour.trim() !== "" &&
      isValidHours() &&
      formData.location_id.trim() !== ""
    );
  };

  const handleCafeSelect = (cafeName: string) => {
    updateFormData({ name: cafeName });
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-2.5">
      {/* Cafe Name */}
      <div>
        <Label htmlFor="name">Cafe Name *</Label>
        <div className="relative" ref={dropdownRef}>
          <Input
            id="name"
            placeholder="Select or add cafe name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100">
                <Input
                  ref={searchInputRef}
                  placeholder="Search existing cafes to avoid duplicates or add unique cafe name"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full"
                  onKeyPress={(e) => e.key === "Enter" && handleAddNewCafe()}
                />
              </div>

              {/* Existing Cafes List (Reference Only) */}
              <div className="max-h-40 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-center text-sm text-gray-500">Loading cafes...</div>
                ) : filteredCafes.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    {searchQuery.trim()
                      ? "No existing cafes found matching your search"
                      : "No existing cafes found"}
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-3 py-1 font-medium">
                      Existing cafes (for reference only):
                    </div>
                    {filteredCafes.map((cafe, index) => (
                      <div
                        key={index}
                        className="w-full px-3 py-2 text-left text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                      >
                        ❌ {cafe.name} (already exists)
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Cafe Button */}
              {searchQuery.trim() &&
                !cafes.some((cafe) => cafe.name.toLowerCase() === searchQuery.toLowerCase()) && (
                  <div className="p-3 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="cafe"
                      size="sm"
                      onClick={handleAddNewCafe}
                      className="w-full"
                    >
                      Add "{searchQuery}"
                    </Button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Cafe Image */}
      <div>
        <Label htmlFor="image">Cafe Image *</Label>
        <Input
          id="image"
          placeholder="Enter image link"
          value={formData.cafe_photo}
          onChange={(e) => updateFormData({ cafe_photo: e.target.value })}
          required
          className={
            formData.cafe_photo.trim() !== "" && !isValidImageUrl(formData.cafe_photo)
              ? "border-red-500"
              : ""
          }
        />
        {formData.cafe_photo.trim() !== "" && !isValidImageUrl(formData.cafe_photo) && (
          <p className="text-red-500 text-sm mt-1">
            Please enter a valid image URL (e.g., .jpg, .png, .gif, .webp, .svg or Unsplash link)
          </p>
        )}
      </div>

      {/* Cafe Location Area */}
      <div>
        <Label htmlFor="location_area">Cafe Location Area *</Label>
        <div className="relative" ref={locationDropdownRef}>
          <Input
            id="location_area"
            placeholder="Select location area"
            value={locations.find((loc) => loc.location_id === formData.location_id)?.name || ""}
            onChange={(e) => {
              // Don't allow direct typing
            }}
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
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
          {isLocationDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100">
                <Input
                  ref={locationSearchInputRef}
                  placeholder="Search location..."
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Locations List */}
              <div className="max-h-40 overflow-y-auto">
                {isLocationLoading ? (
                  <div className="p-3 text-center text-sm text-gray-500">Loading locations...</div>
                ) : filteredLocations.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    {locationSearchQuery.trim()
                      ? "No locations found matching your search"
                      : "No locations found"}
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredLocations.map((location) => (
                      <div
                        key={location.location_id}
                        onClick={() => {
                          updateFormData({ location_id: location.location_id });
                          setIsLocationDropdownOpen(false);
                          setLocationSearchQuery("");
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer rounded transition-colors ${
                          formData.location_id === location.location_id
                            ? "bg-gray-100 text-[#746650] font-medium"
                            : "text-[#746650]"
                        }`}
                      >
                        {formData.location_id === location.location_id ? "✓ " : ""}
                        {location.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cafe Location Link */}
      <div>
        <Label htmlFor="location">Cafe Location Link *</Label>
        <Input
          id="location"
          placeholder="Enter cafe Google Maps or Apple Map link"
          value={formData.cafe_location_link}
          onChange={(e) => updateFormData({ cafe_location_link: e.target.value })}
          required
          className={
            formData.cafe_location_link.trim() !== "" && !isValidUrl(formData.cafe_location_link)
              ? "border-red-500"
              : ""
          }
        />
        {formData.cafe_location_link.trim() !== "" && !isValidUrl(formData.cafe_location_link) && (
          <p className="text-red-500 text-sm mt-1">
            Please enter a valid URL (e.g., https://maps.google.com/?q=Cafe+Name)
          </p>
        )}
      </div>

      {/* Operational Days */}
      <div>
        <Label>Operational Days *</Label>
        <div className="flex flex-wrap items-center gap-2 mt-3 w-full">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
            const mapIdxToValue = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
            const value = mapIdxToValue[idx];
            const currentDays = Array.isArray(formData.operational_days)
              ? formData.operational_days
              : [];
            const selected = currentDays.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  const next = selected
                    ? currentDays.filter((d) => d !== value)
                    : [...currentDays, value];
                  updateFormData({ operational_days: next });
                }}
                className={`px-4 sm:px-6 py-2 flex-1 min-w-[2.5rem] sm:w-full rounded-full border transition-colors duration-200 ${selected ? "bg-[#C5DBC23D] border-1 border-[#668D61] text-[#746650]" : "border border-[#e5d8c2] text-[#8b7a5f]"}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operational Hours */}
      <div>
        <Label>Operational Hours *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 items-center">
          <div className="relative">
            <Input
              type="time"
              placeholder="Enter opening hour"
              value={formData.opening_hour}
              onChange={(e) => updateFormData({ opening_hour: e.target.value })}
              className={`pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-ms-clear]:hidden ${formData.opening_hour && formData.closing_hour && !isValidHours() ? "border-red-500" : ""}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#746650]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="relative">
            <Input
              type="time"
              placeholder="Enter closing hour"
              value={formData.closing_hour}
              onChange={(e) => updateFormData({ closing_hour: e.target.value })}
              className={`pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-ms-clear]:hidden ${formData.opening_hour && formData.closing_hour && !isValidHours() ? "border-red-500" : ""}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#746650]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        {formData.opening_hour && formData.closing_hour && !isValidHours() && (
          <p className="text-red-500 text-sm mt-1">Opening hour must be before closing hour</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="cafe"
          onClick={onSubmit}
          disabled={!isFormValid() || loading}
          className="px-8"
        >
          {loading ? "Updating..." : "Update Cafe"}
        </Button>
      </div>
    </div>
  );
};

export default EditBasicInfo;
