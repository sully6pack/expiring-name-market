
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "@/services/adminService";

const StatisticsTab = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  if (isLoading) {
    return <p className="text-center">Loading statistics...</p>;
  }

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Domains</p>
              <h3 className="text-3xl font-bold">{stats?.totalDomains || 0}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-3xl font-bold">{stats?.totalUsers || 0}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Completed Sales</p>
              <h3 className="text-3xl font-bold">{stats?.recentPurchases || 0}</h3>
            </CardContent>
          </Card>
          {stats?.revenue && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-3xl font-bold">${stats.revenue.toFixed(2)}</h3>
              </CardContent>
            </Card>
          )}
          {stats?.pendingVerifications !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Pending Verifications</p>
                <h3 className="text-3xl font-bold">{stats.pendingVerifications}</h3>
              </CardContent>
            </Card>
          )}
          {stats?.activeSellers !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Active Sellers</p>
                <h3 className="text-3xl font-bold">{stats.activeSellers}</h3>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsTab;
