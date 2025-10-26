import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCafeForm } from '@/contexts/CafeFormContext';
import Clock from '@/components/icons/Clock';
import EmptyStar from '@/components/icons/EmptyStar';
import FilledYellowStar from '@/components/icons/FilledYellowStar';

interface BasicInfoPageProps {
  onNext: () => void;
}

const BasicInfoPage: React.FC<BasicInfoPageProps> = ({ onNext }) => {
  const { formData, updateFormData } = useCafeForm();

  const handleRatingChange = (rating: number) => {
    updateFormData({ star_rating: rating });
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.cafe_photo.trim() !== '' && 
           formData.cafe_location_link.trim() !== '' &&
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
        <Label htmlFor="name">Cafe Name*</Label>
        <div className="relative">
          <Input
            id="name"
            placeholder="Enter cafe name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            required
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#746650" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Cafe Image */}
      <div>
        <Label htmlFor="image">Cafe Image*</Label>
        <Input
          id="image"
          placeholder="Enter image link"
          value={formData.cafe_photo}
          onChange={(e) => updateFormData({ cafe_photo: e.target.value })}
          required
        />
      </div>

      {/* Cafe Location Link */}
      <div>
        <Label htmlFor="location">Cafe Location Link*</Label>
        <Input
          id="location"
          placeholder="Enter cafe Google Maps or Apple Map link"
          value={formData.cafe_location_link}
          onChange={(e) => updateFormData({ cafe_location_link: e.target.value })}
          required
        />
      </div>


      {/* Rating */}
      <div>
        <Label>Rating*</Label>
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
        <Label htmlFor="review">Comment/Review*</Label>
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
