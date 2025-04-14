
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DomainCard from "@/components/DomainCard";
import { Domain } from "@/types";

interface FeaturedDomainsProps {
  domains: Domain[];
  isLoading?: boolean;
}

const FeaturedDomains = ({ domains, isLoading = false }: FeaturedDomainsProps) => {
  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Domains</h2>
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">Loading domains...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Domains</h2>
        {domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">No domains found matching your search criteria.</p>
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/domains">
            <Button variant="outline">View All Domains</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDomains;
