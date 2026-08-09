"use client";

import { useState } from "react";
import { Search, UserRound, MessageCircle, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteClient, updateClient } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
}

export function ClientsAdmin({ initialClients }: { initialClients: Client[] }) {
  const [allClients, setAllClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);
  const query = search.toLowerCase().trim();
  const clients = allClients.filter((client) =>
    !query ||
    client.name.toLowerCase().includes(query) ||
    client.phone.toLowerCase().includes(query)
  );

  function openEdit(client: Client) {
    setEditing(client);
    setForm({ name: client.name, phone: client.phone, email: client.email ?? "" });
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setIsSaving(true);
    const result = await updateClient(editing.id, form);
    setIsSaving(false);

    if (!result.success || !result.client) {
      toast.error(result.error ?? "Erreur lors de la modification");
      return;
    }

    setAllClients((current) => current.map((client) =>
      client.id === editing.id
        ? { ...client, ...result.client, orderCount: client.orderCount }
        : client
    ));
    setEditing(null);
    toast.success("Client modifié");
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Supprimer la fiche de ${client.name} ? Les commandes seront conservées.`)) return;
    const result = await deleteClient(client.id);
    if (!result.success) {
      toast.error(result.error ?? "Erreur lors de la suppression");
      return;
    }
    setAllClients((current) => current.filter((item) => item.id !== client.id));
    toast.success("Client supprimé");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-black">Clients</h1>
          <p className="text-gray-500 text-sm">{allClients.length} client(s) enregistré(s)</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un client..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <UserRound className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Aucun client trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-4">Nom</th>
                  <th className="px-5 py-4">Numéro</th>
                  <th className="px-5 py-4">Commandes</th>
                  <th className="px-5 py-4">Ajouté le</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-black">{client.name}</p>
                      {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{client.phone}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6500] text-xs font-bold">
                        {client.orderCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(client.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Contacter ${client.name} sur WhatsApp`}
                          title="Contacter sur WhatsApp"
                          className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-green-50 text-[#25D366] hover:bg-green-100"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEdit(client)}
                          aria-label={`Modifier ${client.name}`}
                          title="Modifier"
                          className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-orange-50 text-[#FF6500] hover:bg-orange-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client)}
                          aria-label={`Supprimer ${client.name}`}
                          title="Supprimer"
                          className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg text-black">Modifier le client</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Fermer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nom *</label>
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Numéro *</label>
                <input
                  required
                  minLength={8}
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF6500] focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-[#FF6500] text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}