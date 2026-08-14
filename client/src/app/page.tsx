import Navbar from "@/components/Navbar";
import { 
  Bot, Zap, Shield, Search, 
  MessageSquare, ChevronRight, CheckCircle2,
  Cpu, Workflow, BarChart
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden relative selection:bg-blue-500/30">
      <Navbar />
      
      {/* Performant Background Gradients (No CSS Blur) */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none -z-10"></div>
      
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex flex-col items-center justify-center min-h-[85vh] text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-medium text-gray-300">v2.0 is now live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          <span className="block text-gray-300">Intelligent Support,</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 pb-2">
            Resolved Instantly.
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-12">
          Experience the next generation of IT service desk powered by AI. Submit your issues in natural language and let our intelligent agents analyze, prioritize, and resolve them efficiently.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer flex items-center gap-2 justify-center">
            Get Started <ChevronRight size={18} />
          </button>
          <button className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all cursor-pointer">
            View Demo
          </button>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/10 bg-black/20 rounded-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white mb-2">99<span className="text-blue-500">%</span></span>
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Resolution Rate</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white mb-2">10<span className="text-purple-500">x</span></span>
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Faster Triage</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white mb-2">24<span className="text-emerald-500">/7</span></span>
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Automated</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white mb-2">5<span className="text-blue-400">M+</span></span>
            <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Issues Fixed</span>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 relative z-10 bg-gradient-to-b from-transparent to-[#111]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            We bridge legacy IT workflows to an <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Autonomous Future</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg">
            Empowering enterprises with generative AI to eliminate bottlenecks, reduce operational costs, and deliver instant employee satisfaction.
          </p>
        </div>
      </section>

      {/* Zig-Zag Feature Blocks */}
      <section className="py-24 relative z-10 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Feature 1: Text Left, Mockup Right */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="text-blue-400 font-semibold tracking-wider uppercase text-sm">Conversational UI</div>
              <h3 className="text-3xl md:text-4xl font-bold">Natural Language Chatbot for Instant Resolution</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Employees simply describe their issues in plain English. The AI understands intent, gathers missing context, and immediately provides solutions or escalates to the right team.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-300">Understands technical jargon and vague descriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-300">Context-aware multi-turn conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-300">24/7 availability across all time zones</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-4 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="space-y-4 text-sm font-mono pb-2">
                  <div className="bg-white/5 p-3 rounded-lg w-[80%] text-gray-300">User: I cannot access the staging database.</div>
                  <div className="bg-blue-900/30 p-3 rounded-lg w-[80%] ml-auto text-blue-200 border border-blue-500/20">Agent: I see you are not in the `dev-ops` group. Requesting automated approval from your manager...</div>
                  <div className="bg-blue-900/30 p-3 rounded-lg w-[80%] ml-auto text-emerald-400 border border-emerald-500/20">Agent: Approval granted. Temporary access provisioned for 2 hours.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Mockup Left, Text Right */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="text-purple-400 font-semibold tracking-wider uppercase text-sm">Automated Routing</div>
              <h3 className="text-3xl md:text-4xl font-bold">Intelligent Ticket Classification & Dispatch</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                No more manual triage. Our models instantly categorize tickets, assign priority levels, and route them to the specialized support tier perfectly equipped to handle the task.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-300">Deep integration with Jira Service Desk</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-300">Dynamic priority assignment based on urgency</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-purple-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-300">Auto-population of ticket metadata fields</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-semibold">Incoming Queue</div>
                  <div className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">Auto-Triage Active</div>
                </div>
                <div className="space-y-3">
                  {[
                    { id: "IT-4092", title: "VPN connection dropping constantly", status: "Network", priority: "High" },
                    { id: "IT-4093", title: "Need Adobe CC license for new project", status: "Software", priority: "Low" },
                    { id: "IT-4094", title: "Laptop screen flickering after update", status: "Hardware", priority: "Medium" }
                  ].map((ticket, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5 text-sm">
                      <div className="flex gap-4">
                        <span className="text-gray-500">{ticket.id}</span>
                        <span className="truncate w-48">{ticket.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{ticket.status}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${ticket.priority === 'High' ? 'bg-red-500/20 text-red-300' : ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>{ticket.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Services Section (Grid) */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Capabilities</h2>
            <p className="text-gray-400 text-lg">Everything you need to automate your IT infrastructure.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Bot size={24} />, title: "AI Agent", items: ["Semantic Search", "Auto-Resolution", "Conversational UX"] },
              { icon: <Workflow size={24} />, title: "Workflows", items: ["Jira Integration", "Approval Chains", "Custom Triggers"] },
              { icon: <Cpu size={24} />, title: "Infrastructure", items: ["Vector Database", "Redis Caching", "Scalable Microservices"] },
              { icon: <BarChart size={24} />, title: "Analytics", items: ["Resolution Rates", "Agent Performance", "Anomaly Detection"] }
            ].map((service, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6 text-white">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                      <ChevronRight size={14} className="text-emerald-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Giant CTA Section */}
      <section className="py-24 relative z-10 px-4">
        <div className="max-w-5xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-[#0a0a0a] border border-white/20 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Transform Your IT Desk?</h2>
            <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
              Join forward-thinking enterprises that have automated their internal support and achieved unprecedented efficiency.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-10 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 transition-transform transform hover:scale-105 cursor-pointer">
                Start Your Free Trial
              </button>
              <button className="px-10 py-4 rounded-full bg-black/30 border border-white/20 text-white font-bold text-lg hover:bg-black/50 transition-colors cursor-pointer">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 block mb-4">
                DigiPlus Desk
              </span>
              <p className="text-gray-400 text-sm mb-6">
                Next-generation IT service automation powered by generative AI.
              </p>
              <div className="flex gap-4 text-gray-400">
                <a href="#" className="hover:text-white transition-colors text-sm font-medium">Twitter</a>
                <a href="#" className="hover:text-white transition-colors text-sm font-medium">GitHub</a>
                <a href="#" className="hover:text-white transition-colors text-sm font-medium">LinkedIn</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div>&copy; 2026 DigiPlus IT. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
