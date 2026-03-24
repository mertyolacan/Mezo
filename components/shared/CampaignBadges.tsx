"use client";

import { useEffect, useState } from "react";
import type { QualifiableCampaign } from "@/lib/campaign-engine";

type Props = {
  campaigns: QualifiableCampaign[];
};

export default function CampaignBadges({ campaigns }: Props) {
  const [visible, setVisible] = useState<Record<number, boolean>>({});

  // Kampanya qualify olduğunda soldan sağa sırayla yeşil yak
  useEffect(() => {
    campaigns.forEach((c, index) => {
      if (c.qualified) {
        setTimeout(() => {
          setVisible((prev) => ({ ...prev, [c.id]: true }));
        }, index * 180);
      } else {
        setVisible((prev) => ({ ...prev, [c.id]: false }));
      }
    });
  }, [campaigns]);

  if (campaigns.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {campaigns.map((c) => {
        const isLit = visible[c.id];
        return (
          <div
            key={c.id}
            title={
              c.progress
                ? `${c.progress.current} / ${c.progress.required}`
                : undefined
            }
            className={`relative flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all duration-500 cursor-default select-none ${
              isLit
                ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200 dark:shadow-green-900"
                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
            }`}
          >
            {/* Dot */}
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-500 ${
                isLit ? "bg-white" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            />
            {c.badge}

            {/* Progress bar for quantity/amount campaigns */}
            {c.progress && !isLit && (
              <span className="ml-1 text-[10px] text-zinc-400">
                {c.progress.current}/{c.progress.required}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
