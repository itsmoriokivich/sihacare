import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, QrCode } from 'lucide-react';

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
  const [selectedCamera, setSelectedCamera] = useState<string>('');

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
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ]
      };

      await html5QrCode.start(
        selectedCamera,
        config,
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore frequent scanning errors
          if (!errorMessage.includes('No MultiFormat Readers')) {
            console.log('Scan error:', errorMessage);
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
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
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
        <div className="flex justify-center">
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
            <p className="text-xs mt-1">Supports QR codes and various barcode formats</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};