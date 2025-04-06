
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Domain, LeaderboardType } from "@/types";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface LeaderboardProps {
  title: string;
  type: LeaderboardType;
  domains: Domain[];
}

const Leaderboard = ({ title, type, domains }: LeaderboardProps) => {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-skyBlue text-white py-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {domains.length > 0 ? (
          <Table>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id} className="hover:bg-gray-50">
                  <TableCell className="py-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-brand-blue">{domain.name}</span>
                      <span className="text-xs text-gray-500">.{domain.tld}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{domain.description.substring(0, 60)}...</div>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="font-bold">${domain.price}</div>
                    <div className="text-xs text-gray-500 mt-1">{domain.likes} likes</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">No domains available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
