import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { useI18n } from "@/i18n";
import { AppShell } from "@/components/layout/AppSidebar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { SitesTable } from "@/components/dashboard/SitesTable";
import { supabase } from "@/lib/supabase";

const defaultStatusData = [
  { name: "Creation", value: 0, color: "#f43f5e" },
  { name: "Finished by Driver", value: 0, color: "#fb923c" },
  { name: "Task approved", value: 0, color: "#22c55e" },
  { name: "Rejected by driver", value: 0, color: "#06b6d4" },
  { name: "Canceled", value: 0, color: "#a3a3a3" },
];

const defaultZoneData = [
  { name: "Riyadh", value: 0, color: "#8b5cf6" },
  { name: "Jeddah", value: 0, color: "#06b6d4" },
  { name: "Dammam", value: 0, color: "#f59e0b" },
  { name: "Other", value: 0, color: "#22c55e" },
];

type MetricCard = { key: string; value: string; bg: string };
const initialMetricCards: MetricCard[] = [
  { key: "totalLitersToday", value: "0.00 liters", bg: "bg-rose-500" },
  { key: "totalLiters30", value: "0.00 liters", bg: "bg-sky-500" },
  { key: "totalLiters7", value: "0.00 liters", bg: "bg-emerald-600" },
];

export default function Index() {
  const { t } = useI18n();
  const [statusData, setStatusData] = useState(defaultStatusData);
  const [zoneData, setZoneData] = useState(defaultZoneData);
  const [metricCards, setMetricCards] = useState(initialMetricCards);
  const [last7StatusCount, setLast7StatusCount] = useState(0);

  useEffect(() => {
    (async () => {
      // Status distribution from driver_tasks
      const { data: tasks } = await supabase
        .from("driver_tasks")
        .select("status, scheduled_at, created_at");
      if (tasks) {
        const counts: Record<string, number> = {};
        for (const row of tasks as any[]) {
          const s = String(row.status || "");
          counts[s] = (counts[s] || 0) + 1;
        }
        setStatusData([
          { name: "Creation", value: counts["pending"] || 0, color: "#f43f5e" },
          {
            name: "Finished by Driver",
            value: counts["completed"] || 0,
            color: "#fb923c",
          },
          {
            name: "Task approved",
            value: counts["approved"] || 0,
            color: "#22c55e",
          },
          {
            name: "Rejected by driver",
            value: counts["rejected"] || 0,
            color: "#06b6d4",
          },
          {
            name: "Canceled",
            value: counts["canceled"] || 0,
            color: "#a3a3a3",
          },
        ]);
      }

      // Liters metrics from driver_task_entries (actual refilled)
      const today = new Date();
      const start30 = new Date();
      start30.setDate(today.getDate() - 30);
      const start7 = new Date();
      start7.setDate(today.getDate() - 7);

      const { data: entries30 } = await supabase
        .from("driver_task_entries")
        .select("liters, submitted_at, created_at")
        .gte("created_at", start30.toISOString());

      let sumToday = 0;
      let sum30 = 0;
      let sum7 = 0;
      if (entries30) {
        const todayStr = today.toISOString().slice(0, 10);
        for (const e of entries30 as any[]) {
          const liters = Number(e.liters || 0);
          const whenStr = String(e.submitted_at || e.created_at || "");
          if (!whenStr) continue;
          const when = new Date(whenStr);
          if (when >= start30 && when <= today) sum30 += liters;
          if (when >= start7 && when <= today) sum7 += liters;
          if (whenStr.slice(0, 10) === todayStr) sumToday += liters;
        }
      }
      setMetricCards([
        {
          key: "totalLitersToday",
          value: `${sumToday.toFixed(2)} liters`,
          bg: "bg-rose-500",
        },
        {
          key: "totalLiters30",
          value: `${sum30.toFixed(2)} liters`,
          bg: "bg-sky-500",
        },
        {
          key: "totalLiters7",
          value: `${sum7.toFixed(2)} liters`,
          bg: "bg-emerald-600",
        },
      ]);
      // Zone distribution from drivers table
      const { data: drivers } = await supabase.from("drivers").select("zone");
      if (drivers) {
        const counts: Record<string, number> = {};
        for (const d of drivers as any[]) {
          const z = (d.zone || "Other").trim() || "Other";
          counts[z] = (counts[z] || 0) + 1;
        }
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const palette = [
          "#8b5cf6",
          "#06b6d4",
          "#f59e0b",
          "#22c55e",
          "#ef4444",
          "#0ea5e9",
        ];
        const dyn = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count], i) => ({
            name,
            value: (count / total) * 100,
            color: palette[i % palette.length],
          }));
        setZoneData(dyn.length ? dyn : defaultZoneData);
      }

      // Last 7 days cards
      const { count: sitesCount } = await supabase
        .from("sites")
        .select("id", { count: "exact", head: true })
        .or("cow_status.eq.ON-AIR,cow_status.ilike.%in progress%")
        .in("region", ["Central", "East"]);
      setLast7StatusCount(sitesCount || 0);

      // (last7 liters already computed above into metric cards)
    })();
  }, []);
  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-4">
        <div className="mb-4 text-sm text-muted-foreground">
          {t("dashboard")}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {metricCards.map((m) => (
            <Card key={m.key} className="overflow-hidden">
              <CardContent className={`${m.bg} p-4 text-white`}>
                <div className="text-sm/6 opacity-90">{t(m.key as any)}</div>
                <div className="mt-2 text-2xl font-semibold">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="mb-3 text-base font-medium">
                {t("totalTasksStatusCount")}
              </div>
              <ChartContainer config={{}} className="aspect-[4/3]">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`s-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-3 text-base font-medium">
                {t("totalTasksZonesCount")}
              </div>
              <ChartContainer config={{}} className="aspect-[4/3]">
                <PieChart>
                  <Pie
                    data={zoneData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {zoneData.map((entry, index) => (
                      <Cell key={`z-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="text-base font-medium">
                Total Status Count in Last 7 Days
              </div>
              <div className="mt-3 text-3xl font-semibold">
                {last7StatusCount}
              </div>
              <div className="text-xs text-muted-foreground">Total sites</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <SitesTable sourceUrl="https://docs.google.com/spreadsheets/d/e/2PACX-1vS0GkXnQMdKYZITuuMsAzeWDtGUqEJ3lWwqNdA67NewOsDOgqsZHKHECEEkea4nrukx4-DqxKmf62nC/pubhtml?gid=1149576218&single=true" />
        </div>
      </div>
    </AppShell>
  );
}
