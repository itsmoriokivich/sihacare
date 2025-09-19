import React, { useState, useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Package, Truck, Users, Activity, CheckCircle, XCircle, Building, Warehouse, UserCheck, Boxes, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { batches, dispatches, patients, usageRecords, hospitals, warehouses } = useSupabaseData();
  const { profile } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_users');
      
      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active users with workplace details
  const fetchActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          hospitals:hospital_id(name, location),
          warehouses:warehouse_id(name, location)
        `)
        .eq('status', 'approved')
        .eq('is_approved', true);
      
      if (error) throw error;
      setActiveUsers(data || []);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchPendingUsers();
      fetchActiveUsers();
    }
  }, [profile]);

  const approveUser = async (userEmail: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`https://oifzicxbxzxlzbttekua.supabase.co/functions/v1/approve-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_email: userEmail }),
      });

      const result = await response.json();

      if (result.success) {
        setPendingUsers(prev => prev.filter(u => u.email !== userEmail));
        toast({
          title: "User approved",
          description: "User has been granted access and email confirmed",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "User rejected",
        description: "Access request has been denied",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
  };

  const revokeUserAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'rejected',
          is_approved: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setActiveUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "Access revoked",
        description: "User access has been revoked",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke user access",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      created: { variant: "outline", className: "status-pending" },
      dispatched: { variant: "default", className: "status-active" },
      received: { variant: "secondary", className: "status-completed" },
      administered: { variant: "default", className: "status-completed" }
    };
    
    const config = statusMap[status] || { variant: "outline", className: "" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = [
    {
      title: "Total Batches",
      value: batches.length,
      icon: Package,
      description: "Medical batches in system",
      color: "text-primary"
    },
    {
      title: "Active Dispatches",
      value: dispatches.length,
      icon: Truck,
      description: "Supply dispatches",
      color: "text-info"
    },
    {
      title: "Registered Patients",
      value: patients.length,
      icon: Users,
      description: "Patients in hospitals",
      color: "text-secondary"
    },
    {
      title: "Usage Records",
      value: usageRecords.length,
      icon: Activity,
      description: "Medication administrations",
      color: "text-success"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">System oversight and user management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="card-medical hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="supply-chain">Supply Chain</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-medical">
              <CardHeader>
                <CardTitle>System Infrastructure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Hospitals</span>
                    <Badge variant="secondary">{hospitals.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Warehouses</span>
                    <Badge variant="secondary">{warehouses.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users</span>
                    <Badge variant="secondary">{activeUsers.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Approvals</span>
                    <Badge variant="outline">{pendingUsers.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-medical">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {batches.slice(0, 3).map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium">{batch.medication_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {batch.quantity}</p>
                      </div>
                      {getStatusBadge(batch.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-medical">
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Currently approved system users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Details</TableHead>
                      <TableHead>Role & Workplace</TableHead>
                      <TableHead>Account Info</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeUsers.map((user) => {
                      const workplace = user.hospitals ? 
                        `${user.hospitals.name} (${user.hospitals.location})` : 
                        user.warehouses ? 
                        `${user.warehouses.name} (${user.warehouses.location})` : 
                        'No workplace assigned';
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="secondary">{user.role}</Badge>
                              <p className="text-sm text-muted-foreground">{workplace}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Created: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Updated: {new Date(user.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => revokeUserAccess(user.id)}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="card-medical">
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Review and approve new user access requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending approvals</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => approveUser(user.email)}
                                className="gradient-secondary"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => rejectUser(user.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hospitals">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Registered Hospitals
              </CardTitle>
              <CardDescription>Healthcare facilities in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((hospital) => {
                    const hospitalPatients = patients.filter(p => p.hospital_id === hospital.id);
                    return (
                      <TableRow key={hospital.id}>
                        <TableCell className="font-medium">{hospital.name}</TableCell>
                        <TableCell>{hospital.location}</TableCell>
                        <TableCell>{hospital.capacity}</TableCell>
                        <TableCell>{hospitalPatients.length}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Active</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="w-5 h-5" />
                Registered Warehouses
              </CardTitle>
              <CardDescription>Storage facilities and their inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Batches</TableHead>
                    <TableHead>Dispatches</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouses.map((warehouse) => {
                    const warehouseBatches = batches.filter(b => b.warehouse_id === warehouse.id);
                    const warehouseDispatches = dispatches.filter(d => d.from_warehouse_id === warehouse.id);
                    return (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>{warehouseBatches.length}</TableCell>
                        <TableCell>{warehouseDispatches.length}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Active</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="w-5 h-5" />
                Inventory Overview
              </CardTitle>
              <CardDescription>Current stock levels by location and batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {warehouses.map((warehouse) => {
                  const warehouseBatches = batches.filter(b => b.warehouse_id === warehouse.id);
                  const availableBatches = warehouseBatches.filter(b => b.status === 'created');
                  
                  return (
                    <div key={warehouse.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">{warehouse.name} - {warehouse.location}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-2xl font-bold text-primary">{availableBatches.length}</div>
                          <div className="text-sm text-muted-foreground">Available Batches</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-2xl font-bold text-info">{warehouseBatches.filter(b => b.status === 'dispatched').length}</div>
                          <div className="text-sm text-muted-foreground">Dispatched</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <div className="text-2xl font-bold text-success">{availableBatches.reduce((sum, b) => sum + b.quantity, 0)}</div>
                          <div className="text-sm text-muted-foreground">Total Units</div>
                        </div>
                      </div>
                      
                      {availableBatches.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Batch ID</TableHead>
                              <TableHead>Medication</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Expiry Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableBatches.slice(0, 5).map((batch) => (
                              <TableRow key={batch.id}>
                                <TableCell className="font-mono text-sm">{batch.qr_code}</TableCell>
                                <TableCell>{batch.medication_name}</TableCell>
                                <TableCell>{batch.quantity}</TableCell>
                                <TableCell>{new Date(batch.expiry_date).toLocaleDateString()}</TableCell>
                                <TableCell>{getStatusBadge(batch.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supply-chain">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Supply Chain Flow
              </CardTitle>
              <CardDescription>Track medical supplies from warehouse to end user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dispatches.map((dispatch) => {
                  const batch = batches.find(b => b.id === dispatch.batch_id);
                  const warehouse = warehouses.find(w => w.id === dispatch.from_warehouse_id);
                  const hospital = hospitals.find(h => h.id === dispatch.to_hospital_id);
                  const usage = usageRecords.find(u => u.batch_id === dispatch.batch_id);
                  const patient = usage ? patients.find(p => p.id === usage.patient_id) : null;
                  
                  return (
                    <div key={dispatch.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Supply Chain: {batch?.medication_name}</h3>
                        <Badge variant="outline">Batch: {batch?.qr_code}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 border rounded">
                          <Warehouse className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <div className="font-medium">{warehouse?.name}</div>
                          <div className="text-sm text-muted-foreground">{warehouse?.location}</div>
                          <Badge variant="secondary" className="mt-2">Origin</Badge>
                        </div>
                        
                        <div className="text-center p-3 border rounded">
                          <Truck className="w-6 h-6 mx-auto mb-2 text-info" />
                          <div className="font-medium">In Transit</div>
                          <div className="text-sm text-muted-foreground">Qty: {dispatch.quantity}</div>
                          <Badge variant={dispatch.status === 'received' ? 'secondary' : 'default'} className="mt-2">
                            {dispatch.status}
                          </Badge>
                        </div>
                        
                        <div className="text-center p-3 border rounded">
                          <Building className="w-6 h-6 mx-auto mb-2 text-secondary" />
                          <div className="font-medium">{hospital?.name}</div>
                          <div className="text-sm text-muted-foreground">{hospital?.location}</div>
                          <Badge variant="secondary" className="mt-2">Destination</Badge>
                        </div>
                        
                        <div className="text-center p-3 border rounded">
                          <Users className="w-6 h-6 mx-auto mb-2 text-success" />
                          <div className="font-medium">{patient ? patient.name : 'Pending'}</div>
                          <div className="text-sm text-muted-foreground">
                            {usage ? 'Administered' : 'Awaiting Use'}
                          </div>
                          <Badge variant={usage ? 'default' : 'outline'} className="mt-2">
                            {usage ? 'Complete' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      {usage && (
                        <div className="mt-4 p-3 bg-muted rounded">
                          <div className="text-sm">
                            <strong>Usage Details:</strong> Administered on {new Date(usage.administered_at).toLocaleDateString()} 
                            {usage.notes && ` - ${usage.notes}`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card className="card-medical">
            <CardHeader>
              <CardTitle>Batch Lifecycle Tracking</CardTitle>
              <CardDescription>Complete traceability from creation to administration</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono">{batch.qr_code}</TableCell>
                      <TableCell className="font-medium">{batch.medication_name}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}