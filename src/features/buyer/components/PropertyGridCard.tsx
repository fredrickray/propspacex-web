import PropertyCard from "@/components/shared/PropertyCard";

interface PropertyGridCardProps {
  id: string;
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: string;
  badge?: string;
  isFavorited?: boolean;
  isNew?: boolean;
  isPending?: boolean;
}

const PropertyGridCard = (props: PropertyGridCardProps) => {
  return (
    <PropertyCard
      {...props}
      variant="grid"
      showActions={true}
    />
  );
};

export default PropertyGridCard;
