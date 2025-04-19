
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Advertisement } from "@/types/advertisement";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  targetUrl: z.string().url("Must be a valid URL"),
  startDate: z.date(),
  endDate: z.date().optional(),
});

const AdvertisementManagementTab = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      targetUrl: "",
      startDate: new Date(),
    },
  });

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching advertisements",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setAds(data.map(ad => ({
        ...ad,
        startDate: new Date(ad.start_date),
        endDate: ad.end_date ? new Date(ad.end_date) : undefined,
        createdAt: new Date(ad.created_at),
      })));
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase
      .from('advertisements')
      .insert([{
        title: values.title,
        image_url: values.imageUrl,
        target_url: values.targetUrl,
        start_date: values.startDate.toISOString(),
        end_date: values.endDate?.toISOString(),
        is_active: true,
      }]);

    if (error) {
      toast({
        title: "Error creating advertisement",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Advertisement created",
      description: "The advertisement has been created successfully.",
    });
    
    form.reset();
    setIsDialogOpen(false);
    fetchAds();
  };

  const toggleAdStatus = async (ad: Advertisement) => {
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !ad.isActive })
      .eq('id', ad.id);

    if (error) {
      toast({
        title: "Error updating advertisement",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Advertisement updated",
      description: `Advertisement has been ${!ad.isActive ? 'activated' : 'deactivated'}.`,
    });

    fetchAds();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advertisements</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Advertisement</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Advertisement title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => 
                              date < form.getValues("startDate") || 
                              date < new Date()
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Create Advertisement</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell>{ad.title}</TableCell>
              <TableCell>{format(ad.startDate, "PPP")}</TableCell>
              <TableCell>{ad.endDate ? format(ad.endDate, "PPP") : "No end date"}</TableCell>
              <TableCell className="text-right">{ad.impressions.toLocaleString()}</TableCell>
              <TableCell className="text-right">{ad.clicks.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                {ad.impressions > 0
                  ? `${((ad.clicks / ad.impressions) * 100).toFixed(2)}%`
                  : "0%"}
              </TableCell>
              <TableCell>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  ad.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                  {ad.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAdStatus(ad)}
                >
                  {ad.isActive ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdvertisementManagementTab;
