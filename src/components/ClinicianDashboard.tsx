import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Activity, Users, Plus, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ClinicianDashboard() {
  const { user } = useAuth();
  const { batches, dispatches, patients, hospitals, usageRecords, recordUsage } = useData();
  
  // Administration Form State
  const [newUsage, setNewUsage] = useState({
    batch_id: '',
    patient_id: '',
    quantity: '',
    notes: ''
  });

  const [isAdministerOpen, setIsAdministerOpen] = useState(false);

  // Get available batches (received by hospitals)
  const receivedDispatches = dispatches.filter(d => d.status === 'received');
  const availableBatches = batches.filter(b => {
    const remaining = (b as any).remaining_quantity ?? b.quantity;
    return receivedDispatches.some(d => d.batch_id === b.id) && b.status === 'received' && remaining > 0;
  });

  // Get usage records created by this clinician
  const myUsageRecords = usageRecords.filter(u => u.clinician_id === user?.id);

  const handleAdminister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsage.batch_id || !newUsage.patient_id || !newUsage.quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const batch = batches.find(b => b.id === newUsage.batch_id);
    const patient = patients.find(p => p.id === newUsage.patient_id);
    
    if (!batch || !patient) {
      toast({
        title: "Error",
        description: "Selected batch or patient not found",
        variant: "destructive",
      });
      return;
    }

    const remaining = (batch as any).remaining_quantity ?? batch.quantity;
    if (parseInt(newUsage.quantity) > remaining) {
      toast({
        title: "Error",
        description: `Cannot administer more than available quantity (${remaining} units remaining)`,
        variant: "destructive",
      });
      return;
    }

    const usageData = {
      batch_id: newUsage.batch_id,
      patient_id: newUsage.patient_id,
      clinician_id: user?.id || '',
      hospital_id: patient.hospital_id,
      quantity: parseInt(newUsage.quantity),
      notes: newUsage.notes
    };

    recordUsage({
      batch_id: newUsage.batch_id,
      patient_id: newUsage.patient_id,
      clinician_id: user.id,
      hospital_id: patient.hospital_id,
      quantity: parseInt(newUsage.quantity),
      notes: newUsage.notes || null,
    });
    
    toast({
      title: "Administration recorded",
      description: `${batch.medication_name} administered to ${patient.name}`,
    });

    // Reset form
    setNewUsage({
      batch_id: '',
      patient_id: '',
      quantity: '',
      notes: ''
    });
    setIsAdministerOpen(false);
  };

  const getPatientDetails = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const getBatchDetails = (batchId: string) => {
    return batches.find(b => b.id === batchId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Clinician Dashboard</h1>
            <p className="text-muted-foreground">Patient care and medication administration</p>
          </div>
        </div>

        <Dialog open={isAdministerOpen} onOpenChange={setIsAdministerOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Administer Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Administer Medication</DialogTitle>
              <DialogDescription>
                Record medication administration to a patient
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdminister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Select Medication Batch</Label>
                <Select value={newUsage.batch_id} onValueChange={(value) => setNewUsage(prev => ({ ...prev, batch_id: value }))}>
                  <SelectTrigger className="focus-medical">
                    <SelectValue placeholder="Choose medication batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.medication_name} (Available: {batch.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient</Label>
                <Select value={newUsage.patient_id} onValueChange={(value) => setNewUsage(prev => ({ ...prev, patient_id: value }))}>
                  <SelectTrigger className="focus-medical">
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} (Age: {patient.age}, ID: {patient.medical_record})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-qty">Quantity Administered</Label>
                <Input
                  id="admin-qty"
                  type="number"
                  placeholder="Quantity"
                  value={newUsage.quantity}
                  onChange={(e) => setNewUsage(prev => ({ ...prev, quantity: e.target.value }))}
                  className="focus-medical"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the administration..."
                  value={newUsage.notes}
                  onChange={(e) => setNewUsage(prev => ({ ...prev, notes: e.target.value }))}
                  className="focus-medical"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAdministerOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary">
                  Record Administration
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-medical hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Medications
            </CardTitle>
            <Activity className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{availableBatches.length}</div>
            <p className="text-xs text-muted-foreground">Ready for administration</p>
          </CardContent>
        </Card>

        <Card className="card-medical hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registered Patients
            </CardTitle>
            <Users className="w-5 h-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{patients.length}</div>
            <p className="text-xs text-muted-foreground">In the system</p>
          </CardContent>
        </Card>

        <Card className="card-medical hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Administrations
            </CardTitle>
            <FileText className="w-5 h-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{myUsageRecords.length}</div>
            <p className="text-xs text-muted-foreground">Total recorded</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="medications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="medications">Available Medications</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="history">Administration History</TabsTrigger>
        </TabsList>

        <TabsContent value="medications">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Available Medication Batches</CardTitle>
              <CardDescription>Medications ready for patient administration</CardDescription>
            </CardHeader>
            <CardContent>
              {availableBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No medications available</p>
                  <p className="text-sm text-muted-foreground">Check with hospital staff for incoming deliveries</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Available Quantity</TableHead>
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

        <TabsContent value="patients">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Patient Registry</CardTitle>
              <CardDescription>All registered patients in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medical Record</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Hospital</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => {
                    const hospital = hospitals.find(h => h.id === patient.hospital_id);
                    return (
                      <TableRow key={patient.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono">{patient.medical_record}</TableCell>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{hospital?.name}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>My Administration Records</CardTitle>
              <CardDescription>History of medications you have administered</CardDescription>
            </CardHeader>
            <CardContent>
              {myUsageRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No administration records yet</p>
                  <p className="text-sm text-muted-foreground">Start by administering medication to patients</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myUsageRecords.map((record) => {
                      const patient = getPatientDetails(record.patient_id);
                      const batch = getBatchDetails(record.batch_id);
                      return (
                        <TableRow key={record.id} className="hover:bg-muted/50">
                          <TableCell>{new Date(record.administered_at).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{patient?.name}</TableCell>
                          <TableCell>{batch?.medication_name}</TableCell>
                          <TableCell>{record.quantity}</TableCell>
                          <TableCell className="max-w-xs truncate">{record.notes || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}