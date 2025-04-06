
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Domain, LeaderboardType } from "@/types";
import DomainCard from "./DomainCard";

interface LeaderboardProps {
  title: string;
  type: LeaderboardType;
  domains: Domain[];
}

const Leaderboard = ({ title, type, domains }: LeaderboardProps) => {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-skyBlue text-white">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {domains.length > 0 ? (
            domains.map((domain) => (
              <div key={domain.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                <DomainCard domain={domain} showExpiration={false} />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No domains available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
