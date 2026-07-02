export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "Sedan" | "SUV" | "Coupe" | "Electric" | "Sports";
  image: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  price: number;
  estMonthly: number;
  // Extended optional properties
  images?: string[];
  spinImages?: string[];
  msrp?: number;
  driveType?: string;
  exteriorColor?: string;
  interiorColor?: string;
  vin?: string;
  stockNumber?: string;
  description?: string;
  customPremiumFeatures?: string[];
  hasAudioPackage?: boolean;
  hasDrivingAssists?: boolean;
  hasClimateControl?: boolean;
  hasSafetySuite?: boolean;
  threeDViewUrl?: string;
  evRebateAmount?: number;
  netCost?: number;
  isEvEligible?: boolean;
  location?: string;
  legalDisclaimer?: string;
  standardEquipment?: string;
}

export const CARS: Car[] = [
  {
    id: "porsche-911-carrera",
    brand: "Porsche",
    model: "911 Carrera S",
    year: 2023,
    category: "Coupe",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
    mileage: "3,100 mi",
    fuelType: "Petrol",
    transmission: "Auto",
    price: 135900,
    estMonthly: 1720,
  },
  {
    id: "audi-etron-gt",
    brand: "Audi",
    model: "RS e-tron GT",
    year: 2023,
    category: "Electric",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    mileage: "4,600 mi",
    fuelType: "Electric",
    transmission: "Auto",
    price: 114500,
    estMonthly: 1460,
  }
];
