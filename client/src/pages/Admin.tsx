/*
 * Admin page — wraps DashboardLayout with admin content.
 * Shows applications list and puppy management.
 */
import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

function ApplicationsTable() {
  const { data: applications, isLoading } = trpc.admin.applications.list.useQuery();
  const updateStatus = trpc.admin.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status updated');
      utils.admin.applications.list.invalidate();
    },
  });
  const utils = trpc.useUtils();

  if (isLoading) {
    return <div className="text-center py-12 text-[#3D2B1F]/40">Loading applications...</div>;
  }

  if (!applications?.length) {
    return <div className="text-center py-12 text-[#3D2B1F]/40">No applications yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#3D2B1F]/10">
            <th className="text-left py-3 px-4 font-semibold text-[#3D2B1F]/60">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-[#3D2B1F]/60">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-[#3D2B1F]/60">Phone</th>
            <th className="text-left py-3 px-4 font-semibold text-[#3D2B1F]/60">Puppy</th>
            <th className="text-left py-3 px-4 font-semibold text-[#3D2B1F]/60">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-[#3D2B1F]/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app: any) => (
            <tr key={app.id} className="border-b border-[#3D2B1F]/5 hover:bg-[#3D2B1F]/2">
              <td className="py-3 px-4">{app.name}</td>
              <td className="py-3 px-4">{app.email}</td>
              <td className="py-3 px-4">{app.phone}</td>
              <td className="py-3 px-4">{app.puppyPreference || 'Any'}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${
                  app.status === 'approved' ? 'bg-green-100 text-green-800' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  app.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                  app.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {app.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <select
                  value={app.status}
                  onChange={(e) => updateStatus.mutate({ id: app.id, status: e.target.value as any })}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="contacted">Contacted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PuppyManagement() {
  const { data: puppies, isLoading } = trpc.puppies.list.useQuery();
  const updatePuppy = trpc.admin.puppies.update.useMutation({
    onSuccess: () => {
      toast.success('Puppy updated');
      utils.puppies.list.invalidate();
    },
  });
  const utils = trpc.useUtils();

  if (isLoading) {
    return <div className="text-center py-12 text-[#3D2B1F]/40">Loading puppies...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {puppies?.map((puppy: any) => (
        <div key={puppy.id} className="border border-[#3D2B1F]/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            {puppy.photos[0] && (
              <img src={puppy.photos[0].url} alt={puppy.name} className="w-12 h-12 rounded-full object-cover" />
            )}
            <div>
              <h3 className="font-semibold text-[#3D2B1F]">{puppy.name}</h3>
              <p className="text-xs text-[#3D2B1F]/50">{puppy.coat}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#3D2B1F]/50">Status:</label>
            <select
              value={puppy.status}
              onChange={(e) => updatePuppy.mutate({ id: puppy.id, status: e.target.value as any })}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>
          <p className="text-xs text-[#3D2B1F]/40 mt-2">
            Current weight: {puppy.currentWeightGrams}g
          </p>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState<'applications' | 'puppies'>('applications');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#3D2B1F] mb-6">Admin Dashboard</h1>

        <div className="flex gap-4 mb-6 border-b border-[#3D2B1F]/10">
          <button
            onClick={() => setTab('applications')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'applications'
                ? 'text-[#3D2B1F] border-b-2 border-[#3D2B1F]'
                : 'text-[#3D2B1F]/40 hover:text-[#3D2B1F]/60'
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setTab('puppies')}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === 'puppies'
                ? 'text-[#3D2B1F] border-b-2 border-[#3D2B1F]'
                : 'text-[#3D2B1F]/40 hover:text-[#3D2B1F]/60'
            }`}
          >
            Puppies
          </button>
        </div>

        {tab === 'applications' ? <ApplicationsTable /> : <PuppyManagement />}
      </div>
    </DashboardLayout>
  );
}
