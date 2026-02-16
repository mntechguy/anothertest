const stats = [
  { label: "Requests today", value: "\u2014" },
  { label: "Avg latency", value: "\u2014" },
  { label: "Uptime", value: "\u2014" },
];

export default function StatsPlaceholder() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
        >
          <p className="text-xs font-medium uppercase text-gray-500">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
