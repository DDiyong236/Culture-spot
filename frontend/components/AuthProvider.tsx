"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  FavoriteTargetType,
  MockUser,
  Review,
  UserRole,
} from "@/types";

type FavoriteTarget = {
  id: string;
  type: FavoriteTargetType;
  name: string;
};

type LoginInput = {
  name: string;
  email: string;
  role: UserRole;
};

type ReviewInput = {
  targetId: string;
  targetType: FavoriteTargetType;
  targetName: string;
  rating: number;
  content: string;
  photoUrl?: string;
};

type AuthContextValue = {
  user: MockUser | null;
  hydrated: boolean;
  favorites: string[];
  reviews: Review[];
  login: (input: LoginInput) => void;
  logout: () => void;
  isFavorite: (target: FavoriteTarget) => boolean;
  toggleFavorite: (target: FavoriteTarget) => void;
  addReview: (input: ReviewInput) => void;
  getReviewsForTarget: (
    targetType: FavoriteTargetType,
    targetId: string,
  ) => Review[];
};

const AUTH_USER_KEY = "local-stage:user";
const FAVORITES_KEY = "local-stage:favorites";
const REVIEWS_KEY = "local-stage:reviews";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function favoriteKey(target: FavoriteTarget) {
  return `${target.type}:${target.id}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<MockUser | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setUser(readStorage<MockUser | null>(AUTH_USER_KEY, null));
    setFavorites(readStorage<string[]>(FAVORITES_KEY, []));
    setReviews(readStorage<Review[]>(REVIEWS_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [hydrated, user]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }, [reviews, hydrated]);

  const login = useCallback((input: LoginInput) => {
    const safeName = input.name.trim() || "로컬 스테이지 사용자";
    const safeEmail = input.email.trim() || "local@example.com";

    setUser({
      id: `${input.role}-${Date.now()}`,
      name: safeName,
      email: safeEmail,
      role: input.role,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isFavorite = useCallback(
    (target: FavoriteTarget) => favorites.includes(favoriteKey(target)),
    [favorites],
  );

  const toggleFavorite = useCallback((target: FavoriteTarget) => {
    const key = favoriteKey(target);
    setFavorites((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }, []);

  const addReview = useCallback((input: ReviewInput) => {
    const content = input.content.trim();
    if (!content) return;

    setReviews((current) => [
      {
        id: `review-${Date.now()}`,
        targetId: input.targetId,
        targetType: input.targetType,
        targetName: input.targetName,
        rating: input.rating,
        content,
        photoUrl: input.photoUrl,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  const getReviewsForTarget = useCallback(
    (targetType: FavoriteTargetType, targetId: string) =>
      reviews.filter(
        (review) =>
          review.targetType === targetType && review.targetId === targetId,
      ),
    [reviews],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      favorites,
      reviews,
      login,
      logout,
      isFavorite,
      toggleFavorite,
      addReview,
      getReviewsForTarget,
    }),
    [
      addReview,
      favorites,
      getReviewsForTarget,
      hydrated,
      isFavorite,
      login,
      logout,
      reviews,
      toggleFavorite,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
