
import { Domain } from "@/types";
import { sendEmail } from "./emailService";
import { getCurrentUser } from "./authService";

export interface TransferDetails {
  domainId: string;
  domainName: string;
  sellerId: string;
  buyerId: string;
  price: number;
  transferStatus: TransferStatus;
  transferCode?: string;
  createdAt: Date;
  completedAt?: Date;
}

export enum TransferStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed"
}

// In production, this would be stored in a database
const transfersInMemory: TransferDetails[] = [];

export const initiateTransfer = async (domain: Domain): Promise<TransferDetails | null> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error("No user logged in to initiate transfer");
      return null;
    }

    // Create a transfer code - would be a secure random code in production
    const transferCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const transferDetails: TransferDetails = {
      domainId: domain.id,
      domainName: domain.name,
      sellerId: domain.sellerId,
      buyerId: currentUser.id,
      price: domain.price,
      transferStatus: TransferStatus.PENDING,
      transferCode,
      createdAt: new Date()
    };

    // In production, this would be stored in a database
    transfersInMemory.push(transferDetails);
    
    // Send email to seller and buyer
    // This would be properly implemented with templates in production
    sendEmail("DOMAIN_PURCHASE", {
      to: currentUser.email,
      templateData: {
        domainName: domain.name,
        transferCode,
        sellerName: domain.sellerName
      }
    });

    console.log(`Transfer initiated for domain ${domain.name}`);
    return transferDetails;
  } catch (error) {
    console.error("Error initiating transfer:", error);
    return null;
  }
};

export const getTransfersByBuyer = (buyerId: string): TransferDetails[] => {
  return transfersInMemory.filter(transfer => transfer.buyerId === buyerId);
};

export const getTransfersBySeller = (sellerId: string): TransferDetails[] => {
  return transfersInMemory.filter(transfer => transfer.sellerId === sellerId);
};

export const getTransferByDomainId = (domainId: string): TransferDetails | undefined => {
  return transfersInMemory.find(transfer => transfer.domainId === domainId);
};

export const updateTransferStatus = (
  domainId: string, 
  newStatus: TransferStatus
): boolean => {
  const transferIndex = transfersInMemory.findIndex(t => t.domainId === domainId);
  if (transferIndex === -1) return false;

  transfersInMemory[transferIndex].transferStatus = newStatus;
  
  if (newStatus === TransferStatus.COMPLETED) {
    transfersInMemory[transferIndex].completedAt = new Date();
  }
  
  return true;
};

// This would be a guide displayed to users for domain transfer instructions
export const getTransferInstructions = (domainName: string): string[] => {
  // These would be customized based on the domain registrar in production
  return [
    `1. Log in to your domain registrar account (where ${domainName} is registered)`,
    "2. Navigate to the domain management section",
    "3. Look for 'Transfer Domain' or 'Change Owner' option",
    "4. Unlock the domain if it's locked",
    "5. Get the auth/EPP code if required by your registrar",
    "6. Send this code to the buyer through our secure messaging system",
    "7. Help the buyer with any questions during the transfer process",
    "8. Confirm the transfer is complete in your NotRenewing.com dashboard"
  ];
};

