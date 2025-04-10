
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="hero-gradient text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Find Your Perfect Domain Before It Expires
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          Discover soon-to-expire domains at a fixed price of $99. No bidding, no hassle.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/domains">
            <Button size="lg" variant="white" className="hover:bg-gray-100">
              Browse Domains
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-blue">
              List Your Domain
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
