"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { baseLikeCount } from "@/lib/utils";

type CafeLikeCountProps = {
  cafeId: string;
  cafeName: string;
};

export default function CafeLikeCount({ cafeId, cafeName }: CafeLikeCountProps) {
  const { hydrated, user, isFavorite, toggleFavorite } = useAuth();
  const target = { id: cafeId, type: "cafe" as const, name: cafeName };
  const favorite = hydrated ? isFavorite(target) : false;
  const likeCount = baseLikeCount(cafeId) + (favorite ? 1 : 0);
  const canToggle = hydrated && user?.role === "consumer";

  return (
    <button
      type="button"
      onClick={() => {
        if (canToggle) toggleFavorite(target);
      }}
      className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
        favorite
          ? "bg-accent text-white"
          : "border border-line bg-background text-primary"
      } ${canToggle ? "hover:border-accent" : "cursor-default"}`}
      aria-label={`${cafeName} 좋아요 ${likeCount}개`}
    >
      <Heart size={14} className={favorite ? "fill-current" : ""} aria-hidden="true" />
      {likeCount}
    </button>
  );
}
