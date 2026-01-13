
import React, { useState } from 'react';
import { Ticket } from '../types';
import { ISSUE_TYPES } from '../constants';

interface StudentFormProps {
  onSubmit: (ticket: Omit<Ticket, 'id' | 'status' | 'dateSubmitted'>) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    requesterEmail: '',
    location: '',
    issueTypes: [] as string[],
    description: '',
    entryAuthorized: null as boolean | null,
    photoUrl: '',
    requesterName: '',
    whatsappNumber: '',
  });

  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const toggleIssueType = (type: string) => {
    setFormData(prev => {
      const current = prev.issueTypes;
      if (current.includes(type)) {
        return { ...prev, issueTypes: current.filter(t => t !== type) };
      } else {
        return { ...prev, issueTypes: [...current, type] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidationError = validateEmail(formData.requesterEmail);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    if (!formData.whatsappNumber.trim()) {
      alert("WhatsApp number is required so we can contact you about the repair.");
      return;
    }

    if (formData.issueTypes.length === 0) {
      alert("Please select at least one issue category.");
      return;
    }

    if (formData.entryAuthorized === null) {
      alert("Please answer the authorization question.");
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(formData as Omit<Ticket, 'id' | 'status' | 'dateSubmitted'>);
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({
        requesterEmail: '',
        location: '',
        issueTypes: [],
        description: '',
        entryAuthorized: null,
        photoUrl: '',
        requesterName: '',
        whatsappNumber: '',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="bg-[#003057] p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Maintenance Request</h2>
        <p className="text-blue-100 text-sm">YU Israel Campus Infrastructure Management</p>
      </div>

      {showSuccess ? (
        <div className="p-16 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Request Sent!</h3>
          <p className="text-slate-500 mb-8">Thank you. The team has been notified.</p>
          <button onClick={() => setShowSuccess(false)} className="bg-[#003057] text-white px-8 py-3 rounded-xl font-bold">Submit Another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.requesterName} onChange={e => setFormData(prev => ({ ...prev, requesterName: e.target.value }))} />
            </section>
            <section>
              <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number <span className="text-red-500">*</span></label>
              <input required type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.whatsappNumber} onChange={e => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))} placeholder="+972..." />
            </section>
          </div>

          <section>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-red-500">*</span></label>
            <input required type="email" className={`w-full px-4 py-3 bg-slate-50 border rounded-xl ${emailError ? 'border-red-500' : 'border-slate-200'}`} value={formData.requesterEmail} onChange={e => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))} />
          </section>

          <section>
            <label className="block text-sm font-bold text-slate-700 mb-1">Location <span className="text-red-500">*</span></label>
            <p className="text-xs text-slate-500 mb-2">e.g. Apt 40</p>
            <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} />
          </section>

          <section>
            <label className="block text-sm font-bold text-slate-700 mb-3">Issue Category <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {ISSUE_TYPES.map(type => (
                <label key={type} className={`flex items-center p-3 rounded-xl border-2 cursor-pointer ${formData.issueTypes.includes(type) ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                  <input type="checkbox" className="hidden" checked={formData.issueTypes.includes(type)} onChange={() => toggleIssueType(type)} />
                  <span className="text-sm font-semibold">{type}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-sm font-bold text-slate-700 mb-2">Specific Details <span className="text-red-500">*</span></label>
            <textarea required rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
          </section>

          <section>
            <label className="block text-sm font-bold text-slate-700 mb-3">Authorize entry if you are away? <span className="text-red-500">*</span></label>
            <div className="flex space-x-4">
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, entryAuthorized: true }))} className={`flex-1 p-4 rounded-xl border-2 font-bold ${formData.entryAuthorized === true ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}>YES</button>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, entryAuthorized: false }))} className={`flex-1 p-4 rounded-xl border-2 font-bold ${formData.entryAuthorized === false ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}>NO</button>
            </div>
          </section>

          <section>
            <label className="block text-sm font-bold text-slate-700 mb-2">Photo (Optional)</label>
            <input type="file" className="w-full text-sm" onChange={handleFileChange} accept="image/*" />
          </section>

          <button disabled={isSubmitting} type="submit" className="w-full bg-[#003057] text-white font-bold py-4 rounded-xl shadow-lg">
            {isSubmitting ? 'Processing...' : 'Submit Request'}
          </button>
        </form>
      )}
    </div>
  );
};

export default StudentForm;
