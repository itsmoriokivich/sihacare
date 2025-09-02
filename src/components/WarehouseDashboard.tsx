import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Warehouse, Package, Plus, Send, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function WarehouseDashboard() {
  const { user } = useAuth();
  const { batches, dispatches, hospitals, warehouses, createBatch, dispatchBatch } = useData();
  
  // Create Batch Form State
  const [newBatch, setNewBatch] = useState({
    medicationName: '',
    quantity: '',
    manufacturingDate: '',
    expiryDate: '',
    warehouseId: '1' // Default to first warehouse
  });

  // Dispatch Form State
  const [newDispatch, setNewDispatch] = useState({
    batchId: '',
    toHospitalId: '',
    quantity: ''
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBatch.medicationName || !newBatch.quantity || !newBatch.manufacturingDate || !newBatch.expiryDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const batchData = {
      medicationName: newBatch.medicationName,
      quantity: parseInt(newBatch.quantity),
      manufacturingDate: newBatch.manufacturingDate,
      expiryDate: newBatch.expiryDate,
      warehouseId: newBatch.warehouseId,
      status: 'created' as const,
      qrCode: `QR${Date.now()}`,
      createdBy: user?.id || ''
    };

    createBatch(batchData);
    
    toast({
      title: "Batch created successfully",
      description: `${newBatch.medicationName} batch has been added to inventory`,
    });

    // Reset form
    setNewBatch({
      medicationName: '',
      quantity: '',
      manufacturingDate: '',
      expiryDate: '',
      warehouseId: '1'
    });
    setIsCreateOpen(false);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDispatch.batchId || !newDispatch.toHospitalId || !newDispatch.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const batch = batches.find(b => b.id === newDispatch.batchId);
    if (!batch) {
      toast({
        title: "Error",
        description: "Selected batch not found",
        variant: "destructive",
      });
      return;
    }

    if (parseInt(newDispatch.quantity) > batch.quantity) {
      toast({
        title: "Error",
        description: "Cannot dispatch more than available quantity",
        variant: "destructive",
      });
      return;
    }

    const dispatchData = {
      batchId: newDispatch.batchId,
      fromWarehouseId: batch.warehouseId,
      toHospitalId: newDispatch.toHospitalId,
      quantity: parseInt(newDispatch.quantity),
      status: 'pending' as const,
      dispatchedBy: user?.id || ''
    };

    dispatchBatch(dispatchData);
    
    const hospital = hospitals.find(h => h.id === newDispatch.toHospitalId);
    toast({
      title: "Dispatch created successfully",
      description: `${batch.medicationName} dispatched to ${hospital?.name}`,
    });

    // Reset form
    setNewDispatch({
      batchId: '',
      toHospitalId: '',
      quantity: ''
    });
    setIsDispatchOpen(false);
  };

  const availableBatches = batches.filter(b => b.status === 'created');
  const myDispatches = dispatches.filter(d => d.dispatchedBy === user?.id);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      created: "status-pending",
      dispatched: "status-active", 
      pending: "status-pending",
      received: "status-completed"
    };
    
    return (
      <Badge className={statusMap[status] || ""}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Warehouse className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Warehouse Dashboard</h1>
            <p className="text-muted-foreground">Manage medical supply inventory and dispatches</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Add a new medication batch to inventory
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication Name</Label>
                  <Input
                    id="medication"
                    placeholder="e.g., Paracetamol 500mg"
                    value={newBatch.medicationName}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, medicationName: e.target.value }))}
                    className="focus-medical"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="1000"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch(prev => ({ ...prev, quantity: e.target.value }))}
                    className="focus-medical"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mfg-date">Manufacturing Date</Label>
                    <Input
                      id="mfg-date"
                      type="date"
                      value={newBatch.manufacturingDate}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, manufacturingDate: e.target.value }))}
                      className="focus-medical"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exp-date">Expiry Date</Label>
                    <Input
                      id="exp-date"
                      type="date"
                      value={newBatch.expiryDate}
                      onChange={(e) => setNewBatch(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="focus-medical"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary">
                    Create Batch
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDispatchOpen} onOpenChange={setIsDispatchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Send className="w-4 h-4 mr-2" />
                Dispatch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dispatch Batch</DialogTitle>
                <DialogDescription>
                  Send medication batch to a hospital
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDispatch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batch">Select Batch</Label>
                  <Select value={newDispatch.batchId} onValueChange={(value) => setNewDispatch(prev => ({ ...prev, batchId: value }))}>
                    <SelectTrigger className="focus-medical">
                      <SelectValue placeholder="Choose batch to dispatch" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.medicationName} (Qty: {batch.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospital">Destination Hospital</Label>
                  <Select value={newDispatch.toHospitalId} onValueChange={(value) => setNewDispatch(prev => ({ ...prev, toHospitalId: value }))}>
                    <SelectTrigger className="focus-medical">
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name} - {hospital.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dispatch-qty">Quantity to Dispatch</Label>
                  <Input
                    id="dispatch-qty"
                    type="number"
                    placeholder="Quantity"
                    value={newDispatch.quantity}
                    onChange={(e) => setNewDispatch(prev => ({ ...prev, quantity: e.target.value }))}
                    className="focus-medical"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDispatchOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-secondary">
                    Dispatch
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="dispatches">My Dispatches</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
              <CardDescription>All medication batches in the warehouse</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>QR Code</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-muted-foreground" />
                          <code className="text-sm">{batch.qrCode}</code>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{batch.medicationName}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatches">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Dispatch History</CardTitle>
              <CardDescription>Track your dispatched batches</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispatch ID</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dispatched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myDispatches.map((dispatch) => {
                    const batch = batches.find(b => b.id === dispatch.batchId);
                    const hospital = hospitals.find(h => h.id === dispatch.toHospitalId);
                    return (
                      <TableRow key={dispatch.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono">{dispatch.id}</TableCell>
                        <TableCell>{batch?.medicationName}</TableCell>
                        <TableCell>{hospital?.name}</TableCell>
                        <TableCell>{dispatch.quantity}</TableCell>
                        <TableCell>{getStatusBadge(dispatch.status)}</TableCell>
                        <TableCell>{new Date(dispatch.dispatchedAt).toLocaleDateString()}</TableCell>
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