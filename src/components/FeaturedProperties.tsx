import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PropertyCard from "./shared/PropertyCard";

const FeaturedProperties = () => {
  const properties = [
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBmKXTV0IRa29c4dhKqFmYJs6hl880WgeQr1K_kjo7AJ3gcuAV3mmFPyjTegJXPEGzoCvkrUA00rW35x46m2ggoeOd87g7vfvX7I1o_-EKVJFi_sJFOu3ZssWHUR-Ot908yi_4HphfvxNjuCF0xGGzIQQnQaq-W-Vzs72WGm3V6gfunBuDs9LUiIlsJsXo47u7V_lyEnbH9PcO9JLnLqiBJbpIo0MEPOm9NSWSdHIknGKpsE-pgeus-NxaJ8WfdpkQ6nHA-BUowOQ",
      price: "$2,450,000",
      title: "Modern Highland Estate",
      location: "Beverly Hills, CA 90210",
      beds: 5,
      baths: 4,
      sqft: "4,200 sqft",
      badge: "Verified",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAd-ZO3Q_-zJB1M5f8_S9DjgAhPs-NRE_dZi2gYD1LjDfa1f3tbSZdrWJDLdPBtHQwv_tJJYIEOZLS20lthnQFvUxh4L075pqfSySmMO1TkmARaZBq1kDsUC6W8fBjO00YGTdb-D-CuhW9jiisSqZDEmFQyDqD--qEPLznEwdcxzFuoua17RJaU386IchHC2KnSolzVB7kn2Kw3v6ExXc48xvp-Goj6B-kA0Csl5KnB3sKrD4flxVgBuSjBRK1INA5Cblz6FuCAAA",
      price: "$890,000",
      title: "Sunnyvale Garden Home",
      location: "Austin, TX 78701",
      beds: 3,
      baths: 2,
      sqft: "2,100 sqft",
      badge: "New",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBlPZSgl4RnxcHJFKt_GF2B4E2UQ8fr4oqa8gBQBBPxu4roMjIz3qvBDIbo6CzZlti5VI3qw3mgMbw2R0lDODKfV3syuHPhsKXxTG_Sgwefzmc69EWvQ0mh_sKJSRDaU5Yf8TqIBysj872sOxbAmk11QMC7ZjJwV6qVMqsbzTBHYON0wEHuWDTPJ1E0KCHzmFJp-xDckr9AQgwMFxY0YibxXhohicR3H8oOBaOAl-AHngPFJ1T70iINNS8wXB4kkS-A1ElEAfoQuQ",
      price: "$1,200,000",
      title: "Skyline Penthouse",
      location: "New York, NY 10013",
      beds: 2,
      baths: 2,
      sqft: "1,800 sqft",
      badge: "Smart Contract Ready",
    },
  ];

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Featured Properties
          </h2>
          <p className="text-muted-foreground">
            Curated selections from top agents.
          </p>
        </div>
        <Link
          href="/buyer/search"
          className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property, index) => (
          <div
            key={index}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PropertyCard {...property} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProperties;
