import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Scanner } from '@/components/ui/scanner';
import { Badge } from '@/components/ui/badge';
import { ScanLine, CheckCircle, Package, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HospitalScannerProps {
  onReceiptConfirmed?: () => void;
}

export const HospitalScanner: React.FC<HospitalScannerProps> = ({ onReceiptConfirmed }) => {
  const { user } = useAuth();
  const { dispatches, batches, confirmReceipt } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = async (result: string) => {
    setScannedCode(result);
    setIsScannerActive(false);
    setIsProcessing(true);

    try {
      // Find the batch with this QR code
      const batch = batches.find(b => b.qr_code === result);
      
      if (!batch) {
        toast({
          title: "Batch Not Found",
          description: "No batch found with this code in the system",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Find pending dispatch for this batch
      const pendingDispatch = dispatches.find(d => 
        d.batch_id === batch.id && 
        (d.status === 'pending' || d.status === 'in_transit')
      );

      if (!pendingDispatch) {
        toast({
          title: "No Pending Dispatch",
          description: "This batch has no pending delivery or has already been received",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Confirm receipt
      await confirmReceipt(pendingDispatch.id, user?.id || '');

      toast({
        title: "Receipt Confirmed Successfully",
        description: `${batch.medication_name} batch has been received and logged`,
      });

      // Reset and close
      setScannedCode('');
      setIsOpen(false);
      onReceiptConfirmed?.();

    } catch (error: any) {
      console.error('Error processing receipt:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process receipt confirmation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanError = (error: string) => {
    toast({
      title: "Scanner Error",
      description: error,
      variant: "destructive",
    });
  };

  const resetScanner = () => {
    setScannedCode('');
    setIsScannerActive(false);
    setIsProcessing(false);
  };

  const pendingDispatches = dispatches.filter(d => d.status === 'pending' || d.status === 'in_transit');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-secondary">
          <ScanLine className="w-4 h-4 mr-2" />
          Quick Scan Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Scan to Confirm Receipt
          </DialogTitle>
          <DialogDescription>
            Scan the barcode or QR code of a delivered batch to confirm receipt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pending deliveries info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {pendingDispatches.length} pending deliveries waiting for confirmation
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Scanner section */}
          {scannedCode ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="font-medium text-green-800">
                    {isProcessing ? 'Processing Receipt...' : 'Receipt Confirmed'}
                  </p>
                  <code className="bg-white px-2 py-1 rounded text-sm">{scannedCode}</code>
                  {!isProcessing && (
                    <Button variant="outline" size="sm" onClick={resetScanner}>
                      Scan Another Code
                    </Button>
                  )}
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};