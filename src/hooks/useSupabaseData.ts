import { useState, useEffect } from 'react';
import { supabase, Database } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

type Tables = Database['public']['Tables'];

export function useSupabaseData() {
  const { user, profile } = useAuth();
  const [hospitals, setHospitals] = useState<Tables['hospitals']['Row'][]>([]);
  const [warehouses, setWarehouses] = useState<Tables['warehouses']['Row'][]>([]);
  const [batches, setBatches] = useState<Tables['batches']['Row'][]>([]);
  const [dispatches, setDispatches] = useState<Tables['dispatches']['Row'][]>([]);
  const [patients, setPatients] = useState<Tables['patients']['Row'][]>([]);
  const [usageRecords, setUsageRecords] = useState<Tables['usage_records']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = async () => {
    if (!user || !profile?.is_approved) return;

    try {
      setLoading(true);
      
      // Fetch hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('*');
      
      if (hospitalsError) throw hospitalsError;
      setHospitals(hospitalsData || []);

      // Fetch warehouses
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select('*');
      
      if (warehousesError) throw warehousesError;
      setWarehouses(warehousesData || []);

      // Fetch batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (batchesError) throw batchesError;
      setBatches(batchesData || []);

      // Fetch dispatches
      const { data: dispatchesData, error: dispatchesError } = await supabase
        .from('dispatches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (dispatchesError) throw dispatchesError;
      setDispatches(dispatchesData || []);

      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*');
      
      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

      // Fetch usage records
      const { data: usageData, error: usageError } = await supabase
        .from('usage_records')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usageError) throw usageError;
      setUsageRecords(usageData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Data Error",
        description: "Failed to load data from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create batch
  const createBatch = async (batchData: Tables['batches']['Insert']) => {
    if (!user || !profile?.is_approved) return false;

    try {
      const { data, error } = await supabase
        .from('batches')
        .insert([batchData])
        .select()
        .single();

      if (error) throw error;
      
      setBatches(prev => [data, ...prev]);
      toast({
        title: "Batch Created",
        description: `Batch ${data.qr_code} created successfully`,
      });
      return true;
    } catch (error) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: "Failed to create batch",
        variant: "destructive",
      });
      return false;
    }
  };

  // Dispatch batch
  const dispatchBatch = async (dispatchData: Tables['dispatches']['Insert']) => {
    if (!user || !profile?.is_approved) return false;

    try {
      const { data, error } = await supabase
        .from('dispatches')
        .insert([dispatchData])
        .select()
        .single();

      if (error) throw error;

      // Update batch status
      await supabase
        .from('batches')
        .update({ status: 'dispatched' })
        .eq('id', dispatchData.batch_id);

      setDispatches(prev => [data, ...prev]);
      setBatches(prev => prev.map(batch => 
        batch.id === dispatchData.batch_id 
          ? { ...batch, status: 'dispatched' as const }
          : batch
      ));

      toast({
        title: "Batch Dispatched",
        description: "Batch dispatched successfully",
      });
      return true;
    } catch (error) {
      console.error('Error dispatching batch:', error);
      toast({
        title: "Error",
        description: "Failed to dispatch batch",
        variant: "destructive",
      });
      return false;
    }
  };

  // Confirm receipt
  const confirmReceipt = async (dispatchId: string, receivedBy: string) => {
    if (!user || !profile?.is_approved) return false;

    try {
      const { data, error } = await supabase
        .from('dispatches')
        .update({ 
          status: 'received',
          received_by: receivedBy,
          received_at: new Date().toISOString()
        })
        .eq('id', dispatchId)
        .select()
        .single();

      if (error) throw error;

      // Update batch status
      await supabase
        .from('batches')
        .update({ status: 'received' })
        .eq('id', data.batch_id);

      setDispatches(prev => prev.map(dispatch => 
        dispatch.id === dispatchId ? data : dispatch
      ));
      setBatches(prev => prev.map(batch => 
        batch.id === data.batch_id 
          ? { ...batch, status: 'received' as const }
          : batch
      ));

      toast({
        title: "Receipt Confirmed",
        description: "Batch receipt confirmed successfully",
      });
      return true;
    } catch (error) {
      console.error('Error confirming receipt:', error);
      toast({
        title: "Error",
        description: "Failed to confirm receipt",
        variant: "destructive",
      });
      return false;
    }
  };

  // Record usage
  const recordUsage = async (usageData: Tables['usage_records']['Insert']) => {
    if (!user || !profile?.is_approved) return false;

    try {
      const { data, error } = await supabase
        .from('usage_records')
        .insert([usageData])
        .select()
        .single();

      if (error) throw error;

      // Update batch status
      await supabase
        .from('batches')
        .update({ status: 'administered' })
        .eq('id', usageData.batch_id);

      setUsageRecords(prev => [data, ...prev]);
      setBatches(prev => prev.map(batch => 
        batch.id === usageData.batch_id 
          ? { ...batch, status: 'administered' as const }
          : batch
      ));

      toast({
        title: "Usage Recorded",
        description: "Medication administration recorded successfully",
      });
      return true;
    } catch (error) {
      console.error('Error recording usage:', error);
      toast({
        title: "Error",
        description: "Failed to record usage",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, profile]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !profile?.is_approved) return;

    const batchesSubscription = supabase
      .channel('batches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBatches(prev => [payload.new as Tables['batches']['Row'], ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBatches(prev => prev.map(batch => 
              batch.id === payload.new.id ? payload.new as Tables['batches']['Row'] : batch
            ));
          } else if (payload.eventType === 'DELETE') {
            setBatches(prev => prev.filter(batch => batch.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const dispatchesSubscription = supabase
      .channel('dispatches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dispatches' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDispatches(prev => [payload.new as Tables['dispatches']['Row'], ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDispatches(prev => prev.map(dispatch => 
              dispatch.id === payload.new.id ? payload.new as Tables['dispatches']['Row'] : dispatch
            ));
          }
        }
      )
      .subscribe();

    return () => {
      batchesSubscription.unsubscribe();
      dispatchesSubscription.unsubscribe();
    };
  }, [user, profile]);

  const stats = {
    totalBatches: batches.length,
    totalDispatches: dispatches.length,
    totalPatients: patients.length,
    pendingApprovals: 0 // This would need to be fetched from users table for admins
  };

  return {
    hospitals,
    warehouses,
    batches,
    dispatches,
    patients,
    usageRecords,
    stats,
    loading,
    createBatch,
    dispatchBatch,
    confirmReceipt,
    recordUsage,
    refetch: fetchData
  };
}