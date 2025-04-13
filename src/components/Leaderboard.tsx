
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Domain, LeaderboardType } from "@/types";
import { Badge } from "./ui/badge";
import { Heart, Tag } from "lucide-react";

interface LeaderboardProps {
  title: string;
  type: LeaderboardType;
  domains: Domain[];
}

const Leaderboard = ({ title, type, domains }: LeaderboardProps) => {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-skyBlue text-white py-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 gap-2">
          {domains.length > 0 ? (
            domains.map((domain) => (
              <div key={domain.id} className="border-b pb-2 last:border-b-0 last:pb-0 flex flex-col">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-base break-all mr-2">{domain.name}</div>
                  <div className="text-sm font-bold">${domain.price}</div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag size={12} />
                    {domain.category}
                    {domain.tld && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs py-0 h-5">
                        .{domain.tld}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Heart size={12} className="text-red-500" />
                    {domain.likes}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No domains available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
