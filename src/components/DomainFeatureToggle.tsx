
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { Domain } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DomainFeatureToggleProps {
  domain: Domain;
  onToggleFeature: (domain: Domain) => void;
}

const DomainFeatureToggle = ({ domain, onToggleFeature }: DomainFeatureToggleProps) => {
  const { toast } = useToast();

  const handleToggleFeature = () => {
    onToggleFeature(domain);
    
    toast({
      title: domain.isFeatured ? "Domain unfeatured" : "Domain featured",
      description: domain.isFeatured 
        ? `${domain.name} is no longer featured` 
        : `${domain.name} is now featured`,
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 rounded-full p-0 shadow-md ${
              domain.isFeatured 
                ? "bg-purple-500 hover:bg-purple-600" 
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={handleToggleFeature}
          >
            <Award className={`h-4 w-4 ${domain.isFeatured ? "text-white" : "text-gray-400"}`} />
            <span className="sr-only">{domain.isFeatured ? "Unfeature domain" : "Feature domain"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{domain.isFeatured ? "Unfeature domain" : "Feature domain"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DomainFeatureToggle;
