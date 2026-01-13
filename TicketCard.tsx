
import React, { useEffect, useState } from 'react';
import { Ticket, TicketStatus } from '../types';
import { GoogleGenAI } from "@google/genai";

interface TicketCardProps {
  ticket: Ticket;
  onUpdate: (id: string, updates: Partial<Ticket>) => void;
  readOnly?: boolean;
  staffMembers: string[];
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onUpdate, readOnly, staffMembers }) => {
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!ticket.hebrewTranslation && !isTranslating && ticket.description) {
      autoTranslate();
    }
  }, [ticket.id, ticket.description, ticket.issueTypes]);

  const autoTranslate = async () => {
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Location: ${ticket.location}\nIssue Types: ${ticket.issueTypes.join(', ')}\nDescription: ${ticket.description}\nEntry Authorized: ${ticket.entryAuthorized ? 'Yes' : 'No'}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: 'You are a professional Hebrew translator for a facility management team in Israel. Translate the following maintenance issue categories, location, entry authorization status, and specific description into natural, technical, and clear Hebrew. Format the output to be easily readable by a maintenance worker. Only provide the translation text.',
        }
      });

      const translatedText = response.text?.trim();
      if (translatedText) {
        onUpdate(ticket.id, { hebrewTranslation: translatedText });
      }
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.New: return 'bg-blue-100 text-blue-700 border-blue-200';
      case TicketStatus.Assigned: return 'bg-amber-100 text-amber-700 border-amber-200';
      case TicketStatus.InProcess: return 'bg-purple-100 text-purple-700 border-purple-200';
      case TicketStatus.PartsOrdered: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case TicketStatus.Done: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleStatusClick = (status: TicketStatus) => {
    onUpdate(ticket.id, { 
      status, 
      dateCompleted: status === TicketStatus.Done ? new Date().toISOString() : undefined 
    });
  };

  const handleReset = () => {
    onUpdate(ticket.id, {
      status: TicketStatus.New,
      assignedWorker: undefined,
      dateCompleted: undefined
    });
  };

  const handleReopen = () => {
    onUpdate(ticket.id, {
      status: ticket.assignedWorker ? TicketStatus.InProcess : TicketStatus.New,
      dateCompleted: undefined
    });
  };

  const cleanPhone = ticket.whatsappNumber?.replace(/[^0-9]/g, '') || '';
  const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
  const telLink = cleanPhone ? `tel:${cleanPhone}` : null;
  const mailLink = `mailto:${ticket.requesterEmail}?subject=Maintenance Request Update: ${ticket.id}`;

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${readOnly ? 'border-slate-100 opacity-95' : 'border-slate-200'} p-5 transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.id}</span>
          </div>
          <h4 className="font-bold text-slate-800 leading-tight">{ticket.requesterName}</h4>
          <div className="flex flex-col mt-1 space-y-1">
            <p className="text-xs text-slate-500 font-semibold">{ticket.location}</p>
            
            {/* Contact Actions Row */}
            <div className="flex items-center space-x-3 mt-1 pt-1">
              {whatsappLink && (
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center text-[10px] font-bold text-green-600 hover:text-green-700 transition-colors uppercase tracking-wider"
                  title="WhatsApp Chat"
                >
                  <svg className="w-3.5 h-3.5 mr-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 1.025 3.75 1.564 5.715 1.565h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Chat</span>
                </a>
              )}
              {telLink && (
                <a 
                  href={telLink} 
                  className="group flex items-center text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
                  title="Call Resident"
                >
                  <svg className="w-3.5 h-3.5 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call</span>
                </a>
              )}
              <a 
                href={mailLink} 
                className="group flex items-center text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider"
                title="Send Email"
              >
                <svg className="w-3.5 h-3.5 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Submitted</span>
          <span className="text-xs font-bold text-slate-600">{new Date(ticket.dateSubmitted).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {ticket.issueTypes.map(type => (
            <span key={type} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase border border-slate-200">
              {type}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-2 mb-2">
           <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ticket.entryAuthorized ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
            Entry Authorized: {ticket.entryAuthorized ? 'YES' : 'NO'}
          </span>
        </div>
        <p className="text-sm text-slate-600 italic bg-slate-50/50 p-2 rounded border border-slate-100">"{ticket.description}"</p>
      </div>

      {/* Hebrew Section */}
      <div className="mb-4 p-3 bg-blue-50/30 border border-blue-100 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Maintenance Instructions (HE)
          </span>
          {isTranslating && (
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          )}
        </div>
        
        {ticket.hebrewTranslation ? (
          <p className="text-sm font-bold text-slate-800 leading-relaxed" dir="rtl">
            {ticket.hebrewTranslation}
          </p>
        ) : isTranslating ? (
          <p className="text-[10px] text-slate-400 animate-pulse font-medium">Processing Hebrew briefing...</p>
        ) : (
          <p className="text-xs text-red-400">Translation unavailable.</p>
        )}
      </div>

      {ticket.photoUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-50">
          <img src={ticket.photoUrl} alt="Issue" className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform" />
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned Worker</label>
            {readOnly ? (
              <span className="text-sm text-slate-700 font-bold">{ticket.assignedWorker || 'Unassigned'}</span>
            ) : (
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                value={ticket.assignedWorker || ''}
                onChange={e => onUpdate(ticket.id, { assignedWorker: e.target.value, status: ticket.status === TicketStatus.New ? TicketStatus.Assigned : ticket.status })}
              >
                <option value="">Unassigned</option>
                {staffMembers.map(staff => <option key={staff} value={staff}>{staff}</option>)}
              </select>
            )}
          </div>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary Action Buttons */}
              {(ticket.status === TicketStatus.New || ticket.status === TicketStatus.Assigned) && (
                <button 
                  onClick={() => handleStatusClick(TicketStatus.InProcess)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                >
                  START WORK
                </button>
              )}
              
              {(ticket.status === TicketStatus.InProcess || ticket.status === TicketStatus.Assigned) && (
                <button 
                  onClick={() => handleStatusClick(TicketStatus.PartsOrdered)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                >
                  ORDERED PIECE
                </button>
              )}

              {ticket.status === TicketStatus.PartsOrdered && (
                <button 
                  onClick={() => handleStatusClick(TicketStatus.InProcess)}
                  className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition-all shadow-sm active:scale-95"
                >
                  RESUME WORK
                </button>
              )}

              {(ticket.status === TicketStatus.InProcess || ticket.status === TicketStatus.PartsOrdered) && (
                <button 
                  onClick={() => handleStatusClick(TicketStatus.Done)}
                  className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-all shadow-md active:scale-95"
                >
                  MARK DONE
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          {readOnly ? (
            <div className="flex items-center justify-between w-full">
               <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Resolved On</span>
                <span className="text-xs font-bold text-green-600">{new Date(ticket.dateCompleted!).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={handleReopen}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-bold rounded-lg transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>REOPEN TICKET</span>
              </button>
            </div>
          ) : (
            <>
              {ticket.status !== TicketStatus.New && (
                <button 
                  onClick={handleReset}
                  className="flex items-center space-x-1 text-[9px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                  title="Unassign worker and move back to New status"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset & Unassign</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
