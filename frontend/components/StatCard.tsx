import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
};

export default function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <article className="rounded-lg border border-line bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary/70">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-background text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink/68">{helper}</p>
    </article>
  );
}
