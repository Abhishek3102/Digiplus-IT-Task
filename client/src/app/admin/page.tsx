import React from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default async function AdminDashboard() {
  const user = await currentUser();
  
  // Basic RBAC checking
  const role = user?.publicMetadata?.role;
  
  if (role !== 'admin') {
    redirect('/dashboard');
  }

  // Hardcoded mockup data as requested, fetching from real DB would happen here
  const departments = [
    { name: "Network", workers: 2, resolved: 145, pending: 12 },
    { name: "Identity", workers: 2, resolved: 89, pending: 4 },
    { name: "Endpoint", workers: 2, resolved: 312, pending: 45 },
    { name: "Business Apps", workers: 2, resolved: 56, pending: 8 },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Admin Overview
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Monitor department efficiency and worker resolution rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {departments.map((dept) => (
            <Link href={`/admin/${dept.name.toLowerCase().replace(' ', '-')}`} key={dept.name} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">{dept.name}</h3>
              <div className="text-zinc-400 text-sm mb-4">{dept.workers} Active Workers</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{dept.resolved}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Resolved</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-400">{dept.pending}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Pending</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
