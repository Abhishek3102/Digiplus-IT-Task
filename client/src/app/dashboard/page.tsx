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
          {tickets.map((ticket: any) => {
            const ticketId = ticket.id || ticket._id;
            return (
              <Link 
                href={`/dashboard/tickets/${ticketId}`} 
                key={ticketId}
                className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group relative"
              >
                {ticket.department && (
                  <div className="absolute top-4 right-4 bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {ticket.department}
                  </div>
                )}
                {ticket.created_at && (
                  <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                    {new Date(ticket.created_at).toLocaleString()}
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-16 pb-4">
                    <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
