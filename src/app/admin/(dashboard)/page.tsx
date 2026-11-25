import Link from "next/link";
import {
  Package, Store, MessageSquare, Star, TrendingUp, CheckCircle2, Wallet, Truck,
  ShoppingBag, CircleDollarSign, Boxes, Scale, Banknote, Euro,
} from "lucide-react";
import { getDashboardStats } from "@/actions/admin";
import { PeriodStatsCard, type PeriodCardData } from "@/components/admin/PeriodStatsCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { countryFlag } from "@/lib/country-flag";
import { PERIODS, exchangeProfit, formatFcfa, formatKg, formatNumber, type Period } from "@/lib/dashboard-stats";
import { OFFICIAL_FCFA_PER_EUR, ORDERS_TIMEZONE, exchangeMargin, formatOrderDateTime } from "@/lib/order-list";
import { DEVIS_FCFA_PER_EUR } from "@/lib/devis";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const today = new Intl.DateTimeFormat("fr-FR", {
    timeZone: ORDERS_TIMEZONE, day: "numeric", month: "long", year: "numeric",
  }).format(new Date());

  const statCards = [
    { label: "Commandes totales", value: stats.totalOrders, icon: Package, tone: "text-blue-600 bg-blue-50" },
    { label: "Commandes en cours", value: stats.activeOrders, icon: TrendingUp, tone: "text-[#D99A12] bg-[#D99A12]/10" },
    { label: "Commandes livrées", value: stats.deliveredOrders, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Boutiques actives", value: stats.activeStores, icon: Store, tone: "text-violet-600 bg-violet-50" },
    { label: "Messages non lus", value: stats.unreadMessages, icon: MessageSquare, tone: "text-red-600 bg-red-50" },
    { label: "Témoignages publiés", value: stats.publishedTestimonials, icon: Star, tone: "text-yellow-600 bg-yellow-50" },
  ];

  const revenueData = {} as Record<Period, PeriodCardData>;
  const transportData = {} as Record<Period, PeriodCardData>;
  // Profit = exchange margin only (transport fees are shown in their own card).
  const profitData = {} as Record<Period, PeriodCardData>;
  for (const { key } of PERIODS) {
    const r = stats.periods.revenue[key];
    const { euros, ...profit } = exchangeProfit(r);
    profitData[key] = {
      ...profit,
      minis: [{ value: `${formatNumber(euros)} €` }, { value: formatNumber(r.orders) }],
    };
    revenueData[key] = {
      total: r.total,
      change: r.change,
      series: r.series,
      minis: [{ value: formatNumber(r.orders) }, { value: formatFcfa(r.average) }],
    };
    const t = stats.periods.transport[key];
    transportData[key] = {
      total: t.total,
      change: t.change,
      series: t.series,
      minis: [{ value: formatNumber(t.packages) }, { value: formatKg(t.weightKg) }],
    };
  }

  const ordersLabels = (suffix: string): [string, string] => [`Commandes ${suffix}`, "Panier moyen"];
  const transportLabels = (suffix: string): [string, string] => [`Colis expédiés ${suffix}`, `Poids total ${suffix}`];
  const profitLabels: [string, string] = ["Montant des commandes (€)", "Commandes"];
  const totalProfit = exchangeMargin(stats.totalRevenue);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Bienvenue dans votre espace d&apos;administration.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-gray-900">{formatNumber(card.value)}</p>
            <p className="mt-0.5 text-xs text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <div className="min-w-0 xl:col-span-2">
          <PeriodStatsCard
            title="Mes revenus"
            titleNote={`(1 € = ${DEVIS_FCFA_PER_EUR} F au lieu de ${OFFICIAL_FCFA_PER_EUR.toLocaleString("fr-FR")} F)`}
            subtitle={`Marge de change uniquement : (€ × ${DEVIS_FCFA_PER_EUR}) − (€ × ${OFFICIAL_FCFA_PER_EUR.toLocaleString("fr-FR")}) · ${formatFcfa(totalProfit)} au total`}
            icon={<Banknote className="h-5 w-5" />}
            iconTone="bg-emerald-50 text-emerald-600"
            accent={{ text: "text-emerald-600", tabActive: "bg-emerald-600", bar: "bg-emerald-500" }}
            todayLabel={today}
            data={profitData}
            miniIcons={[<Euro key="a" className="h-5 w-5" />, <ShoppingBag key="b" className="h-5 w-5" />]}
            miniLabels={{ day: profitLabels, week: profitLabels, month: profitLabels, year: profitLabels }}
          />
        </div>
        <PeriodStatsCard
          title="Chiffre d'affaires total"
          subtitle={`Montant total des commandes (FCFA) · ${formatFcfa(stats.totalRevenue)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          iconTone="bg-emerald-50 text-emerald-600"
          accent={{ text: "text-gray-900", tabActive: "bg-[#D99A12]", bar: "bg-[#D99A12]" }}
          todayLabel={today}
          data={revenueData}
          miniIcons={[<ShoppingBag key="a" className="h-5 w-5" />, <CircleDollarSign key="b" className="h-5 w-5" />]}
          miniLabels={{
            day: ordersLabels("aujourd'hui"), week: ordersLabels("(7 jours)"),
            month: ordersLabels("ce mois"), year: ordersLabels("cette année"),
          }}
        />
        <PeriodStatsCard
          title="Frais transport total"
          titleNote="(au kg, ou % sur le luxe)"
          subtitle={`Total des frais d'expédition (FCFA) · ${formatFcfa(stats.totalTransport)}`}
          icon={<Truck className="h-5 w-5" />}
          iconTone="bg-blue-50 text-blue-600"
          accent={{ text: "text-blue-600", tabActive: "bg-blue-600", bar: "bg-blue-500" }}
          todayLabel={today}
          data={transportData}
          miniIcons={[<Boxes key="a" className="h-5 w-5" />, <Scale key="b" className="h-5 w-5" />]}
          miniLabels={{
            day: transportLabels("aujourd'hui"), week: transportLabels("(7 jours)"),
            month: transportLabels("ce mois"), year: transportLabels("cette année"),
          }}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-black text-gray-900"><Wallet className="h-5 w-5 text-[#D99A12]" />Dernières commandes</h2>
            <Link href="/admin/commandes" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Voir toutes</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Aucune commande</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500">
                    <th className="px-3 py-2 font-medium">N° Suivi</th>
                    <th className="px-3 py-2 font-medium">Client</th>
                    <th className="px-3 py-2 font-medium">Destination</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((o) => {
                    const { date, time } = formatOrderDateTime(o.createdAt);
                    return (
                      <tr key={o.id} className="border-b border-gray-50 last:border-0">
                        <td className="whitespace-nowrap px-3 py-3 font-mono text-xs font-bold text-[#D99A12]">{o.trackingNumber}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900">{o.customerName}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-gray-700"><span aria-hidden className="mr-1">{countryFlag(o.destinationCountry)}</span>{o.destinationCity}</td>
                        <td className="px-3 py-3"><OrderStatusBadge status={o.status} /></td>
                        <td className="px-3 py-3 text-xs text-gray-700">{date}<br /><span className="text-gray-400">{time}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-black text-gray-900"><Banknote className="h-5 w-5 text-[#D99A12]" />Derniers messages</h2>
            <Link href="/admin/messages" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">Voir tous</Link>
          </div>
          {stats.recentMessages.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Aucun message</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500">
                    <th className="px-3 py-2 font-medium">Nom</th>
                    <th className="px-3 py-2 font-medium">Sujet</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentMessages.map((m) => {
                    const { date, time } = formatOrderDateTime(m.createdAt);
                    const unread = m.status === "UNREAD";
                    return (
                      <tr key={m.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 font-semibold text-gray-900">{m.name}</td>
                        <td className="max-w-[180px] truncate px-3 py-3 text-gray-700">{m.subject}</td>
                        <td className="px-3 py-3 text-xs text-gray-700">{date}<br /><span className="text-gray-400">{time}</span></td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${unread ? "bg-red-50 text-red-700 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
                            {unread ? "Non lu" : "Lu"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
