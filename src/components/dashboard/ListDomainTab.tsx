
import { useState } from "react";
import { format, addDays } from "date-fns";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DomainCategory } from "@/types";

interface ListDomainTabProps {
  onSubmit: (domainData: {
    domainName: string;
    description: string;
    expirationDate: Date | undefined;
    category: DomainCategory;
  }) => void;
  isSubmitting: boolean;
}

const ListDomainTab = ({ onSubmit, isSubmitting }: ListDomainTabProps) => {
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(addDays(new Date(), 14));
  const [category, setCategory] = useState<DomainCategory>(DomainCategory.Business);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      domainName,
      description,
      expirationDate,
      category,
    });
    
    // Reset form after submission
    setDomainName("");
    setDescription("");
    setExpirationDate(addDays(new Date(), 14));
    setCategory(DomainCategory.Business);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>List Your Domain</CardTitle>
        <CardDescription>
          Enter details about the domain you're not planning to renew
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="domain-name">Domain Name</Label>
            <Input
              id="domain-name"
              placeholder="example.com"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Include the full domain name with TLD (e.g., .com, .org, .io)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as DomainCategory)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DomainCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select the most appropriate category for your domain
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiration-date">Expiration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expirationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, "PPP") : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              Domain must be expiring within 90 days
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your domain (industry, potential uses, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              All domains are listed at our fixed price of $99
            </p>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "List Domain for Sale"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ListDomainTab;
