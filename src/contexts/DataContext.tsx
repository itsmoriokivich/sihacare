import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Hospital, Warehouse, Batch, Dispatch, Patient, UsageRecord, DashboardStats } from '@/types';

interface DataContextType {
  hospitals: Hospital[];
  warehouses: Warehouse[];
  batches: Batch[];
  dispatches: Dispatch[];
  patients: Patient[];
  usageRecords: UsageRecord[];
  stats: DashboardStats;
  
  // Actions
  createBatch: (batch: Omit<Batch, 'id' | 'createdAt'>) => void;
  dispatchBatch: (dispatch: Omit<Dispatch, 'id' | 'dispatchedAt'>) => void;
  confirmReceipt: (dispatchId: string, receivedBy: string) => void;
  recordUsage: (usage: Omit<UsageRecord, 'id' | 'administeredAt'>) => void;
  updateBatchStatus: (batchId: string, status: Batch['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Demo data - preloaded for the demo
const DEMO_HOSPITALS: Hospital[] = [
  { id: '1', name: 'General Hospital', location: 'City Center', capacity: 500 },
  { id: '2', name: 'Children\'s Hospital', location: 'North District', capacity: 200 },
  { id: '3', name: 'Regional Medical Center', location: 'South District', capacity: 800 }
];

const DEMO_WAREHOUSES: Warehouse[] = [
  { id: '1', name: 'Central Warehouse', location: 'Industrial Zone' },
  { id: '2', name: 'North Warehouse', location: 'North District' }
];

const DEMO_PATIENTS: Patient[] = [
  { id: '1', name: 'John Smith', age: 45, hospitalId: '1', medicalRecord: 'MR001' },
  { id: '2', name: 'Maria Garcia', age: 32, hospitalId: '1', medicalRecord: 'MR002' },
  { id: '3', name: 'Ahmed Hassan', age: 28, hospitalId: '2', medicalRecord: 'MR003' },
  { id: '4', name: 'Lisa Johnson', age: 67, hospitalId: '3', medicalRecord: 'MR004' }
];

const DEMO_BATCHES: Batch[] = [
  {
    id: '1',
    medicationName: 'Paracetamol 500mg',
    quantity: 1000,
    manufacturingDate: '2024-01-15',
    expiryDate: '2026-01-15',
    warehouseId: '1',
    status: 'created',
    qrCode: 'QR001',
    createdAt: '2024-01-15',
    createdBy: '2'
  },
  {
    id: '2',
    medicationName: 'Ibuprofen 200mg',
    quantity: 500,
    manufacturingDate: '2024-01-20',
    expiryDate: '2026-01-20',
    warehouseId: '1',
    status: 'dispatched',
    qrCode: 'QR002',
    createdAt: '2024-01-20',
    createdBy: '2'
  }
];

const DEMO_DISPATCHES: Dispatch[] = [
  {
    id: '1',
    batchId: '2',
    fromWarehouseId: '1',
    toHospitalId: '1',
    quantity: 500,
    status: 'pending',
    dispatchedAt: '2024-01-21',
    dispatchedBy: '2'
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [hospitals] = useState<Hospital[]>(DEMO_HOSPITALS);
  const [warehouses] = useState<Warehouse[]>(DEMO_WAREHOUSES);
  const [batches, setBatches] = useState<Batch[]>(DEMO_BATCHES);
  const [dispatches, setDispatches] = useState<Dispatch[]>(DEMO_DISPATCHES);
  const [patients] = useState<Patient[]>(DEMO_PATIENTS);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);

  const stats: DashboardStats = {
    totalBatches: batches.length,
    totalDispatches: dispatches.length,
    totalPatients: patients.length,
    pendingApprovals: 0 // Will be updated based on actual pending users
  };

  const createBatch = (batchData: Omit<Batch, 'id' | 'createdAt'>) => {
    const newBatch: Batch = {
      ...batchData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setBatches(prev => [...prev, newBatch]);
  };

  const dispatchBatch = (dispatchData: Omit<Dispatch, 'id' | 'dispatchedAt'>) => {
    const newDispatch: Dispatch = {
      ...dispatchData,
      id: Date.now().toString(),
      dispatchedAt: new Date().toISOString()
    };
    setDispatches(prev => [...prev, newDispatch]);
    updateBatchStatus(dispatchData.batchId, 'dispatched');
  };

  const confirmReceipt = (dispatchId: string, receivedBy: string) => {
    setDispatches(prev => prev.map(dispatch => 
      dispatch.id === dispatchId 
        ? { 
            ...dispatch, 
            status: 'received' as const, 
            receivedAt: new Date().toISOString(),
            receivedBy 
          }
        : dispatch
    ));
    
    // Update batch status
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
      updateBatchStatus(dispatch.batchId, 'received');
    }
  };

  const recordUsage = (usageData: Omit<UsageRecord, 'id' | 'administeredAt'>) => {
    const newUsage: UsageRecord = {
      ...usageData,
      id: Date.now().toString(),
      administeredAt: new Date().toISOString()
    };
    setUsageRecords(prev => [...prev, newUsage]);
    updateBatchStatus(usageData.batchId, 'administered');
  };

  const updateBatchStatus = (batchId: string, status: Batch['status']) => {
    setBatches(prev => prev.map(batch => 
      batch.id === batchId ? { ...batch, status } : batch
    ));
  };

  return (
    <DataContext.Provider value={{
      hospitals,
      warehouses,
      batches,
      dispatches,
      patients,
      usageRecords,
      stats,
      createBatch,
      dispatchBatch,
      confirmReceipt,
      recordUsage,
      updateBatchStatus
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}