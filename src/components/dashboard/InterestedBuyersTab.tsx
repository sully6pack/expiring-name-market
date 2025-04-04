
import { Card, CardContent } from "@/components/ui/card";
import { Domain } from "@/types";

interface InterestedBuyer {
  domainId: string;
  buyerName: string;
  email: string;
}

interface InterestedBuyersTabProps {
  buyers: InterestedBuyer[];
  domains: Domain[];
}

const InterestedBuyersTab = ({ buyers, domains }: InterestedBuyersTabProps) => {
  return buyers.length > 0 ? (
    <div className="space-y-4">
      {buyers.map((buyer, index) => {
        const domain = domains.find(d => d.id === buyer.domainId);
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <p className="font-semibold">
                    {buyer.buyerName} is interested in:
                  </p>
                  <p className="text-lg font-bold mt-1">
                    {domain?.name}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="text-sm">Contact them at:</p>
                  <p className="font-medium">{buyer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  ) : (
    <Card>
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground py-8">
          No interested buyers yet. They'll appear here when someone wants to purchase your domain.
        </p>
      </CardContent>
    </Card>
  );
};

export default InterestedBuyersTab;
