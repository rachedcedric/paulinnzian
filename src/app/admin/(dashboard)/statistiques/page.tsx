import Link from "next/link";
import { adminGetSiteStats } from "@/actions/admin";
import { BarChart } from "@/components/admin/BarChart";
import { CampaignLinkBuilder } from "@/components/admin/CampaignLinkBuilder";

const PERIODS = [7, 30, 90];
// Campaign links always point at the live domain, whatever the build-time NEXT_PUBLIC_APP_URL says.
const baseUrl = "https://paulinnzian.com";
const nf = new Intl.NumberFormat("fr-FR");

function rate(part: number, total: number) {
  return total > 0 ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format((part / total) * 100)} %` : "—";
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}>
      <h2 className="mb-4 font-black text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Share({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100" aria-hidden>
      <div className="h-2 rounded-full bg-[#D99A12]" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-gray-500">Rien sur cette période.</p>;
}

export default async function AdminStatsPage({ searchParams }: { searchParams: Promise<{ jours?: string }> }) {
  const { jours } = await searchParams;
  const stats = await adminGetSiteStats(Number(jours) || 30);
  const maxSource = Math.max(0, ...stats.sources.map((source) => source.visits));

  const kpis = [
    { label: "Visites", value: nf.format(stats.visits) },
    { label: "Pages vues", value: nf.format(stats.pageViews) },
    { label: "Clics WhatsApp", value: nf.format(stats.whatsappClicks), hint: `${rate(stats.whatsappClicks, stats.visits)} des visites` },
    { label: "Clics vers boutiques et réseaux", value: nf.format(stats.outboundClicks) },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Statistiques du site</h1>
          <p className="text-sm text-gray-500">
            Mesure anonyme, sans cookie : chaque onglet ouvert sur le site compte pour une visite. Les robots et l&apos;admin sont exclus.
          </p>
        </div>
        <nav className="flex gap-2" aria-label="Période">
          {PERIODS.map((days) => (
            <Link
              key={days}
              href={`/admin/statistiques?jours=${days}`}
              aria-current={stats.period === days ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                stats.period === days ? "bg-[#D99A12] text-white" : "border border-gray-200 bg-white text-gray-700"
              }`}
            >
              {days} jours
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-black text-gray-900">{kpi.value}</p>
            {kpi.hint && <p className="mt-1 text-xs text-gray-500">{kpi.hint}</p>}
          </div>
        ))}
      </div>

      <Card title="Visites par jour">
        <BarChart data={stats.daily} color="bg-[#D99A12]" formatValue={(value) => `${nf.format(value)} visites`} />
      </Card>

      <Card title="D'où viennent vos visiteurs">
        {stats.sources.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="pb-2 font-semibold">Source</th>
                  <th className="pb-2 font-semibold">Visites</th>
                  <th className="w-1/3 pb-2" aria-label="Part des visites" />
                  <th className="pb-2 font-semibold">Clics WhatsApp</th>
                  <th className="pb-2 font-semibold">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.sources.map((source) => (
                  <tr key={source.source}>
                    <td className="py-2.5 font-semibold text-gray-900">{source.label}</td>
                    <td className="py-2.5">{nf.format(source.visits)}</td>
                    <td className="py-2.5 pr-4"><Share value={source.visits} max={maxSource} /></td>
                    <td className="py-2.5">{nf.format(source.whatsapp)}</td>
                    <td className="py-2.5">{rate(source.whatsapp, source.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-gray-500">
          WhatsApp et certaines applis n&apos;indiquent pas d&apos;où vient le visiteur : ces visites tombent dans « Accès direct ».
          Utilisez les liens de campagne ci-dessous pour les suivre.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Campagnes (liens suivis)">
          {stats.campaigns.length === 0 ? <Empty /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="pb-2 font-semibold">Campagne</th>
                  <th className="pb-2 font-semibold">Visites</th>
                  <th className="pb-2 font-semibold">Clics WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.campaigns.map((campaign) => (
                  <tr key={campaign.name}>
                    <td className="py-2 font-semibold text-gray-900">{campaign.name}</td>
                    <td className="py-2">{nf.format(campaign.visits)}</td>
                    <td className="py-2">{nf.format(campaign.whatsapp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Autres sites qui vous envoient du monde">
          {stats.referrers.length === 0 ? <Empty /> : (
            <ul className="divide-y divide-gray-100 text-sm">
              {stats.referrers.map((referrer) => (
                <li key={referrer.host} className="flex justify-between py-2">
                  <span className="text-gray-900">{referrer.host}</span>
                  <span className="font-semibold">{nf.format(referrer.visits)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Pages les plus vues">
          {stats.pages.length === 0 ? <Empty /> : (
            <ul className="divide-y divide-gray-100 text-sm">
              {stats.pages.map((page) => (
                <li key={page.path} className="flex justify-between gap-4 py-2">
                  <span className="truncate text-gray-900">{page.path === "/" ? "Accueil" : page.path}</span>
                  <span className="font-semibold">{nf.format(page.views)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Appareils et clics sortants">
          {stats.devices.length === 0 ? <Empty /> : (
            <ul className="mb-5 divide-y divide-gray-100 text-sm">
              {stats.devices.map((device) => (
                <li key={device.label} className="flex justify-between py-2">
                  <span className="text-gray-900">{device.label}</span>
                  <span className="font-semibold">{rate(device.visits, stats.visits)}</span>
                </li>
              ))}
            </ul>
          )}
          {stats.outbound.length > 0 && (
            <ul className="divide-y divide-gray-100 border-t border-gray-100 text-sm">
              {stats.outbound.map((link) => (
                <li key={link.host} className="flex justify-between py-2">
                  <span className="text-gray-900">{link.host}</span>
                  <span className="font-semibold">{nf.format(link.clicks)} clics</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Créer un lien de campagne">
        <p className="mb-4 text-sm text-gray-500">
          Partagez ce lien au lieu de l&apos;adresse simple : la campagne et sa source apparaîtront dans les tableaux ci-dessus.
        </p>
        <CampaignLinkBuilder baseUrl={baseUrl} />
      </Card>
    </div>
  );
}
