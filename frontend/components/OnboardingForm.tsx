"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Coffee, Palette, Store } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { roleLabel } from "@/lib/utils";
import type { UserRole } from "@/types";

const roleOptions: Array<{
  role: UserRole;
  title: string;
  description: string;
  points: string[];
  icon: typeof Palette;
}> = [
  {
    role: "creator",
    title: "아티스트",
    description: "프로젝트 카드와 협업 신청을 관리합니다.",
    points: ["프로젝트 관리", "공간 신청", "협업 일정"],
    icon: Palette,
  },
  {
    role: "cafeOwner",
    title: "사장님",
    description: "카페 공간과 아티스트 제안을 관리합니다.",
    points: ["공간 등록", "제안 관리", "협업 운영"],
    icon: Store,
  },
];

export default function OnboardingForm() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [role, setRole] = useState<UserRole>(
    user?.role === "cafeOwner" ? "cafeOwner" : "creator",
  );
  const [identifier, setIdentifier] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeRole = demoMode ? role : "consumer";
    const safeIdentifier = identifier.trim();

    login({
      role: activeRole,
      name: safeIdentifier
        ? safeIdentifier.split("@")[0]
        : activeRole === "creator"
          ? "홍길동"
          : roleLabel(activeRole),
      email: safeIdentifier.includes("@")
        ? safeIdentifier
        : `${safeIdentifier || activeRole}@localstage.kr`,
    });
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6"
    >
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary text-white">
          <Coffee size={24} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white transition focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(243,115,56,0.14)]">
        <label className="block border-b border-line">
          <span className="sr-only">아이디 또는 전화번호</span>
          <input
            className="h-16 w-full bg-white px-5 text-base font-semibold text-ink outline-none placeholder:text-ink/45"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="아이디 또는 전화번호"
          />
        </label>
        <label className="block">
          <span className="sr-only">비밀번호</span>
          <input
            className="h-16 w-full bg-white px-5 text-base font-semibold text-ink outline-none placeholder:text-ink/45"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-bold text-ink/70">
          <span
            className={`flex size-7 items-center justify-center rounded-full border ${
              rememberLogin
                ? "border-primary bg-primary text-white"
                : "border-line bg-white text-transparent"
            }`}
          >
            <Check size={16} aria-hidden="true" />
          </span>
          <input
            type="checkbox"
            checked={rememberLogin}
            onChange={(event) => setRememberLogin(event.target.checked)}
            className="sr-only"
          />
          로그인 상태 유지
        </label>

        <label className="inline-flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-ink/70">
          <span>시연 모드</span>
          <span
            className={`relative h-8 w-16 rounded-full p-1 transition ${
              demoMode ? "bg-primary" : "bg-ink/30"
            }`}
          >
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(event) => setDemoMode(event.target.checked)}
              className="sr-only"
            />
            <span
              className={`block size-6 rounded-full bg-white shadow-sm transition ${
                demoMode ? "translate-x-8" : "translate-x-0"
              }`}
            />
          </span>
        </label>
      </div>

      {demoMode ? (
        <fieldset className="mt-5 rounded-lg border border-line bg-background p-4">
          <legend className="px-1 text-sm font-bold text-primary">
            시연 역할 선택
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const active = role === option.role;

              return (
                <label
                  key={option.role}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    active
                      ? "border-primary bg-white shadow-soft"
                      : "border-line bg-white hover:border-primary"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.role}
                    checked={active}
                    onChange={() => setRole(option.role)}
                    className="sr-only"
                  />
                  <span className="flex flex-col gap-3">
                    <span
                      className={`flex size-10 items-center justify-center rounded-lg ${
                        active ? "bg-primary text-white" : "bg-background text-primary"
                      }`}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-bold text-ink">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-ink/62">
                        {option.description}
                      </span>
                      <span className="mt-2 block text-[11px] font-bold text-primary/72">
                        {option.points.join(" · ")}
                      </span>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <button
        type="submit"
        className="focus-ring mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-bold text-white shadow-soft transition hover:bg-primary/90"
      >
        {demoMode ? `${roleLabel(role)}로 로그인` : "로그인"}
        <ArrowRight size={20} aria-hidden="true" />
      </button>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold text-ink/54">
        <button type="button" className="transition hover:text-primary">
          아이디 찾기
        </button>
        <span className="h-3 w-px bg-line" />
        <button type="button" className="transition hover:text-primary">
          비밀번호 찾기
        </button>
        <span className="h-3 w-px bg-line" />
        <button type="button" className="transition hover:text-primary">
          회원가입
        </button>
      </div>
    </form>
  );
}
