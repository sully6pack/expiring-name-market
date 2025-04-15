
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Domain } from "@/types";
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
import { toast } from "sonner";

interface DomainDeleteButtonProps {
  domain: Domain;
  onDelete: (domain: Domain) => void;
}

const DomainDeleteButton = ({ domain, onDelete }: DomainDeleteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onDelete(domain);
    setIsOpen(false);
    toast.success(`${domain.name} has been removed from your inventory`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="bg-white hover:bg-gray-100 text-red-500 border-red-200 w-full"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete
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
