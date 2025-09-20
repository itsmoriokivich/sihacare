import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Scanner } from '@/components/ui/scanner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScanLine, Package, Plus, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BatchScannerProps {
  warehouses: any[];
  onBatchCreated?: () => void;
}

export const BatchScanner: React.FC<BatchScannerProps> = ({ warehouses, onBatchCreated }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [batchData, setBatchData] = useState({
    medication_name: '',
    quantity: '',
    manufacturing_date: '',
    expiry_date: '',
    warehouse_id: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleScan = (result: string) => {
    setScannedCode(result);
    setIsScannerActive(false);
    toast({
      title: "Code Scanned Successfully",
      description: `Scanned: ${result}`,
    });
  };

  const handleScanError = (error: string) => {
    toast({
      title: "Scanner Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scannedCode) {
      toast({
        title: "Error",
        description: "Please scan a batch code first",
        variant: "destructive",
      });
      return;
    }

    if (!batchData.medication_name || !batchData.quantity || !batchData.manufacturing_date || !batchData.expiry_date || !batchData.warehouse_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('batches')
        .insert({
          qr_code: scannedCode,
          medication_name: batchData.medication_name,
          quantity: parseInt(batchData.quantity),
          manufacturing_date: batchData.manufacturing_date,
          expiry_date: batchData.expiry_date,
          warehouse_id: batchData.warehouse_id,
          status: 'created',
          created_by: user?.id || ''
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Batch Created Successfully",
        description: `Batch ${scannedCode} has been added to the system`,
      });

      // Reset form
      setScannedCode('');
      setBatchData({
        medication_name: '',
        quantity: '',
        manufacturing_date: '',
        expiry_date: '',
        warehouse_id: ''
      });
      setIsOpen(false);
      onBatchCreated?.();

    } catch (error: any) {
      console.error('Error creating batch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetScanner = () => {
    setScannedCode('');
    setIsScannerActive(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary">
          <ScanLine className="w-4 h-4 mr-2" />
          Scan Batch Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Scan & Register Batch
          </DialogTitle>
          <DialogDescription>
            Scan a barcode or QR code to register a new medical batch in the system
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Step 1: Scan Code</h3>
              {scannedCode && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Scanned
                </Badge>
              )}
            </div>
            
            {scannedCode ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    <p className="font-medium text-green-800">Code Scanned Successfully</p>
                    <code className="bg-white px-2 py-1 rounded text-sm">{scannedCode}</code>
                    <Button variant="outline" size="sm" onClick={resetScanner}>
                      Scan Different Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Scanner
                onScan={handleScan}
                onError={handleScanError}
                isActive={isScannerActive}
                onToggle={() => setIsScannerActive(!isScannerActive)}
              />
            )}
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Batch Details</h3>
            
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication Name *</Label>
                <Input
                  id="medication"
                  placeholder="e.g., Paracetamol 500mg"
                  value={batchData.medication_name}
                  onChange={(e) => setBatchData(prev => ({ ...prev, medication_name: e.target.value }))}
                  className="focus-medical"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="1000"
                  value={batchData.quantity}
                  onChange={(e) => setBatchData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="focus-medical"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">Assign to Warehouse *</Label>
                <Select value={batchData.warehouse_id} onValueChange={(value) => setBatchData(prev => ({ ...prev, warehouse_id: value }))}>
                  <SelectTrigger className="focus-medical">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mfg-date">Manufacturing Date *</Label>
                  <Input
                    id="mfg-date"
                    type="date"
                    value={batchData.manufacturing_date}
                    onChange={(e) => setBatchData(prev => ({ ...prev, manufacturing_date: e.target.value }))}
                    className="focus-medical"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exp-date">Expiry Date *</Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={batchData.expiry_date}
                    onChange={(e) => setBatchData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    className="focus-medical"
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="gradient-primary"
                  disabled={!scannedCode || isCreating}
                >
                  {isCreating ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Batch
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};