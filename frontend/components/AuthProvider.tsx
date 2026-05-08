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
import {
  AUTH_TOKENS_KEY,
  isJwtExpired,
  refreshAuthSession,
  type AuthTokens,
} from "@/lib/authApi";
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
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  tokens?: AuthTokens;
  remember?: boolean;
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
  accessToken: string | null;
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
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [persistSession, setPersistSession] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const storedUser = readStorage<MockUser | null>(AUTH_USER_KEY, null);
      const storedTokens = readStorage<AuthTokens | null>(AUTH_TOKENS_KEY, null);

      setFavorites(readStorage<string[]>(FAVORITES_KEY, []));
      setReviews(readStorage<Review[]>(REVIEWS_KEY, []));

      if (!storedTokens) {
        if (active) {
          setUser(storedUser);
          setHydrated(true);
        }
        return;
      }

      if (!isJwtExpired(storedTokens.accessToken)) {
        if (active) {
          setUser(storedUser);
          setTokens(storedTokens);
          setHydrated(true);
        }
        return;
      }

      if (!isJwtExpired(storedTokens.refreshToken)) {
        try {
          const refreshed = await refreshAuthSession(
            storedTokens.refreshToken,
            storedUser,
          );

          if (active) {
            setUser(refreshed.user);
            setTokens(refreshed.tokens);
            setHydrated(true);
          }
          return;
        } catch {
          window.localStorage.removeItem(AUTH_USER_KEY);
          window.localStorage.removeItem(AUTH_TOKENS_KEY);
        }
      }

      if (active) {
        setUser(null);
        setTokens(null);
        setHydrated(true);
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!persistSession) {
      window.localStorage.removeItem(AUTH_USER_KEY);
      return;
    }
    if (user) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [hydrated, persistSession, user]);

  useEffect(() => {
    if (!hydrated) return;
    if (!persistSession) {
      window.localStorage.removeItem(AUTH_TOKENS_KEY);
      return;
    }
    if (tokens) {
      window.localStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
    } else {
      window.localStorage.removeItem(AUTH_TOKENS_KEY);
    }
  }, [hydrated, persistSession, tokens]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }, [reviews, hydrated]);

  const login = useCallback((input: LoginInput) => {
    const safeName = input.name.trim() || "컬처 SPOT! 사용자";
    const safeEmail = input.email.trim() || "local@example.com";

    setUser({
      id: input.id ?? `${input.role}-${Date.now()}`,
      name: safeName,
      email: safeEmail,
      role: input.role,
    });
    setPersistSession(input.remember ?? true);
    setTokens(input.tokens ?? null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    setPersistSession(true);
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
      accessToken: tokens?.accessToken ?? null,
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
      tokens,
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
