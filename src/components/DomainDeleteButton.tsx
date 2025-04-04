
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Domain } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DomainDeleteButtonProps {
  domain: Domain;
  onDelete: (domain: Domain) => void;
}

const DomainDeleteButton = ({ domain, onDelete }: DomainDeleteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(domain);
    setIsOpen(false);
    toast({
      title: "Domain Removed",
      description: `${domain.name} has been removed from your inventory`,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full p-0 shadow-md hover:bg-gray-100"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
        <span className="sr-only">Delete domain</span>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {domain.name} from your inventory?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Remove Domain
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DomainDeleteButton;
