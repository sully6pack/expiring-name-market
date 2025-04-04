
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Domain } from "@/types";
import { formatDate, getDaysUntilExpiration } from "@/utils/validation";
import { Heart, Tag, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DomainCardProps {
  domain: Domain;
  showExpiration?: boolean;
}

const DomainCard = ({ domain, showExpiration = true }: DomainCardProps) => {
  const [likes, setLikes] = useState(domain.likes);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    if (!isLiked) {
      setLikes(likes + 1);
      setIsLiked(true);
      toast({
        title: "Domain liked",
        description: `You liked ${domain.name}`,
      });
    } else {
      setLikes(likes - 1);
      setIsLiked(false);
    }
  };

  const handleBuy = () => {
    toast({
      title: "Interest registered",
      description: "The seller has been notified of your interest in this domain",
    });
  };

  return (
    <Card className="domain-card h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl break-all">{domain.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {domain.isSponsored && (
              <Badge variant="outline" className="bg-brand-orange text-white">
                Sponsored
              </Badge>
            )}
            {domain.isAdminPick && (
              <Badge variant="outline" className="bg-brand-blue text-white">
                Staff Pick
              </Badge>
            )}
            {domain.isFeatured && (
              <Badge variant="outline" className="bg-purple-500 text-white flex items-center gap-1">
                <Award size={12} />
                Featured
              </Badge>
            )}
            {domain.tld && (
              <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                .{domain.tld}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{domain.description}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
            <Tag size={14} />
            {domain.category.charAt(0).toUpperCase() + domain.category.slice(1)}
          </Badge>
        </div>
        {showExpiration && (
          <div className="mb-4">
            <p className="text-sm">
              <span className="font-semibold">Expiration:</span>{" "}
              {formatDate(domain.expirationDate)}
            </p>
            <p className="text-sm text-amber-600 font-medium">
              {getDaysUntilExpiration(domain.expirationDate)}
            </p>
          </div>
        )}
        <p className="text-lg font-bold">${domain.price}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleLike}
          >
            <Heart
              className={isLiked ? "fill-red-500 text-red-500" : ""}
              size={18}
            />
            {likes}
          </Button>
        </div>
        <Button onClick={handleBuy}>Buy Now</Button>
      </CardFooter>
    </Card>
  );
};

export default DomainCard;
