import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface DetailsPageProps {
  onPrevious: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const DetailsPage: React.FC<DetailsPageProps> = ({ onPrevious, onSubmit, loading }) => {
  const { formData, updateFormData } = useCafeForm();

  const selectOptions = {
    rating: ["Best", "Good", "Average", "Poor"],
    availability: ["Yes", "No", "Limited"],
  };

  const isFormValid = () => {
    return formData.price !== '' && 
           formData.food_taste !== '' && 
           formData.seating !== '' &&
           formData.signal_strength !== '' &&
           formData.noise !== '' &&
           formData.electricity !== '' &&
           formData.lighting !== '' &&
           formData.mushola !== '' &&
           formData.smoking_room !== '' &&
           formData.parking !== '';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <Label htmlFor="price" className="flex items-center gap-2">
            <Price className="w-4 h-4" />
            Price
          </Label>
          <Select value={formData.price} onValueChange={(value) => updateFormData({ price: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.rating.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Food Taste */}
        <div>
          <Label htmlFor="food_taste" className="flex items-center gap-2">
            <Food className="w-4 h-4" />
            Food Taste
          </Label>
          <Select value={formData.food_taste} onValueChange={(value) => updateFormData({ food_taste: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.rating.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seating */}
        <div>
          <Label htmlFor="seating" className="flex items-center gap-2">
            <Seat className="w-4 h-4" />
            Seating
          </Label>
          <Input
            id="seating"
            placeholder="Banyak dan enakeun ga?"
            value={formData.seating}
            onChange={(e) => updateFormData({ seating: e.target.value })}
          />
        </div>

        {/* Signal Strength */}
        <div>
          <Label htmlFor="signal" className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Signal Strength
          </Label>
          <Select value={formData.signal_strength} onValueChange={(value) => updateFormData({ signal_strength: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.rating.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Noise */}
        <div>
          <Label htmlFor="noise" className="flex items-center gap-2">
            <Speaker className="w-4 h-4" />
            Noise
          </Label>
          <Select value={formData.noise} onValueChange={(value) => updateFormData({ noise: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.rating.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Electricity */}
        <div>
          <Label htmlFor="electricity" className="flex items-center gap-2">
            <Electricity className="w-4 h-4" />
            Electricity
          </Label>
          <Select value={formData.electricity} onValueChange={(value) => updateFormData({ electricity: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.rating.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lighting */}
        <div>
          <Label htmlFor="lighting" className="flex items-center gap-2">
            <Lighting className="w-4 h-4" />
            Lighting
          </Label>
          <Select value={formData.lighting} onValueChange={(value) => updateFormData({ lighting: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.rating.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mushola */}
        <div>
          <Label htmlFor="mushola" className="flex items-center gap-2">
            <Pray className="w-4 h-4" />
            Mushola
          </Label>
          <Select value={formData.mushola} onValueChange={(value) => updateFormData({ mushola: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.availability.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Smoking Room */}
        <div>
          <Label htmlFor="smoking" className="flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Smoking Room
          </Label>
          <Select value={formData.smoking_room} onValueChange={(value) => updateFormData({ smoking_room: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.availability.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Parking */}
        <div>
          <Label htmlFor="parking" className="flex items-center gap-2">
            <Park className="w-4 h-4" />
            Parking
          </Label>
          <Select value={formData.parking} onValueChange={(value) => updateFormData({ parking: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.availability.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="px-8"
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="cafe"
          onClick={onSubmit}
          disabled={!isFormValid() || loading}
          className="px-8"
        >
          {loading ? "Submitting..." : "Submit Cafe"}
        </Button>
      </div>
    </div>
  );
};

export default DetailsPage;
