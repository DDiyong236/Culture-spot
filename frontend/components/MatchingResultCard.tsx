import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { MatchingResult } from "@/types";
import CafeCard from "@/components/CafeCard";

type MatchingResultCardProps = {
  result: MatchingResult;
};

export default function MatchingResultCard({ result }: MatchingResultCardProps) {
  return (
    <div className="grid gap-4 rounded-lg border border-line bg-white p-3 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
      <CafeCard
        cafe={result.cafe}
        score={result.totalScore}
        reason={result.recommendationReason}
        compact
      />
      <div className="space-y-4 p-1 lg:p-3">
        <div>
          <p className="text-sm font-semibold text-primary/70">
            매칭 점수
          </p>
          <p className="mt-1 text-4xl font-bold text-primary">
            {result.totalScore}
            <span className="text-lg">/100</span>
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold text-ink">잘 맞는 조건</h4>
          <div className="space-y-2">
            {result.matchedFactors.slice(0, 8).map((factor) => (
              <p
                key={factor}
                className="flex items-start gap-2 text-sm text-ink/72"
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-sage"
                  aria-hidden="true"
                />
                {factor}
              </p>
            ))}
          </div>
        </div>
        {result.missingFactors.length ? (
          <div>
            <h4 className="mb-2 text-sm font-bold text-ink">확인할 조건</h4>
            <div className="space-y-2">
              {result.missingFactors.slice(0, 5).map((factor) => (
                <p
                  key={factor}
                  className="flex items-start gap-2 text-sm text-ink/64"
                >
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  {factor}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
