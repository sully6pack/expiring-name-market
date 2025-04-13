
import Leaderboard from "@/components/Leaderboard";
import { Domain, LeaderboardType } from "@/types";

interface LeaderboardSectionProps {
  mostLiked: Domain[];
  adminPicks: Domain[];
  sponsored: Domain[];
}

const LeaderboardSection = ({ mostLiked, adminPicks, sponsored }: LeaderboardSectionProps) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Domain Leaderboards</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Leaderboard 
            title="Most Popular" 
            type={LeaderboardType.MostLiked} 
            domains={mostLiked.slice(0, 10)} 
          />
          <Leaderboard 
            title="Staff Picks" 
            type={LeaderboardType.AdminPicks} 
            domains={adminPicks.slice(0, 10)} 
          />
          <Leaderboard 
            title="Sponsored" 
            type={LeaderboardType.Sponsored} 
            domains={sponsored.slice(0, 10)} 
          />
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
