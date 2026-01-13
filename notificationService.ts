
import { Ticket, EmailLog } from '../types';
import { ADMIN_EMAIL_CC } from '../constants';

export const sendStatusUpdateEmail = (ticket: Ticket): EmailLog => {
  const log: EmailLog = {
    id: `email-${Date.now()}`,
    to: ticket.requesterEmail,
    cc: ADMIN_EMAIL_CC,
    subject: `Maintenance Request Resolved - ${ticket.id}`,
    body: `Your maintenance request regarding [${ticket.description.substring(0, 30)}${ticket.description.length > 30 ? '...' : ''}] has been resolved.`,
    timestamp: new Date().toISOString()
  };
  
  console.log('--- EMAIL SENT ---');
  console.log(`To: ${log.to}`);
  console.log(`CC: ${log.cc}`);
  console.log(`Subject: ${log.subject}`);
  console.log(`Body: ${log.body}`);
  console.log('------------------');

  return log;
};
