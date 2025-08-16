import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { ConfirmationModal } from './common/ConfirmationModal';
import { Button } from './ui/button';
import { DriverCard } from './DriverList/DriverCard';
import DriverFormModal from './DriverList/DriverFormModal';

import { User, ArrowLeft, LogOut, RefreshCcw } from 'lucide-react';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { PageLoader } from './common/PageLoader';
import type { Driver } from '../types';

interface DriverListPageProps {
  onDriverSelect: (driver: Driver) => void;
  onBack: () => void;
  onLogout: () => void;
}

export function DriverListPage({
  onDriverSelect,
  onBack,
  onLogout,
}: DriverListPageProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const drivers = await api.getDrivers();
      // Each driver should already have an 'id' field from the backend transformation
      setDrivers(drivers);
    } catch (error) {
      toast.error('Failed to fetch drivers.');
      console.error('Fetch drivers error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver);
    setIsDeleteModalOpen(true);
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver);
    setIsEditOpen(true);
  };

  const handleUpdateDriver = useCallback(async (updatedFields: Partial<Driver>) => {
    if (!editingDriver) return;
    setIsSaving(true);
    try {
      // Map UI fields to backend expectations
      const payload: any = {
        name: updatedFields.name ?? editingDriver.name,
        number: (updatedFields as any).driverId ?? editingDriver.driverId,
        contact: (updatedFields as any).phone ?? editingDriver.phone,
        email: updatedFields.email ?? editingDriver.email,
        gender: updatedFields.gender ?? editingDriver.gender,
      };

      const updated = await api.updateDriver(editingDriver.id, payload);
      setDrivers(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      toast.success('Driver updated successfully');
      setIsEditOpen(false);
      setEditingDriver(null);
    } catch (error) {
      console.error('Update driver error:', error);
      toast.error('Failed to update driver. ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsSaving(false);
    }
  }, [editingDriver]);

  const handleConfirmDelete = useCallback(async () => {
    if (!driverToDelete) return;

    setIsDeleting(true);
    try {
      console.log('Attempting to delete driver:', driverToDelete);
      await api.deleteDriver(driverToDelete.id);
      setDrivers(prev => prev.filter(d => d.id !== driverToDelete.id));
      toast.success('Driver deleted successfully!');
      setIsDeleteModalOpen(false);
      setDriverToDelete(null);
    } catch (error) {
      console.error('Delete driver error:', error);
      toast.error('Failed to delete driver. ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsDeleting(false);
    }
  }, [driverToDelete]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Banner />
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Allocation
              </Button>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                  <User className="w-6 h-6 text-primary-foreground text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-foreground">Select a Driver</h1>
                  <p className="text-sm text-muted-foreground">Choose a driver to manage their bus and students</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchDrivers} variant="outline" className="flex items-center gap-2 border-2 border-gray-400 text-gray-600 hover:bg-gray-100">
                <RefreshCcw className={`w-4 h-4 ${loading && 'animate-spin'}`} />
                Refresh
              </Button>
              <Button onClick={onLogout} variant="outline" className="flex items-center gap-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {loading ? (
            <PageLoader />
          ) : drivers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="font-medium mb-2 text-gray-900">No Drivers have been Allocated</h3>
              <p className="text-sm text-gray-600 mb-6">
                First allocate drivers to their respective buses on the previous page
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {drivers.map((driver, index) => (
                <DriverCard 
                  key={driver.id} 
                  driver={driver} 
                  index={index}
                  onSelect={onDriverSelect} 
                  onDelete={handleDeleteClick}
                  onEdit={handleEditClick}
                  isDeleting={isDeleting && driverToDelete?.id === driver.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Driver"
        description={`Are you sure you want to delete ${driverToDelete?.name}? This action cannot be undone.`}
        loading={isDeleting}
      />

      <DriverFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateDriver}
        driver={editingDriver}
        isLoading={isSaving}
      />
    </div>
  );
}