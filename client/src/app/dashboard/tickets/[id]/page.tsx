import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import AcceptButton from "@/components/AcceptButton";

async function getTicket(id: string) {
  const { getToken } = await auth();
  const token = await getToken();
  
  if (!token) return null;
  
  const backendUrl = process.env.API_URL || "http://localhost:8000";
  
  try {
    const res = await fetch(`${backendUrl}/tickets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store", // We could use Next.js revalidation here or SSE for real-time
    });
    
    console.log(`Fetch ticket ${id} status:`, res.status);
    
    if (!res.ok) {
      const text = await res.text();
      console.log(`Fetch ticket ${id} error body:`, text);
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch ticket: ${text}`);
    }
    
    return res.json();
  } catch (error: any) {
    console.error("Error fetching ticket:", error);
    return { error: error.message || String(error) };
  }
}

export default async function TicketDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const isWorker = role === 'worker';
  
  const ticket = await getTicket(params.id);
  
  if (!ticket) {
    return <div className="p-20 text-white">Ticket not found or error loading. ID: {params.id}</div>;
  }
  if (ticket.error) {
    return <div className="p-20 text-white">Error: {ticket.error} - ID: {params.id}</div>;
  }

  const isPending = ticket.status === "pending_analysis";

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <div className="flex items-center gap-3">
                {ticket.assignee_email && (
                  <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Assignee: <span className="text-white">{ticket.assignee_email}</span>
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                      ticket.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                      ticket.status === 'open' ? 'bg-blue-500/20 text-blue-300' :
                      ticket.status === 'in_progress' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                  {isPending ? 'Analyzing...' : ticket.status}
                </span>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
            </div>
            
            {isWorker && (ticket.status === 'open' || ticket.status === 'pending_analysis') && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <AcceptButton ticketId={ticket.id || ticket._id} />
              </div>
            )}
            
            {ticket.jira_issue_key && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Jira Tracking:</span>
                <a 
                  href={`https://support-digi-it.atlassian.net/browse/${ticket.jira_issue_key}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {ticket.jira_issue_key}
                </a>
              </div>
            )}
          </div>

          {/* Resolution Suggestions */}
          {!isPending && ticket.suggestions && (
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                AI Resolution Steps
              </h2>
              <div className="prose prose-invert prose-blue max-w-none">
                <ReactMarkdown>{ticket.suggestions}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Analysis Panel */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">AI Analysis</h2>
            
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm">Analyzing ticket details...</p>
                <p className="text-xs mt-1 text-center">Finding similar issues and generating solutions.</p>
              </div>
            ) : ticket.analysis ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Category</span>
                  <span className="text-sm bg-white/10 px-2 py-1 rounded">{ticket.analysis.category}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Priority</span>
                  <span className={`text-sm px-2 py-1 rounded border ${
                      ticket.analysis.priority === 'critical' ? 'border-red-500/50 text-red-400' :
                      ticket.analysis.priority === 'high' ? 'border-orange-500/50 text-orange-400' :
                      ticket.analysis.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                      'border-green-500/50 text-green-400'
                    }`}>
                    {ticket.analysis.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Affected System</span>
                  <span className="text-sm text-gray-300">{ticket.analysis.affected_system}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {ticket.analysis.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-full text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Analysis unavailable.</p>
            )}
          </div>
          
          {/* Similar Tickets Panel */}
          {!isPending && ticket.similar_tickets && ticket.similar_tickets.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Similar Past Issues</h2>
              <ul className="space-y-3">
                {ticket.similar_tickets.map((stId: string) => (
                  <li key={stId}>
                    <Link href={`/dashboard/tickets/${stId}`} className="text-sm text-blue-400 hover:underline block truncate">
                      View Ticket #{stId.slice(-6)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
