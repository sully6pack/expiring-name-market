
import { Domain } from "@/types";
import DomainCard from "@/components/DomainCard";

interface DomainsListProps {
  domains: Domain[];
  isLoading?: boolean;
}

const DomainsList = ({ domains, isLoading }: DomainsListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Loading domains...</p>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No domains found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {domains.map((domain) => (
        <DomainCard key={domain.id} domain={domain} />
      ))}
    </div>
  );
};

export default DomainsList;
