import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/AdminDashboard';
import WarehouseDashboard from '@/components/WarehouseDashboard';
import HospitalDashboard from '@/components/HospitalDashboard';
import ClinicianDashboard from '@/components/ClinicianDashboard';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Account Pending Approval</h2>
            <p className="text-muted-foreground mb-6">
              Your account is waiting for administrator approval. You'll receive an email notification once approved.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="text-primary hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
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