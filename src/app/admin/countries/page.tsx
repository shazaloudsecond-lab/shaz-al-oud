"use client";

import React, { useState, useEffect } from "react";
import { Country } from "@/lib/countries";
import AdminDeleteModal from "@/components/admin/AdminDeleteModal";

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete modal state
  const [deleteCountryModal, setDeleteCountryModal] = useState<{ isOpen: boolean; country: Country } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  // Fetch Countries
  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/countries");
      const data = await res.json();
      if (data.countries && Array.isArray(data.countries)) {
        setCountries(data.countries);
      } else {
        setCountries([]);
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const openCreateModal = () => {
    setEditingCountry(null);
    setName("");
    setCode("");
    setCurrencyName("");
    setCurrencyCode("");
    setCurrencySymbol("");
    setWhatsappNumber("");
    setIsActive(true);
    setIsDefault(countries.length === 0);
    setDisplayOrder(countries.length + 1);
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (country: Country) => {
    setEditingCountry(country);
    setName(country.name);
    setCode(country.code);
    setCurrencyName(country.currency_name || "");
    setCurrencyCode(country.currency_code);
    setCurrencySymbol(country.currency_symbol);
    setWhatsappNumber(country.whatsapp_number);
    setIsActive(country.is_active);
    setIsDefault(country.is_default);
    setDisplayOrder(country.display_order || 0);
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCountry(null);
  };

  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !currencyCode.trim() || !whatsappNumber.trim()) {
      setStatusMsg({
        type: "error",
        text: "Please fill in all required fields (Name, Country Code, Currency Code, WhatsApp Number).",
      });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        currency_name: currencyName.trim() || `${name.trim()} Currency`,
        currency_code: currencyCode.trim().toUpperCase(),
        currency_symbol: currencySymbol.trim() || currencyCode.trim().toUpperCase(),
        whatsapp_number: whatsappNumber.trim(),
        is_active: isActive,
        is_default: isDefault,
        display_order: displayOrder,
      };

      const url = "/api/admin/countries";
      const method = editingCountry ? "PUT" : "POST";
      const body = editingCountry ? { id: editingCountry.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to save country.");
      }

      setStatusMsg({
        type: "success",
        text: editingCountry ? "Country updated successfully!" : "Country added successfully!",
      });

      closeModal();
      await fetchCountries();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (country: Country) => {
    try {
      const res = await fetch("/api/admin/countries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: country.id,
          is_active: !country.is_active,
        }),
      });
      if (res.ok) {
        setCountries((prev) =>
          prev.map((c) => (c.id === country.id ? { ...c, is_active: !c.is_active } : c))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleSetDefault = async (country: Country) => {
    try {
      const res = await fetch("/api/admin/countries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: country.id,
          is_default: true,
          is_active: true,
        }),
      });
      if (res.ok) {
        setCountries((prev) =>
          prev.map((c) => ({
            ...c,
            is_default: c.id === country.id,
            is_active: c.id === country.id ? true : c.is_active,
          }))
        );
      }
    } catch (err) {
      console.error("Set default error:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCountryModal) return;
    const country = deleteCountryModal.country;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/countries?id=${country.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCountries((prev) => prev.filter((c) => c.id !== country.id));
        setStatusMsg({ type: "success", text: "Country deleted successfully." });
        setDeleteCountryModal(null);
      } else {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete.");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to delete country." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-light text-white tracking-wide flex items-center gap-2.5">
            <span className="p-1.5 bg-amber-400/10 text-amber-400 rounded-lg border border-amber-400/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Country Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage target countries, custom currencies, and dedicated WhatsApp order notification numbers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium text-xs rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Country
        </button>
      </div>

      {/* Status Alerts */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              : "bg-red-950/40 text-red-300 border-red-800/60"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Country Cards & Table */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-neutral-900/60 rounded-xl animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/40">
          <p className="text-neutral-400 text-xs">No countries configured yet.</p>
          <button
            onClick={openCreateModal}
            className="mt-3 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-lg transition-colors cursor-pointer"
          >
            Add Your First Country
          </button>
        </div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/90 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">WhatsApp Number</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Default</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {countries.map((c) => (
                  <tr key={c.id || c.code} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono font-bold text-[10px] text-amber-400 flex-shrink-0">
                          {c.code}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-white">{c.name}</div>
                          <div className="text-[10px] text-neutral-500">{c.currency_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-neutral-300">{c.code}</td>
                    <td className="py-3 px-4 font-mono text-xs text-amber-400 font-semibold">{c.currency_code}</td>
                    <td className="py-3 px-4 text-neutral-300 font-sans text-xs">{c.currency_symbol}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 text-xs">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-800/40 text-[11px]">
                        <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.815 2.796.815 3.183 0 5.765-2.587 5.765-5.766-.001-3.18-2.585-5.766-5.765-5.766zm9.969 5.766c0 5.498-4.471 9.969-9.969 9.969-1.721 0-3.332-.44-4.739-1.213l-5.292 1.388 1.413-5.163c-.871-1.464-1.351-3.167-1.351-4.981 0-5.498 4.471-9.969 9.969-9.969 5.498 0 9.969 4.471 9.969 9.969z" />
                        </svg>
                        {c.whatsapp_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer border ${
                          c.is_active
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60"
                            : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800"
                        }`}
                      >
                        {c.is_active ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.is_default ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                          ★ Default
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(c)}
                          className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 text-neutral-400 hover:text-amber-400 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          title="Edit Country"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteCountryModal({ isOpen: true, country: c })}
                          disabled={c.is_default}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            c.is_default
                              ? "text-neutral-600 cursor-not-allowed"
                              : "text-neutral-400 hover:text-red-400 hover:bg-red-950/20"
                          }`}
                          title={c.is_default ? "Cannot delete default country" : "Delete Country"}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Country Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-xl font-serif text-white">
                {editingCountry ? "Edit Country" : "Add New Country"}
              </h2>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCountry} className="space-y-4">
              {/* Row 1: Country Name & Country Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Country Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block whitespace-nowrap">
                    Country Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qatar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder:normal-case"
                  />
                </div>

                {/* Country Code */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block whitespace-nowrap">
                    Country Code (ISO) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. QA"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-400 placeholder:normal-case"
                  />
                </div>
              </div>

              {/* Row 2: Currency Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                {/* Currency Code */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block whitespace-nowrap">
                    Currency Code <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. QAR"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-400 placeholder:normal-case"
                  />
                </div>

                {/* Currency Symbol */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block whitespace-nowrap">
                    Currency Symbol <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ر.ق"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder:normal-case"
                  />
                </div>

                {/* Currency Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block whitespace-nowrap">
                    Currency Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Qatari Riyal"
                    value={currencyName}
                    onChange={(e) => setCurrencyName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 placeholder:normal-case"
                  />
                </div>
              </div>

              {/* Country WhatsApp Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider block whitespace-nowrap">
                  Country WhatsApp Number <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. +97433207437"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 placeholder:normal-case"
                  />
                  <span className="absolute left-3 top-3 text-emerald-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.815 2.796.815 3.183 0 5.765-2.587 5.765-5.766-.001-3.18-2.585-5.766-5.765-5.766zm9.969 5.766c0 5.498-4.471 9.969-9.969 9.969-1.721 0-3.332-.44-4.739-1.213l-5.292 1.388 1.413-5.163c-.871-1.464-1.351-3.167-1.351-4.981 0-5.498 4.471-9.969 9.969-9.969 5.498 0 9.969 4.471 9.969 9.969z" />
                    </svg>
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Include international country code prefix (e.g. +974 for Qatar).
                </p>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-white">Enable Country</div>
                    <div className="text-neutral-500">Allow customers & pricing</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-white">Default Country</div>
                    <div className="text-neutral-500">Fallback when detection fails</div>
                  </div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-xl transition-colors shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingCountry ? "Update Country" : "Create Country"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Country Confirmation Modal */}
      <AdminDeleteModal
        isOpen={!!deleteCountryModal?.isOpen}
        onClose={() => setDeleteCountryModal(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Country"
        message="Are you sure you want to delete this country? This will remove country-specific pricing for this country across all products."
        itemName={deleteCountryModal?.country ? `${deleteCountryModal.country.name} (${deleteCountryModal.country.code})` : undefined}
        loading={deleting}
        confirmText="Delete Country"
      />
    </div>
  );
}
