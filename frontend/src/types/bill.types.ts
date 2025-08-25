// Frontend-specific types for BillSense

export interface User {
  id: number;
  name: string;
  email?: string;
  created_at: Date;
}

export interface Bill {
  id: number;
  name: string;
  total_amount: number;
  tax_amount: number;
  tip_amount: number;
  image_url?: string;
  created_by: number;
  created_at: Date;
  items?: BillItem[];
  participants?: BillParticipant[];
  splits?: BillSplit[];
}

export interface BillItem {
  id: number;
  bill_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface BillParticipant {
  id: number;
  bill_id: number;
  user_id?: number;
  name: string;
}

export interface ItemAssignment {
  id: number;
  bill_item_id: number;
  participant_id: number;
  share_percentage: number;
}

export interface BillSplit {
  id: number;
  bill_id: number;
  participant_id: number;
  amount_owed: number;
  items_share: number;
  tax_share: number;
  tip_share: number;
}

// OCR and Processing Types
export interface BillScanResult {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  tip?: number;
  total: number;
  confidence: number;
}

export interface SplitCalculation {
  participantId: number;
  participantName: string;
  itemsTotal: number;
  taxShare: number;
  tipShare: number;
  finalAmount: number;
  assignedItems: string[];
}

// API Request/Response Types
export interface CreateBillRequest {
  name: string;
  total_amount: number;
  tax_amount: number;
  tip_amount: number;
  image_url?: string;
  created_by: number;
}

export interface CreateBillItemRequest {
  name: string;
  price: number;
  quantity: number;
}

export interface CreateParticipantRequest {
  user_id?: number;
  name: string;
}

export interface CreateAssignmentRequest {
  bill_item_id: number;
  participant_id: number;
  share_percentage: number;
}

export interface CalculateSplitsRequest {
  bill_id: number;
  include_tax: boolean;
  include_tip: boolean;
}

// Frontend Component Props Types
export interface BillScannerProps {
  onScanComplete: (result: BillScanResult) => void;
  onError: (error: string) => void;
}

export interface ItemDisplayProps {
  items: BillItem[];
  assignments: ItemAssignment[];
  participants: BillParticipant[];
  onItemEdit: (item: BillItem) => void;
  onAssignmentChange: (itemId: number, participantId: number, percentage: number) => void;
}

export interface ParticipantManagerProps {
  participants: BillParticipant[];
  onAddParticipant: (participant: CreateParticipantRequest) => void;
  onRemoveParticipant: (participantId: number) => void;
}

export interface SplitResultsProps {
  splits: SplitCalculation[];
  bill: Bill;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}
