import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/AdminDashboard';
import WarehouseDashboard from '@/components/WarehouseDashboard';
import HospitalDashboard from '@/components/HospitalDashboard';
import ClinicianDashboard from '@/components/ClinicianDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'warehouse':
        return <WarehouseDashboard />;
      case 'hospital':
        return <HospitalDashboard />;
      case 'clinician':
        return <ClinicianDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
            <p className="text-muted-foreground">Your role is not recognized in the system.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
}