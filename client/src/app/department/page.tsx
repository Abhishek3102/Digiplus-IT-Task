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

export default async function DepartmentPage() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const dept = user?.publicMetadata?.department as string | undefined;
  
  if (role !== 'worker' || !dept) {
    redirect('/dashboard');
  }

  const tickets = await getDepartmentTickets(dept);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold capitalize">{dept} Department</h1>
            <p className="text-gray-400 mt-1">Manage and resolve issues assigned to your team.</p>
          </div>
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
            <p className="text-gray-400 mb-6">Your department currently has no assigned tickets.</p>
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
                      {ticket.title || ticket.issue}
                    </h3>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2 max-w-2xl">
                      {ticket.description || "No description provided."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
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
    </main>
  );
}
