"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function AcceptButton({ ticketId }: { ticketId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const res = await fetch(`${backendUrl}/tickets/${ticketId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        console.error("Failed to accept ticket");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAccept}
      disabled={isLoading}
      className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
    >
      {isLoading ? "Accepting..." : "Accept Ticket"}
    </button>
  );
}
