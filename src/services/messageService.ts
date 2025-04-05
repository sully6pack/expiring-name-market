
import { getCurrentUser } from "./authService";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  domainId?: string;
  domainName?: string;
  lastMessageAt: Date;
  isTransferConversation: boolean;
}

// In production, these would be stored in a database
const conversationsInMemory: Conversation[] = [];
const messagesInMemory: Message[] = [];

export const createConversation = (
  participantIds: string[],
  domainId?: string,
  domainName?: string
): Conversation | null => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error("No user logged in to create conversation");
      return null;
    }

    // Make sure current user is part of the conversation
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }

    const conversation: Conversation = {
      id: `conv_${Math.random().toString(36).substring(2, 10)}`,
      participants: participantIds,
      domainId,
      domainName,
      lastMessageAt: new Date(),
      isTransferConversation: !!domainId
    };

    conversationsInMemory.push(conversation);
    return conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
};

export const sendMessage = (
  conversationId: string,
  recipientId: string,
  content: string
): Message | null => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error("No user logged in to send message");
      return null;
    }

    const conversation = conversationsInMemory.find(c => c.id === conversationId);
    if (!conversation) {
      console.error(`Conversation ${conversationId} not found`);
      return null;
    }

    const message: Message = {
      id: `msg_${Math.random().toString(36).substring(2, 10)}`,
      conversationId,
      senderId: currentUser.id,
      recipientId,
      content,
      isRead: false,
      createdAt: new Date()
    };

    messagesInMemory.push(message);
    
    // Update conversation last message time
    const convIndex = conversationsInMemory.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      conversationsInMemory[convIndex].lastMessageAt = new Date();
    }

    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

export const getConversationsForUser = (userId: string): Conversation[] => {
  return conversationsInMemory.filter(c => c.participants.includes(userId));
};

export const getMessagesForConversation = (conversationId: string): Message[] => {
  return messagesInMemory
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

export const markMessagesAsRead = (conversationId: string): number => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error("No user logged in to mark messages as read");
    return 0;
  }

  let count = 0;
  messagesInMemory.forEach((message, index) => {
    if (message.conversationId === conversationId && 
        message.recipientId === currentUser.id && 
        !message.isRead) {
      messagesInMemory[index].isRead = true;
      count++;
    }
  });

  return count;
};

