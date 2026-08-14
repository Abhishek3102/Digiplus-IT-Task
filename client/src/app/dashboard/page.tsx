import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { PlusCircle, Ticket as TicketIcon } from "lucide-react";
import { redirect } from "next/navigation";

async function getTickets() {
  const { getToken } = await auth();
  const token = await getToken();
  
  if (!token) return [];
  
  const backendUrl = process.env.API_URL || "http://localhost:8000";
  
  try {
    const res = await fetch(`${backendUrl}/tickets/`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store", 
    });
    
    if (!res.ok) {
      console.error("Failed to fetch tickets");
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  
  if (role === 'admin') {
    redirect('/admin');
  } else if (role === 'worker') {
    redirect('/department');
  }

  const tickets = await getTickets();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Tickets</h1>
          <p className="text-gray-400 mt-1">Manage and track your support requests.</p>
        </div>
        <Link 
          href="/dashboard/tickets/new" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <PlusCircle size={20} />
          New Ticket
        </Link>
      </div>
      
      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 border-dashed">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
          <p className="text-gray-400 mb-6">You haven't submitted any support requests yet.</p>
          <Link 
            href="/dashboard/tickets/new" 
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Create your first ticket &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket: any) => (
            <Link 
              href={`/dashboard/tickets/${ticket._id}`} 
              key={ticket._id}
              className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2 max-w-2xl">
                    {ticket.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                    ticket.status === 'open' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {ticket.status === 'pending_analysis' ? 'Analyzing...' : (ticket.status || 'Open').toUpperCase()}
                  </span>
                  
                  {ticket.analysis?.priority && (
                    <span className={`text-xs px-2 py-1 rounded border ${
                      ticket.analysis.priority === 'critical' ? 'border-red-500/50 text-red-400' :
                      ticket.analysis.priority === 'high' ? 'border-orange-500/50 text-orange-400' :
                      ticket.analysis.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                      'border-green-500/50 text-green-400'
                    }`}>
                      {ticket.analysis.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
