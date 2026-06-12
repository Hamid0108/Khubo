import React from 'react';
import { 
  Wifi, Utensils, Wind, WashingMachine, Car, Waves, Dumbbell, Bath, Tv, 
  ArrowDownUp, Fence, Briefcase, Refrigerator, Microwave, Cctv, BookOpen, 
  ShieldCheck, Zap, Droplet, Sofa, BedDouble, Bed, PawPrint
} from 'lucide-react';

export const AMENITY_ICONS: Record<string, React.ComponentType<any>> = {
  // Normalized options
  "Wifi": Wifi,
  "Kitchen": Utensils,
  "AC": Wind,
  "Washer": WashingMachine,
  "Free parking": Car,
  "Paid parking off premises": Car,
  "Pool": Waves,
  "Gym": Dumbbell,
  "Private bathroom": Bath,
  "TV": Tv,
  "Elevator": ArrowDownUp,
  "Private patio or balcony": Fence,
  "Luggage dropoff allowed": Briefcase,
  "Refrigerator": Refrigerator,
  "Microwave": Microwave,
  "Exterior security cameras on property": Cctv,
  "CCTV": Cctv,
  "Study area": BookOpen,
  "24/7 Security": ShieldCheck,
  "Back-up generator": Zap,
  "Water station": Droplet,
  "Lounge / Common area": Sofa,
  "Bunk beds": BedDouble,
  "Single bed": Bed,
  "Pets allowed": PawPrint,

  // Legacy/Mock data aliases for compatibility
  "Free Wifi": Wifi,
  "Aircon": Wind,
  "Security": ShieldCheck,
  "Kitchen Access": Utensils,
  "Study Area": BookOpen,
  "Garden": Fence,
  "Electricity": Zap,
  "Water": Droplet,
  "Drinking Water": Droplet,
  "Heated Shower": Bath
};

export const AMENITIES = [
  "24/7 Security",
  "AC",
  "Back-up generator",
  "Bunk beds",
  "CCTV",
  "Elevator",
  "Exterior security cameras on property",
  "Free parking",
  "Gym",
  "Kitchen",
  "Lounge / Common area",
  "Luggage dropoff allowed",
  "Microwave",
  "Paid parking off premises",
  "Pets allowed",
  "Private bathroom",
  "Private patio or balcony",
  "Pool",
  "Refrigerator",
  "Single bed",
  "Study area",
  "TV",
  "Washer",
  "Water station",
  "Wifi"
];
