
import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, UserRole, TicketStatus, EmailLog } from './types';
import { sendStatusUpdateEmail } from './services/notificationService';
import Layout from './components/Layout';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import { STAFF_MEMBERS as INITIAL_STAFF } from './constants';

const DEFAULT_PASSCODE = 'YU2025';
const STORAGE_KEYS = {
  TICKETS: 'yu_israel_maint_tickets_v1',
  PASSCODE: 'yu_israel_maint_passcode_v1',
  STAFF: 'yu_israel_maint_staff_v1'
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.ResidentStudent);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Initialize Admin Passcode
  const [adminPasscode, setAdminPasscode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.PASSCODE) || DEFAULT_PASSCODE;
    } catch (e) {
      return DEFAULT_PASSCODE;
    }
  });

  // Initialize Staff Members
  const [staffMembers, setStaffMembers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch (e) {
      return INITIAL_STAFF;
    }
  });

  // Initialize Tickets
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    return [
      {
        id: 'TKT-1001',
        requesterName: 'Ariel Goldberg',
        requesterEmail: 'ariel.g@mail.yu.edu',
        whatsappNumber: '+972501234567',
        location: 'Gruss Campus, Room 204',
        issueTypes: ['Air conditioner', 'Electricity'],
        description: 'AC is leaking water onto the electrical socket.',
        entryAuthorized: true,
        status: TicketStatus.New,
        dateSubmitted: new Date(Date.now() - 3600000).toISOString(),
      }
    ];
  });

  const [notifications, setNotifications] = useState<EmailLog[]>([]);

  // Robust Save Function
  const saveToStorage = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      setLastSaved(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e);
    }
  }, []);

  // Sync state to storage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TICKETS, tickets);
  }, [tickets, saveToStorage]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PASSCODE, adminPasscode);
  }, [adminPasscode, saveToStorage]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STAFF, staffMembers);
  }, [staffMembers, saveToStorage]);

  const toggleRole = () => {
    if (role === UserRole.ResidentStudent) {
      setIsAuthModalOpen(true);
    } else {
      setRole(UserRole.ResidentStudent);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === adminPasscode) {
      setRole(UserRole.Admin);
      setIsAuthModalOpen(false);
      setPasscodeInput('');
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasscodeInput('');
    }
  };

  const handleCreateTicket = (newTicket: Omit<Ticket, 'id' | 'status' | 'dateSubmitted'>) => {
    const ticket: Ticket = {
      ...newTicket,
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: TicketStatus.New,
      dateSubmitted: new Date().toISOString()
    };
    setTickets(prev => [ticket, ...prev]);
  };

  const handleUpdateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        if (updates.status === TicketStatus.Done && t.status !== TicketStatus.Done) {
          const log = sendStatusUpdateEmail(updated);
          setNotifications(prevNotif => [log, ...prevNotif]);
        }
        return updated;
      }
      return t;
    }));
  };

  return (
    <Layout userRole={role} onToggleRole={toggleRole}>
      <div className="relative">
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-[#003057] p-6 text-white text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Admin Authorization</h3>
                <p className="text-blue-200 text-xs">Enter your staff passcode to continue.</p>
              </div>
              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                <div>
                  <input
                    autoFocus
                    type="password"
                    placeholder="Enter Passcode"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-center text-xl font-mono tracking-[0.5em] outline-none transition-all ${
                      authError ? 'border-red-500 animate-shake bg-red-50' : 'border-slate-200 focus:border-blue-500'
                    }`}
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setAuthError(false);
                    }}
                  />
                  {authError && <p className="text-red-500 text-[10px] font-bold mt-2 text-center uppercase tracking-wider">Invalid Passcode</p>}
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setAuthError(false);
                      setPasscodeInput('');
                    }}
                    className="flex-1 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#003057] hover:bg-[#004b86] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Verify
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
          {notifications.slice(0, 3).map(n => (
            <div 
              key={n.id} 
              className="bg-slate-800 text-white p-4 rounded-lg shadow-2xl max-w-sm animate-in slide-in-from-right-full fade-in pointer-events-auto border border-slate-600"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-blue-400">Email Bot Triggered</h4>
                  <p className="text-xs font-semibold mt-1">Sent to: {n.to}</p>
                  <p className="text-[10px] text-slate-300 italic mt-1">{n.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {role === UserRole.ResidentStudent ? (
            <StudentForm onSubmit={handleCreateTicket} />
          ) : (
            <AdminDashboard 
              tickets={tickets} 
              onUpdateTicket={handleUpdateTicket}
              adminPasscode={adminPasscode}
              onUpdatePasscode={setAdminPasscode}
              staffMembers={staffMembers}
              onUpdateStaff={setStaffMembers}
              lastSaved={lastSaved}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
