import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCafeForm } from '@/contexts/CafeFormContext';
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
import EmptyStar from '@/components/icons/EmptyStar';
import FilledYellowStar from '@/components/icons/FilledYellowStar';

interface EditDetailsPageProps {
  onPrevious: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const EditDetailsPage: React.FC<EditDetailsPageProps> = ({ onPrevious, onSubmit, loading }) => {
  const { formData, updateFormData } = useCafeForm();

  const handleRatingChange = (field: keyof typeof formData, rating: number) => {
    updateFormData({ [field]: rating });
  };

  const isFormValid = () => {
    // Required fields: price, seat_comfort, wifi, electricity_socket
    return formData.price > 0 && 
           formData.seat_comfort > 0 && 
           formData.wifi > 0 && 
           formData.electricity_socket > 0;
  };

  const renderStars = (field: keyof typeof formData, currentRating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingChange(field, i)}
          className="transition-transform duration-200 hover:scale-110"
        >
          {i <= currentRating ? (
            <FilledYellowStar className="w-6 h-6" />
          ) : (
            <EmptyStar className="w-6 h-6" />
          )}
        </button>
      );
    }
    return stars;
  };

  const renderRatingField = (field: keyof typeof formData, label: string, icon: React.ReactNode, isRequired: boolean = false) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-1 text-sm font-medium text-[#604926]">
        {icon}
        {label}
        {isRequired && <span>*</span>}
      </Label>
      <div className="flex gap-1">
        {renderStars(field, formData[field] as number)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {renderRatingField('price', 'Price', <Price className="w-4 h-4 text-[#746650]" />, true)}
          {renderRatingField('seat_comfort', 'Seat Comfort', <Seat className="w-4 h-4 text-[#746650]" />, true)}
          {renderRatingField('food_beverage', 'Food and Beverage', <Food className="w-4 h-4 text-[#746650]" />)}
          {renderRatingField('hospitality', 'Hospitality', <Smile className="w-4 h-4 text-[#746650]" />)}
          {renderRatingField('parking', 'Parking', <Park className="w-4 h-4 text-[#746650]" />)}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {renderRatingField('wifi', 'Wifi', <Wifi className="w-4 h-4 text-[#746650]" />, true)}
          {renderRatingField('electricity_socket', 'Electric Socket', <Electricity className="w-4 h-4 text-[#746650]" />, true)}
          {renderRatingField('praying_room', 'Praying Room', <Pray className="w-4 h-4 text-[#746650]" />)}
          {renderRatingField('toilet', 'Toilet', <Lighting className="w-4 h-4 text-[#746650]" />)}
          {renderRatingField('noise', 'Noise', <Speaker className="w-4 h-4 text-[#746650]" />)}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" variant="cafe" onClick={onSubmit} disabled={!isFormValid() || loading}>
          {loading ? "Updating..." : "Update Cafe"}
        </Button>
      </div>
    </div>
  );
};

export default EditDetailsPage;

