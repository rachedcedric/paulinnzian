"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, ShoppingBag } from "lucide-react";
import type { Store } from "@/types";
import { STORE_CATEGORIES } from "@/types";

export function StoresClient({ initialStores }: { initialStores: Store[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");

  const filtered = useMemo(() => {
    return initialStores.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Tous" || s.category === category;
      return matchSearch && matchCat;
    });
  }, [initialStores, search, category]);

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              NOS <span className="text-[#FF6500]">BOUTIQUES</span> EN LIGNE
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Découvrez les boutiques sur lesquelles nous pouvons effectuer vos achats.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Rechercher une boutique..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6500] bg-[#F5F5F5]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10">
          {STORE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                category === cat
                  ? "bg-[#FF6500] text-white"
                  : "bg-[#F5F5F5] text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stores Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Aucune boutique trouvée</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filtered.map((store, i) => (
              <motion.a
                key={store.id}
                href={store.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="group bg-[#F5F5F5] hover:bg-black rounded-2xl p-5 flex flex-col items-center text-center transition-all hover:shadow-md"
              >
                {/* Logo */}
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                  {store.logo ? (
                    <Image
                      src={store.logo}
                      alt={store.name}
                      width={56}
                      height={56}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <span className="font-black text-lg text-black group-hover:text-white transition-colors">
                      {store.name.charAt(0)}
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm text-black group-hover:text-white transition-colors mb-1">
                  {store.name}
                </p>
                <span className="text-xs text-gray-400 group-hover:text-gray-300 mb-3">{store.category}</span>
                <div className="flex items-center gap-1 text-xs text-[#FF6500] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3 h-3" />
                  Ouvrir
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
