
import Leaderboard from "@/components/Leaderboard";
import { Domain, LeaderboardType } from "@/types";

interface LeaderboardSectionProps {
  mostLiked: Domain[];
  adminPicks: Domain[];
  sponsored: Domain[];
}

const LeaderboardSection = ({ mostLiked, adminPicks, sponsored }: LeaderboardSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Domain Leaderboards</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Leaderboard 
            title="Most Popular" 
            type={LeaderboardType.MostLiked} 
            domains={mostLiked} 
          />
          <Leaderboard 
            title="Staff Picks" 
            type={LeaderboardType.AdminPicks} 
            domains={adminPicks} 
          />
          <Leaderboard 
            title="Sponsored" 
            type={LeaderboardType.Sponsored} 
            domains={sponsored} 
          />
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
