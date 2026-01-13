
export enum TicketStatus {
  New = 'New',
  Assigned = 'Assigned',
  InProcess = 'In Process',
  PartsOrdered = 'Parts Ordered',
  Done = 'Done'
}

export enum UserRole {
  ResidentStudent = 'Resident/Student',
  Admin = 'Admin'
}

export interface Ticket {
  id: string;
  requesterName: string;
  requesterEmail: string;
  whatsappNumber?: string;
  location: string;      // Replaces building and roomNumber
  issueTypes: string[]; // Supports multiple selections from the checkbox list
  description: string;  // "What's the specific issue?"
  entryAuthorized: boolean; // Permission to enter when resident is away
  photoUrl?: string;
  status: TicketStatus;
  assignedWorker?: string;
  dateSubmitted: string;
  dateCompleted?: string;
  hebrewTranslation?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  timestamp: string;
}
