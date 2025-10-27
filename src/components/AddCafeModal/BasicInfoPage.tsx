import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCafeForm } from '@/contexts/CafeFormContext';
import Clock from '@/components/icons/Clock';
import EmptyStar from '@/components/icons/EmptyStar';
import FilledYellowStar from '@/components/icons/FilledYellowStar';
import { sql } from '@/integrations/neon/client';
import { Cafe } from '@/integrations/neon/types';
import { toast } from "sonner";

interface BasicInfoPageProps {
  onNext: () => void
}

const BasicInfoPage: React.FC<BasicInfoPageProps> = ({ onNext }) => {
  const { formData, updateFormData } = useCafeForm();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCafes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = cafes.filter(cafe => 
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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchCafes = async () => {
    setIsLoading(true);
    try {
      const cafeList = await sql`
        SELECT DISTINCT name FROM cafes 
        WHERE status = 'approved' 
        ORDER BY name ASC
      ` as { name: string }[];
      const cafeData = cafeList.map(cafe => ({ ...cafe, cafe_id: '', cafe_photo: '', cafe_location_link: '', review: '', star_rating: 0, price: 0, wifi: 0, seat_comfort: 0, electricity_socket: 0, food_beverage: 0, praying_room: 0, hospitality: 0, toilet: 0, noise: 0, parking: 0, created_by: '', status: '', created_at: '', updated_at: '' }));
      setCafes(cafeData);
      setFilteredCafes(cafeData);
    } catch (error) {
      console.error('Error fetching cafes:', error);
      toast.error("Error loading cafe list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewCafe = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a cafe name");
      return;
    }

    // Check if cafe already exists
    const cafeExists = cafes.some(cafe => 
      cafe.name.toLowerCase() === searchQuery.toLowerCase()
    );

    if (cafeExists) {
      toast.error("This cafe already exists in the list");
      return;
    }

    updateFormData({ name: searchQuery.trim() });
    setIsDropdownOpen(false);
    setSearchQuery('');
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
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('unsplash.com') || 
           lowerUrl.includes('images.unsplash.com');
  };

  const handleRatingChange = (rating: number) => {
    updateFormData({ star_rating: rating });
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.cafe_photo.trim() !== '' && 
           isValidImageUrl(formData.cafe_photo) &&
           formData.cafe_location_link.trim() !== '' &&
           isValidUrl(formData.cafe_location_link) &&
           formData.review.trim() !== '' &&
           formData.star_rating > 0;
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingChange(i)}
          className="transition-transform duration-200 hover:scale-110"
        >
          {i <= formData.star_rating ? (
            <FilledYellowStar className="w-6 h-6" />
          ) : (
            <EmptyStar className="w-6 h-6" />
          )}
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6">
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#746650" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewCafe()}
                />
              </div>
              
              {/* Existing Cafes List (Reference Only) */}
              <div className="max-h-40 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    Loading cafes...
                  </div>
                ) : filteredCafes.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    {searchQuery.trim() ? 'No existing cafes found matching your search' : 'No existing cafes found'}
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
              {searchQuery.trim() && !cafes.some(cafe => cafe.name.toLowerCase() === searchQuery.toLowerCase()) && (
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
        <Label htmlFor="image">Cafe Image  *</Label>
        <Input
          id="image"
          placeholder="Enter image link"
          value={formData.cafe_photo}
          onChange={(e) => updateFormData({ cafe_photo: e.target.value })}
          required
          className={formData.cafe_photo.trim() !== '' && !isValidImageUrl(formData.cafe_photo) ? 'border-red-500' : ''}
        />
        {formData.cafe_photo.trim() !== '' && !isValidImageUrl(formData.cafe_photo) && (
          <p className="text-red-500 text-sm mt-1">
            Please enter a valid image URL (e.g., .jpg, .png, .gif, .webp, .svg or Unsplash link)
          </p>
        )}
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
          className={formData.cafe_location_link.trim() !== '' && !isValidUrl(formData.cafe_location_link) ? 'border-red-500' : ''}
        />
        {formData.cafe_location_link.trim() !== '' && !isValidUrl(formData.cafe_location_link) && (
          <p className="text-red-500 text-sm mt-1">
            Please enter a valid URL (e.g., https://maps.google.com/?q=Cafe+Name)
          </p>
        )}
      </div>


      {/* Rating */}
      <div>
        <Label>Rating *</Label>
        <div className="flex items-center gap-1 mt-2">
          {renderStars()}
        </div>
        {formData.star_rating > 0 && (
          <p className="text-sm text-[#746650] mt-1">
            {formData.star_rating}/10 stars
          </p>
        )}
      </div>

      {/* Comment/Review */}
      <div>
        <Label htmlFor="review">Comment/Review *</Label>
        <Textarea
          id="review"
          placeholder="Share your experience about this cafe..."
          value={formData.review}
          onChange={(e) => updateFormData({ review: e.target.value })}
          rows={4}
          required
        />
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="cafe"
          onClick={onNext}
          disabled={!isFormValid()}
          className="px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoPage;
