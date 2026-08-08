"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { markMessageRead, deleteMessage } from "@/actions/admin";
import type { ContactMessage } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function MessagesAdmin({ initialData }: { initialData: ContactMessage[] }) {
  const [messages, setMessages] = useState(initialData);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  async function handleRead(id: string) {
    const result = await markMessageRead(id);
    if (result.success) {
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: "READ" as const } : m));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    const result = await deleteMessage(id);
    if (result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Message supprimé");
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-black">Messages clients</h1>
        <p className="text-gray-500 text-sm">{messages.filter((m) => m.status === "UNREAD").length} non lu(s)</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Aucun message</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => { setSelected(msg); if (msg.status === "UNREAD") handleRead(msg.id); }}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === msg.id ? "bg-orange-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {msg.status === "UNREAD" ? (
                      <Mail className="w-4 h-4 text-[#FF6500] mt-0.5 flex-shrink-0" />
                    ) : (
                      <MailOpen className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${msg.status === "UNREAD" ? "text-black" : "text-gray-500"}`}>
                        {msg.name}
                      </p>
                      <p className="text-xs text-gray-400">{msg.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatDateTime(msg.createdAt)}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="mb-4">
              <h2 className="font-black text-black text-lg">{selected.subject}</h2>
              <p className="text-sm text-gray-500">{formatDateTime(selected.createdAt)}</p>
            </div>
            <div className="space-y-3 mb-5 text-sm">
              <div><span className="font-semibold text-gray-500">Nom : </span><span>{selected.name}</span></div>
              <div><span className="font-semibold text-gray-500">Téléphone : </span><span>{selected.phone}</span></div>
              {selected.email && <div><span className="font-semibold text-gray-500">Email : </span><span>{selected.email}</span></div>}
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="flex gap-3 mt-5">
              <a
                href={`https://wa.me/${selected.phone.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white text-center py-2.5 rounded-xl text-sm font-semibold"
              >
                Répondre sur WhatsApp
              </a>
              <button onClick={() => handleDelete(selected.id)} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold">
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
            Sélectionnez un message pour le lire
          </div>
        )}
      </div>
    </div>
  );
}
