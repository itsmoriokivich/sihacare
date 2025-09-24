import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Scanner } from '@/components/ui/scanner';
import { Badge } from '@/components/ui/badge';
import { ScanLine, CheckCircle, Package, Clock, RotateCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { processImageWithMirrorSupport, loadImageFromBlob } from '@/utils/mirrorScanner';

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
  const [isProcessingMirror, setIsProcessingMirror] = useState(false);

  const handleScan = async (result: string) => {
    await processScannedCode(result);
  };

  const processScannedCode = async (code: string) => {
    setScannedCode(code);
    setIsScannerActive(false);
    setIsProcessing(true);

    try {
      // Find the batch with this QR code
      const batch = batches.find(b => b.qr_code === code);
      
      if (!batch) {
        // If not found with direct match, try to find partial matches or similar codes
        const similarBatch = batches.find(b => 
          b.qr_code.includes(code) || 
          code.includes(b.qr_code) ||
          b.qr_code.replace(/\s+/g, '') === code.replace(/\s+/g, '')
        );
        
        if (!similarBatch) {
          toast({
            title: "Batch Not Found",
            description: "No batch found with this code in the system",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        // Use the similar batch
        await confirmBatchReceipt(similarBatch);
        return;
      }

      await confirmBatchReceipt(batch);

    } catch (error: any) {
      console.error('Error processing receipt:', error);
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process receipt confirmation",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const confirmBatchReceipt = async (batch: any) => {
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
    setIsProcessing(false);
    onReceiptConfirmed?.();
  };

  const tryMirrorScanning = async () => {
    setIsProcessingMirror(true);
    
    try {
      const video = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (!video) {
        toast({
          title: "Scanner Not Active",
          description: "Please start the scanner first",
          variant: "destructive",
        });
        return;
      }

      // Capture current frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Convert to blob and process with mirror support
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          const img = await loadImageFromBlob(blob);
          const results = await processImageWithMirrorSupport(img);
          
          if (results.length > 0) {
            // Process the first result
            const cleanCode = results[0].split(' (')[0]; // Remove transformation info
            await processScannedCode(cleanCode);
            
            toast({
              title: "Mirror Scan Successful",
              description: `Found code: ${cleanCode}`,
            });
          } else {
            toast({
              title: "No Code Found",
              description: "Could not detect any codes, including mirrored ones",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Mirror scanning failed:', error);
          toast({
            title: "Mirror Scan Failed",
            description: "Could not process the image for mirror codes",
            variant: "destructive",
          });
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Mirror scanning error:', error);
      toast({
        title: "Scanner Error",
        description: "Failed to access camera for mirror scanning",
        variant: "destructive",
      });
    } finally {
      setIsProcessingMirror(false);
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
            <div className="space-y-4">
              <Scanner
                onScan={handleScan}
                onError={handleScanError}
                isActive={isScannerActive}
                onToggle={() => setIsScannerActive(!isScannerActive)}
              />
              
              {isScannerActive && (
                <div className="flex justify-center">
                  <Button
                    onClick={tryMirrorScanning}
                    disabled={isProcessingMirror}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isProcessingMirror ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        Scanning Mirror...
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-4 h-4" />
                        Try Mirror/Reversed Scan
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
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