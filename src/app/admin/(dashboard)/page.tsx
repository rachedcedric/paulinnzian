import { getDashboardStats } from "@/actions/admin";
import { RevenueWidget } from "@/components/admin/RevenueWidget";
import { WeightRevenueWidget } from "@/components/admin/WeightRevenueWidget";
import {
  Package, Store, MessageSquare, Star, TrendingUp,
} from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Commandes totales", value: stats.totalOrders, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Commandes en cours", value: stats.activeOrders, icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
    { label: "Commandes livrées", value: stats.deliveredOrders, icon: Package, color: "text-green-600 bg-green-50" },
    { label: "Boutiques actives", value: stats.activeStores, icon: Store, color: "text-purple-600 bg-purple-50" },
    { label: "Messages non lus", value: stats.unreadMessages, icon: MessageSquare, color: "text-red-600 bg-red-50" },
    { label: "Témoignages publiés", value: stats.publishedTestimonials, icon: Star, color: "text-yellow-600 bg-yellow-50" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-black">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue dans votre espace d'administration.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-black">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue widgets */}
      <div className="grid lg:grid-cols-2 gap-4 mb-10">
        <RevenueWidget
          totalRevenue={stats.totalRevenue}
          revenueDay={stats.revenueDay}
          revenueWeek={stats.revenueWeek}
          revenueMonth={stats.revenueMonth}
          revenueYear={stats.revenueYear}
        />
        <WeightRevenueWidget weightRevenue={stats.weightRevenue} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-black">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-sm text-[#FF6500] hover:underline">
              Voir tout
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucune commande</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-black">{order.trackingNumber}</p>
                    <p className="text-xs text-gray-500">{order.customerName} • {order.destinationCity}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-black text-black">Derniers messages</h2>
            <Link href="/admin/messages" className="text-sm text-[#FF6500] hover:underline">
              Voir tout
            </Link>
          </div>
          {stats.recentMessages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Aucun message</p>
          ) : (
            <div className="space-y-3">
              {stats.recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    {msg.status === "UNREAD" && (
                      <div className="w-2 h-2 bg-[#FF6500] rounded-full flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-sm text-black">{msg.name}</p>
                      <p className="text-xs text-gray-500">{msg.subject}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
