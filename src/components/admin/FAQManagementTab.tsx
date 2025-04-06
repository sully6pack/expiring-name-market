
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchFAQs, addFAQ, updateFAQ, deleteFAQ, FAQ } from "@/services/faqService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MoveUp, MoveDown, Edit, Save, X } from "lucide-react";

interface FAQFormProps {
  initialData?: FAQ;
  onSubmit: (data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const FAQForm = ({ initialData, onSubmit, onCancel }: FAQFormProps) => {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");
  const [orderNumber, setOrderNumber] = useState(initialData?.orderNumber || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      question,
      answer,
      orderNumber,
      isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          placeholder="Enter FAQ question"
        />
      </div>
      
      <div>
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          placeholder="Enter FAQ answer"
          rows={5}
        />
      </div>
      
      <div>
        <Label htmlFor="orderNumber">Display Order</Label>
        <Input
          id="orderNumber"
          type="number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(parseInt(e.target.value) || 0)}
          min={0}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save FAQ</Button>
      </div>
    </form>
  );
};

const FAQManagementTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  
  const { 
    data: faqs = [],
    isLoading,
    error 
  } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: fetchFAQs,
  });
  
  const addFAQMutation = useMutation({
    mutationFn: addFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setIsAddingFAQ(false);
    },
  });
  
  const updateFAQMutation = useMutation({
    mutationFn: updateFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setEditingFAQ(null);
    },
  });
  
  const deleteFAQMutation = useMutation({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
  
  const handleAddFAQ = (data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>) => {
    addFAQMutation.mutate(data);
  };
  
  const handleUpdateFAQ = (data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingFAQ) return;
    
    updateFAQMutation.mutate({
      ...editingFAQ,
      ...data,
    });
  };
  
  const handleDeleteFAQ = (id: string) => {
    deleteFAQMutation.mutate(id);
  };
  
  const moveUp = (index: number) => {
    if (index <= 0) return;
    
    const faq = faqs[index];
    const prevFAQ = faqs[index - 1];
    
    updateFAQMutation.mutate({
      ...faq,
      orderNumber: prevFAQ.orderNumber
    });
    
    updateFAQMutation.mutate({
      ...prevFAQ,
      orderNumber: faq.orderNumber
    });
  };
  
  const moveDown = (index: number) => {
    if (index >= faqs.length - 1) return;
    
    const faq = faqs[index];
    const nextFAQ = faqs[index + 1];
    
    updateFAQMutation.mutate({
      ...faq,
      orderNumber: nextFAQ.orderNumber
    });
    
    updateFAQMutation.mutate({
      ...nextFAQ,
      orderNumber: faq.orderNumber
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load FAQs. Please try again later.
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage FAQs</CardTitle>
        <Button 
          onClick={() => setIsAddingFAQ(true)} 
          disabled={isAddingFAQ}
          size="sm"
        >
          <Plus size={16} className="mr-1" /> Add FAQ
        </Button>
      </CardHeader>
      <CardContent>
        {isAddingFAQ && (
          <div className="border p-4 mb-6 rounded-md bg-muted/50">
            <h3 className="text-lg font-medium mb-4">Add New FAQ</h3>
            <FAQForm
              onSubmit={handleAddFAQ}
              onCancel={() => setIsAddingFAQ(false)}
            />
          </div>
        )}
        
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No FAQs have been added yet. Click "Add FAQ" to create one.
            </p>
          ) : (
            faqs.map((faq, index) => (
              <div 
                key={faq.id} 
                className={`border rounded-md p-4 ${editingFAQ?.id === faq.id ? 'bg-muted/50' : 'bg-white'}`}
              >
                {editingFAQ?.id === faq.id ? (
                  <FAQForm
                    initialData={editingFAQ}
                    onSubmit={handleUpdateFAQ}
                    onCancel={() => setEditingFAQ(null)}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {faq.question}
                          {!faq.isActive && <span className="ml-2 text-sm text-muted-foreground">(Inactive)</span>}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                        >
                          <MoveUp size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveDown(index)}
                          disabled={index === faqs.length - 1}
                        >
                          <MoveDown size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingFAQ(faq)}
                        >
                          <Edit size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this FAQ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFAQ(faq.id)} className="bg-red-500 hover:bg-red-600">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Order: {faq.orderNumber} · Created: {faq.createdAt.toLocaleDateString()} · Updated: {faq.updatedAt.toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FAQManagementTab;
