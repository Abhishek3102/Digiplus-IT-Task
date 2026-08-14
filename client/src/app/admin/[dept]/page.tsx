import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Ticket as TicketIcon } from "lucide-react";
import Navbar from "@/components/Navbar";

async function getDepartmentTickets(dept: string) {
  const { getToken } = await auth();
  const token = await getToken();
  
  if (!token) return [];
  
  const backendUrl = process.env.API_URL || "http://localhost:8000";
  
  try {
    const res = await fetch(`${backendUrl}/tickets/department/${dept}`, {
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

export default async function AdminDepartmentPage({ params }: { params: Promise<{ dept: string }> }) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  
  if (role !== 'admin') {
    redirect('/dashboard');
  }
  
  const { dept } = await params;
  const tickets = await getDepartmentTickets(dept);
  
  const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved');
  const unresolvedTickets = tickets.filter((t: any) => t.status !== 'resolved');

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="mb-8">
          <Link href="/admin" className="text-gray-400 hover:text-white mb-4 inline-block">
            &larr; Back to Admin Overview
          </Link>
          <h1 className="text-3xl font-bold capitalize">{dept.replace('-', ' ')} Department</h1>
          <p className="text-gray-400 mt-1">Viewing all tickets for this department.</p>
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
            <p className="text-gray-400 mb-6">This department currently has no tickets.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 border-b border-white/10 pb-2">Unresolved ({unresolvedTickets.length})</h2>
              {unresolvedTickets.length === 0 ? (
                <p className="text-gray-500 italic">No unresolved tickets.</p>
              ) : (
                <div className="grid gap-4">
                  {unresolvedTickets.map((ticket: any) => (
                    <Link 
                      href={`/dashboard/tickets/${ticket._id}`} 
                      key={ticket._id}
                      className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {ticket.title || ticket.issue}
                          </h3>
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2 max-w-2xl">
                            {ticket.description || "No description provided."}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'open' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {(ticket.status || 'Open').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4 text-emerald-400 border-b border-white/10 pb-2">Resolved ({resolvedTickets.length})</h2>
              {resolvedTickets.length === 0 ? (
                <p className="text-gray-500 italic">No resolved tickets.</p>
              ) : (
                <div className="grid gap-4">
                  {resolvedTickets.map((ticket: any) => (
                    <Link 
                      href={`/dashboard/tickets/${ticket._id}`} 
                      key={ticket._id}
                      className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group opacity-70"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {ticket.title || ticket.issue}
                          </h3>
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2 max-w-2xl">
                            {ticket.description || "No description provided."}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300">
                            RESOLVED
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
