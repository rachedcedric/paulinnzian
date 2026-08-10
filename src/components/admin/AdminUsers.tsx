"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createAdminUser, deleteAdminUser, updateAdminUser } from "@/actions/admin";
import type { AdminRole } from "@/lib/admin-permissions";

interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: Date | string;
}

const EMPTY_FORM = { email: "", name: "", password: "", role: "ADMIN" as AdminRole };

export function AdminUsers({ initialUsers }: { initialUsers: AdminUserItem[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [editing, setEditing] = useState<AdminUserItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(user: AdminUserItem) {
    setEditing(user);
    setForm({ email: user.email, name: user.name, password: "", role: user.role });
    setOpen(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const result = editing
      ? await updateAdminUser(editing.id, { name: form.name, role: form.role, password: form.password })
      : await createAdminUser(form);
    setSaving(false);

    if (!result.success || !result.user) {
      toast.error(result.error ?? "Erreur");
      return;
    }
    setUsers((current) => editing
      ? current.map((user) => user.id === editing.id ? { ...user, ...result.user } : user)
      : [...current, { ...result.user, createdAt: new Date() }]);
    setOpen(false);
    toast.success(editing ? "Compte modifié" : "Compte créé");
  }

  async function remove(user: AdminUserItem) {
    if (!confirm(`Supprimer le compte ${user.email} ?`)) return;
    const result = await deleteAdminUser(user.id);
    if (!result.success) {
      toast.error(result.error ?? "Erreur");
      return;
    }
    setUsers((current) => current.filter((item) => item.id !== user.id));
    toast.success("Compte supprimé");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-black">Administrateurs</h1>
          <p className="text-sm text-gray-500">Gérez les accès et les rôles.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-[#FF6500] px-5 py-2.5 font-semibold text-white">
          <Plus className="w-5 h-5" /> Ajouter
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr><th className="px-5 py-4">Nom</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Rôle</th><th className="px-5 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="px-5 py-4 font-semibold text-black">{user.name}</td>
                  <td className="px-5 py-4 text-gray-600">{user.email}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#FF6500]">{user.role}</span></td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(user)} aria-label="Modifier" className="p-2 text-gray-500"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(user)} aria-label="Supprimer" className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-black">{editing ? "Modifier le compte" : "Créer un compte"}</h2>
              <button onClick={() => setOpen(false)} aria-label="Fermer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="mb-1 block text-sm font-semibold">Nom</label><input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border px-3 py-2.5" /></div>
              <div><label className="mb-1 block text-sm font-semibold">Email</label><input required type="email" disabled={Boolean(editing)} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-lg border px-3 py-2.5 disabled:bg-gray-100" /></div>
              <div><label className="mb-1 block text-sm font-semibold">Rôle</label><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as AdminRole })} className="w-full rounded-lg border px-3 py-2.5"><option value="EDITOR">Éditeur</option><option value="ADMIN">Administrateur</option><option value="SUPER_ADMIN">Super administrateur</option></select></div>
              <div><label className="mb-1 block text-sm font-semibold">{editing ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}</label><input required={!editing} minLength={12} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-lg border px-3 py-2.5" /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border px-4 py-2.5 font-semibold">Annuler</button><button disabled={saving} className="flex-1 rounded-xl bg-[#FF6500] px-4 py-2.5 font-semibold text-white disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
