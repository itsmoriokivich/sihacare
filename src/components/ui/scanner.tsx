import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, QrCode, RotateCw } from 'lucide-react';
import { processImageWithMirrorSupport, detectBarcodePatternsWithMirror, loadImageFromBlob } from '@/utils/mirrorScanner';

interface ScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onError, isActive, onToggle }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [isProcessingMirror, setIsProcessingMirror] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  // Enhanced mirror scanning function
  const tryMirrorScanning = async (): Promise<string | null> => {
    const video = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (!video) return null;

    setIsProcessingMirror(true);
    
    try {
      // Capture current frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Convert to blob and then to image
      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          try {
            const img = await loadImageFromBlob(blob);
            
            // Try OCR-based scanning for mirror text
            const ocrResults = await processImageWithMirrorSupport(img);
            if (ocrResults.length > 0) {
              // Return the first valid result
              const cleanResult = ocrResults[0].split(' (')[0]; // Remove transformation info
              resolve(cleanResult);
              return;
            }

            // Try barcode pattern detection
            const patterns = detectBarcodePatternsWithMirror(img);
            if (patterns.length > 0) {
              const cleanResult = patterns[0].split(' (')[0]; // Remove transformation info
              resolve(cleanResult);
              return;
            }

            resolve(null);
          } catch (error) {
            console.warn('Mirror scanning failed:', error);
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      });
    } catch (error) {
      console.error('Mirror scanning error:', error);
      return null;
    } finally {
      setIsProcessingMirror(false);
    }
  };

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        setSelectedCamera(devices[0].id);
      }
    }).catch(err => {
      console.error('Failed to get cameras:', err);
      onError?.('No cameras found or camera access denied');
    });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera || isScanning) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        supportedScanTypes: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        // Enhanced decoding options for better mirror/reverse detection
        decoder: {
          readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'code_39_reader'],
          multiple: false
        }
      };

      await html5QrCode.start(
        selectedCamera,
        config,
        async (decodedText, decodedResult) => {
          onScan(decodedText);
          stopScanning();
        },
        async (errorMessage, error) => {
          // Enhanced error handling - try mirror scanning after a few failed attempts
          if (!errorMessage.includes('No MultiFormat Readers')) {
            // Try mirror scanning as fallback
            try {
              const mirrorResult = await tryMirrorScanning();
              if (mirrorResult) {
                onScan(mirrorResult);
                stopScanning();
                return;
              }
            } catch (e) {
              console.warn('Mirror scanning fallback failed:', e);
            }
          }
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanning:', err);
      onError?.('Failed to start camera: ' + err.message);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        
        // Ensure all camera tracks are properly stopped
        const video = document.querySelector('#qr-reader video') as HTMLVideoElement;
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanning();
    } else if (!isActive && isScanning) {
      stopScanning();
    }
  }, [isActive, selectedCamera]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Batch Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          <Button
            onClick={onToggle}
            variant={isActive ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isActive ? (
              <>
                <CameraOff className="w-4 h-4" />
                Stop Scanner
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Start Scanner
              </>
            )}
          </Button>
          
          {isActive && (
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
                  Processing...
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  Try Mirror Scan
                </>
              )}
            </Button>
          )}
        </div>

        {cameras.length > 1 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Camera:</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={isScanning}
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          id="qr-reader"
          className={`w-full ${isActive ? 'block' : 'hidden'}`}
          style={{ minHeight: '300px' }}
        />

        {!isActive && (
          <div className="text-center text-muted-foreground">
            <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Click "Start Scanner" to begin scanning batch codes</p>
            <p className="text-xs mt-1">Supports QR codes, barcodes, and mirror-written codes</p>
            <p className="text-xs text-primary mt-1">✨ Enhanced with AI for reversed/mirrored text detection</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};