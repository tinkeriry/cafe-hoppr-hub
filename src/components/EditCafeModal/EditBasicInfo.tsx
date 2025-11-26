import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { useCafeForm } from "@/contexts/CafeFormContext";
import Clock from "@/components/icons/Clock";
import { Cafe, Location } from "@/integrations/server/types";
import { toast } from "sonner";
import { useLocations } from "@/hooks/useCafeApi";

interface EditBasicInfoProps {
  onSubmit: () => void;
  loading: boolean;
  cafeId: string;
}

const EditBasicInfo: React.FC<EditBasicInfoProps> = ({ onSubmit, loading, cafeId }) => {
  const { formData, updateFormData } = useCafeForm();
  const { data: locations = [], isLoading: isLocationsLoading } = useLocations();

  // Location dropdown state
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationSearchInputRef = useRef<HTMLInputElement>(null);

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
    if (isLocationDropdownOpen && locationSearchInputRef.current) {
      locationSearchInputRef.current.focus();
    }
  }, [isLocationDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };

    if (isLocationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLocationDropdownOpen]);

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
      (formData.cafe_photos_file.length > 0 || formData.cafe_photo.trim() !== "") &&
      formData.cafe_location_link.trim() !== "" &&
      isValidUrl(formData.cafe_location_link) &&
      formData.operational_days.length > 0 &&
      formData.opening_hour.trim() !== "" &&
      formData.closing_hour.trim() !== "" &&
      isValidHours() &&
      formData.location_id.trim() !== ""
    );
  };

  return (
    <div className="space-y-2.5">
      {/* Cafe Name */}
      <div>
        <Label htmlFor="name">Cafe Name *</Label>
        <Input
          id="name"
          placeholder="Enter cafe name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          required
        />
      </div>

      {/* Cafe Images */}
      <div>
        <FileUpload
          id="cafe_photos"
          label="Cafe Images"
          accept="image/*"
          multiple={true}
          value={formData.cafe_photos_file}
          onChange={(files) => {
            updateFormData({
              cafe_photos_file: files,
              cafe_photo: files.length > 0 ? "" : formData.cafe_photo,
            });
          }}
          required
          error={
            formData.cafe_photos_file.length === 0 && formData.cafe_photo === ""
              ? "Please upload at least one cafe image"
              : undefined
          }
        />
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
                {isLocationsLoading ? (
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
