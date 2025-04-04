
import { Domain } from "@/types";
import DomainCard from "@/components/DomainCard";
import { Card, CardContent } from "@/components/ui/card";
import DomainDeleteButton from "@/components/DomainDeleteButton";

interface MyDomainsTabProps {
  domains: Domain[];
  onDeleteDomain: (domain: Domain) => void;
}

const MyDomainsTab = ({ domains, onDeleteDomain }: MyDomainsTabProps) => {
  return domains.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {domains.map((domain) => (
        <div key={domain.id} className="relative">
          <DomainCard domain={domain} />
          <DomainDeleteButton domain={domain} onDelete={onDeleteDomain} />
        </div>
      ))}
    </div>
  ) : (
    <Card>
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground py-8">
          You haven't listed any domains yet. Use the "List a Domain" tab to get started.
        </p>
      </CardContent>
    </Card>
  );
};

export default MyDomainsTab;
