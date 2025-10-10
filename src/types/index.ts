// SihaTrace System Types

export interface User {
  id: string;
  name: string;
  role: UserRole;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'super_admin' | 'admin' | 'warehouse' | 'hospital' | 'clinician' | 'unassigned';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Batch {
  id: string;
  medicationName: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  warehouseId: string;
  status: BatchStatus;
  qrCode: string;
  createdAt: string;
  createdBy: string;
}

export type BatchStatus = 'created' | 'dispatched' | 'received' | 'administered';

export interface Dispatch {
  id: string;
  batchId: string;
  fromWarehouseId: string;
  toHospitalId: string;
  quantity: number;
  status: DispatchStatus;
  dispatchedAt: string;
  receivedAt?: string;
  dispatchedBy: string;
  receivedBy?: string;
}

export type DispatchStatus = 'pending' | 'in_transit' | 'received';

export interface Patient {
  id: string;
  name: string;
  age: number;
  hospitalId: string;
  medicalRecord: string;
}

export interface UsageRecord {
  id: string;
  batchId: string;
  patientId: string;
  clinicianId: string;
  hospitalId: string;
  quantity: number;
  administeredAt: string;
  notes?: string;
}

export interface DashboardStats {
  totalBatches: number;
  totalDispatches: number;
  totalPatients: number;
  pendingApprovals: number;
}