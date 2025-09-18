import React, { createContext, useContext } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

interface DataContextType {
  hospitals: Tables<'hospitals'>[];
  warehouses: Tables<'warehouses'>[];
  batches: Tables<'batches'>[];
  dispatches: Tables<'dispatches'>[];
  patients: Tables<'patients'>[];
  usageRecords: Tables<'usage_records'>[];
  stats: {
    totalBatches: number;
    totalDispatches: number;
    totalPatients: number;
    pendingApprovals: number;
  };
  loading: boolean;
  createBatch: (batchData: TablesInsert<'batches'>) => Promise<void>;
  dispatchBatch: (dispatchData: TablesInsert<'dispatches'>) => Promise<void>;
  confirmReceipt: (dispatchId: string, receivedBy: string) => Promise<void>;
  recordUsage: (usageData: TablesInsert<'usage_records'>) => Promise<void>;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = useSupabaseData();

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};