import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCafeForm } from '@/contexts/CafeFormContext';
import Clock from '@/components/icons/Clock';
import EmptyStar from '@/components/icons/EmptyStar';
import FilledYellowStar from '@/components/icons/FilledYellowStar';
import DefaultFilledStar from '@/components/icons/DefaultFilledStar';
import { sql } from '@/integrations/neon/client';
import { Cafe } from '@/integrations/neon/types';
import { toast } from "sonner";

interface EditBasicInfoPageProps {
  onNext: () => void;
  cafeId: string;
}

const EditBasicInfoPage: React.FC<EditBasicInfoPageProps> = ({ onNext, cafeId }) => {
  const { formData, updateFormData } = useCafeForm();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log operational_days when formData changes
  useEffect(() => {
    console.log('EditBasicInfoPage - formData.operational_days:', formData.operational_days);
  }, [formData.operational_days]);

  // Contributor dropdown state
  const [contributors, setContributors] = useState<string[]>([]);
  const [filteredContributors, setFilteredContributors] = useState<string[]>([]);
  const [isContributorDropdownOpen, setIsContributorDropdownOpen] = useState(false);
  const [isContributorLoading, setIsContributorLoading] = useState(false);
  const [contributorSearchQuery, setContributorSearchQuery] = useState('');
  const contributorDropdownRef = useRef<HTMLDivElement>(null);
  const contributorSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCafes();
    fetchContributors();
  }, []);

  // Ensure initial rating displays at least 6 filled stars on first render
  useEffect(() => {
    if (formData.star_rating < 6) {
      updateFormData({ star_rating: 6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (contributorSearchQuery.trim()) {
      const filtered = contributors.filter(contributor => 
        contributor.toLowerCase().includes(contributorSearchQuery.toLowerCase())
      );
      setFilteredContributors(filtered);
    } else {
      setFilteredContributors(contributors);
    }
  }, [contributorSearchQuery, contributors]);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isContributorDropdownOpen && contributorSearchInputRef.current) {
      contributorSearchInputRef.current.focus();
    }
  }, [isContributorDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (contributorDropdownRef.current && !contributorDropdownRef.current.contains(event.target as Node)) {
        setIsContributorDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isContributorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isContributorDropdownOpen]);

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

  const fetchContributors = async () => {
    setIsContributorLoading(true);
    try {
      const contributorList = await sql`
        SELECT DISTINCT created_by FROM reviews 
        WHERE created_by IS NOT NULL AND created_by != ''
        ORDER BY created_by ASC
      ` as { created_by: string }[];
      const contributorNames = contributorList.map(c => c.created_by);
      setContributors(contributorNames);
      setFilteredContributors(contributorNames);
    } catch (error) {
      console.error('Error fetching contributors:', error);
      toast.error("Error loading contributor list");
    } finally {
      setIsContributorLoading(false);
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

  const handleContributorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContributorSearchQuery(e.target.value);
  };

  const handleAddNewContributor = () => {
    if (!contributorSearchQuery.trim()) {
      toast.error("Please enter a contributor name");
      return;
    }

    // Check if contributor already exists
    const contributorExists = contributors.some(contributor => 
      contributor.toLowerCase() === contributorSearchQuery.toLowerCase()
    );

    if (contributorExists) {
      toast.error("This contributor already exists in the list");
      return;
    }

    updateFormData({ contributor_name: contributorSearchQuery.trim() });
    setIsContributorDropdownOpen(false);
    setContributorSearchQuery('');
    toast.success("New contributor added to form");
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

  const isValidHours = (): boolean => {
    if (!formData.opening_hour || !formData.closing_hour) return true; // Let required validation handle empty
    const opening = formData.opening_hour.split(':').map(Number);
    const closing = formData.closing_hour.split(':').map(Number);
    const openingMinutes = opening[0] * 60 + opening[1];
    const closingMinutes = closing[0] * 60 + closing[1];
    return openingMinutes < closingMinutes;
  };

  const handleRatingChange = (rating: number) => {
    // Stars 1-6 are locked (non-clickable). For 7-10, allow toggle.
    if (rating <= 6) return;
    const isSame = formData.star_rating === rating;
    const next = isSame ? Math.max(6, rating - 1) : rating;
    updateFormData({ star_rating: next });
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.cafe_photo.trim() !== '' && 
           isValidImageUrl(formData.cafe_photo) &&
           formData.cafe_location_link.trim() !== '' &&
           isValidUrl(formData.cafe_location_link) &&
           formData.review.trim() !== '' &&
           formData.star_rating >= 6 &&
           formData.operational_days.length > 0 &&
           formData.opening_hour.trim() !== '' &&
           formData.closing_hour.trim() !== '' &&
           isValidHours() &&
           formData.contributor_name.trim() !== '';
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      const isLocked = i <= 6; // first six locked
      const isFilled = i <= Math.max(6, formData.star_rating);

      if (isLocked) {
        stars.push(
          <span key={i} className="cursor-default select-none">
            <DefaultFilledStar className="w-10 h-10" />
          </span>
        );
      } else {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => handleRatingChange(i)}
            className="transition-transform duration-200 hover:scale-110"
            aria-label={`Set rating to ${i} stars`}
          >
            {isFilled ? (
              <FilledYellowStar className="w-10 h-10" />
            ) : (
              <EmptyStar className="w-10 h-10" />
            )}
          </button>
        );
      }
    }
    return stars;
  };

  const handleCafeSelect = (cafeName: string) => {
    updateFormData({ name: cafeName });
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleContributorSelect = (contributorName: string) => {
    updateFormData({ contributor_name: contributorName });
    setIsContributorDropdownOpen(false);
    setContributorSearchQuery('');
  };

  return (
    <div className="space-y-2.5">
      {/* Contributor Name */}
      <div>
        <Label htmlFor="contributor_name">Contributor Name *</Label>
        <div className="relative" ref={contributorDropdownRef}>
          <Input
            id="contributor_name"
            placeholder="Select or add contributor name"
            value={formData.contributor_name}
            onChange={(e) => updateFormData({ contributor_name: e.target.value })}
            onClick={() => setIsContributorDropdownOpen(!isContributorDropdownOpen)}
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
          {isContributorDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100">
                <Input
                  ref={contributorSearchInputRef}
                  placeholder="Search existing contributors to avoid duplicates or add unique contributor name"
                  value={contributorSearchQuery}
                  onChange={handleContributorSearchChange}
                  className="w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewContributor()}
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
                    {contributorSearchQuery.trim() ? 'No existing contributors found matching your search' : 'No existing contributors found'}
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
                          updateFormData({ contributor_name: contributor });
                          setIsContributorDropdownOpen(false);
                          setContributorSearchQuery('');
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
              {contributorSearchQuery.trim() && !contributors.some(contributor => contributor.toLowerCase() === contributorSearchQuery.toLowerCase()) && (
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
        <p className="text-xs text-[#8b7a5f] mt-1">minimum rating is 6, just to make sure you enter a great cafe for WFC :p</p>
      </div>

      {/* Operational Days */}
      <div>
        <Label>Operational Days *</Label>
        <div className="flex items-center gap-2 mt-3 w-full">
          {['M','T','W','T','F','S','S'].map((day, idx) => {
            const mapIdxToValue = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
            const value = mapIdxToValue[idx];
            const currentDays = Array.isArray(formData.operational_days) ? formData.operational_days : [];
            const selected = currentDays.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  const next = selected
                    ? currentDays.filter(d => d !== value)
                    : [...currentDays, value];
                  updateFormData({ operational_days: next });
                }}
                className={`px-6 py-2 w-full rounded-full border transition-colors duration-200 ${selected ? 'bg-[#C5DBC23D] border-1 border-[#668D61] text-[#746650]' : 'border border-[#e5d8c2] text-[#8b7a5f]'}`}
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
              className={`pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-ms-clear]:hidden ${formData.opening_hour && formData.closing_hour && !isValidHours() ? 'border-red-500' : ''}`}
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
              className={`pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden [&::-ms-clear]:hidden ${formData.opening_hour && formData.closing_hour && !isValidHours() ? 'border-red-500' : ''}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#746650]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        {formData.opening_hour && formData.closing_hour && !isValidHours() && (
          <p className="text-red-500 text-sm mt-1">
            Opening hour must be before closing hour
          </p>
        )}
      </div>

      {/* Comment/Review */}
      <div>
        <Label htmlFor="review">Comment/Review *</Label>
        <Textarea
          id="review"
          placeholder="How was the cafe?"
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

export default EditBasicInfoPage;

