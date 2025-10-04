import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hospital, Package, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HospitalScanner } from '@/components/HospitalScanner';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const { batches, dispatches, hospitals, warehouses, confirmReceipt } = useData();

  // Get dispatches sent to any hospital (hospital staff can see all for demo)
  const pendingDispatches = dispatches.filter(d => d.status === 'pending' || d.status === 'in_transit');
  const receivedDispatches = dispatches.filter(d => d.status === 'received');

  const handleConfirmReceipt = (dispatchId: string) => {
    confirmReceipt(dispatchId, user?.id || '');
    
    const dispatch = dispatches.find(d => d.id === dispatchId);
    const batch = batches.find(b => b.id === dispatch?.batch_id);
    
    toast({
      title: "Receipt confirmed",
      description: `${batch?.medication_name} batch has been received and logged`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "status-pending",
      in_transit: "status-active",
      received: "status-completed"
    };
    
    return (
      <Badge className={statusMap[status] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const getAvailableBatches = () => {
    // Get batches that have been received by hospitals and have remaining quantity
    const receivedBatchIds = receivedDispatches.map(d => d.batch_id);
    return batches.filter(b => {
      const remaining = (b as any).remaining_quantity ?? b.quantity;
      return receivedBatchIds.includes(b.id) && b.status === 'received' && remaining > 0;
    });
  };

  const availableBatches = getAvailableBatches();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Hospital className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Hospital Dashboard</h1>
          <p className="text-muted-foreground">Manage incoming medical supplies and inventory</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-medical hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Deliveries
            </CardTitle>
            <Clock className="w-5 h-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingDispatches.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="card-medical hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Stock
            </CardTitle>
            <Package className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{availableBatches.length}</div>
            <p className="text-xs text-muted-foreground">Ready for use</p>
          </CardContent>
        </Card>

        <Card className="card-medical hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{receivedDispatches.length}</div>
            <p className="text-xs text-muted-foreground">All time receipts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Deliveries</TabsTrigger>
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="history">Receipt History</TabsTrigger>
        </TabsList>

        {/* Quick actions bar */}
        <div className="flex justify-end mb-4">
          <HospitalScanner onReceiptConfirmed={() => window.location.reload()} />
        </div>

        <TabsContent value="pending">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Incoming Deliveries</CardTitle>
              <CardDescription>Confirm receipt of dispatched medical supplies</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDispatches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending deliveries</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dispatch ID</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>From Warehouse</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDispatches.map((dispatch) => {
                      const batch = batches.find(b => b.id === dispatch.batch_id);
                      const warehouse = warehouses.find(w => w.id === dispatch.from_warehouse_id);
                      return (
                        <TableRow key={dispatch.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono">{dispatch.id}</TableCell>
                          <TableCell className="font-medium">{batch?.medication_name}</TableCell>
                          <TableCell>{warehouse?.name}</TableCell>
                          <TableCell>{dispatch.quantity}</TableCell>
                          <TableCell>{getStatusBadge(dispatch.status)}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => handleConfirmReceipt(dispatch.id)}
                              className="gradient-secondary"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Current Stock</CardTitle>
              <CardDescription>Available medication batches ready for patient administration</CardDescription>
            </CardHeader>
            <CardContent>
              {availableBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No stock available</p>
                  <p className="text-sm text-muted-foreground">Confirm receipt of pending deliveries to see inventory</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableBatches.map((batch) => {
                      const remaining = (batch as any).remaining_quantity ?? batch.quantity;
                      return (
                        <TableRow key={batch.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono">{batch.qr_code}</TableCell>
                          <TableCell className="font-medium">{batch.medication_name}</TableCell>
                          <TableCell>{remaining} / {batch.quantity}</TableCell>
                          <TableCell>{new Date(batch.expiry_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className="status-completed">Available</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Receipt History</CardTitle>
              <CardDescription>All confirmed deliveries and receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Received</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>From Warehouse</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Received By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivedDispatches.map((dispatch) => {
                    const batch = batches.find(b => b.id === dispatch.batch_id);
                    const warehouse = warehouses.find(w => w.id === dispatch.from_warehouse_id);
                    return (
                      <TableRow key={dispatch.id} className="hover:bg-muted/50">
                        <TableCell>{dispatch.received_at ? new Date(dispatch.received_at).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="font-medium">{batch?.medication_name}</TableCell>
                        <TableCell>{warehouse?.name}</TableCell>
                        <TableCell>{dispatch.quantity}</TableCell>
                        <TableCell>{dispatch.received_by || 'System'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}