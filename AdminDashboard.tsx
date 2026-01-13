
import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus } from '../types';
import TicketCard from './TicketCard';

interface AdminDashboardProps {
  tickets: Ticket[];
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => void;
  adminPasscode: string;
  onUpdatePasscode: (newPasscode: string) => void;
  staffMembers: string[];
  onUpdateStaff: (staff: string[]) => void;
  lastSaved?: string | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  tickets, onUpdateTicket, adminPasscode, onUpdatePasscode, staffMembers, onUpdateStaff, lastSaved
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'settings'>('queue');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const isCorrectTab = activeTab === 'history' ? t.status === TicketStatus.Done : t.status !== TicketStatus.Done;
      const matchesSearch = t.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) || t.location.toLowerCase().includes(searchTerm.toLowerCase());
      return isCorrectTab && matchesSearch;
    });
  }, [tickets, activeTab, searchTerm]);

  const handleExportCSV = () => {
    const history = tickets.filter(t => t.status === TicketStatus.Done);
    if (history.length === 0) return alert("Nothing to export yet!");

    const headers = "ID,Name,Email,WhatsApp,Location,Description,Worker,Date\n";
    const rows = history.map(t => `${t.id},${t.requesterName},${t.requesterEmail},${t.whatsappNumber},${t.location},"${t.description}",${t.assignedWorker},${t.dateSubmitted}`).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Maintenance_History.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Portal</h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button onClick={() => setActiveTab('queue')} className={`px-4 py-2 rounded-md ${activeTab === 'queue' ? 'bg-white shadow' : ''}`}>Queue</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md ${activeTab === 'history' ? 'bg-white shadow' : ''}`}>History</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-white shadow' : ''}`}>Settings</button>
        </div>
      </div>

      {activeTab === 'history' && (
        <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export History to Excel (CSV)
        </button>
      )}

      <input type="text" placeholder="Search by name or room..." className="w-full p-3 border rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} onUpdate={onUpdateTicket} staffMembers={staffMembers} readOnly={activeTab === 'history'} />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
