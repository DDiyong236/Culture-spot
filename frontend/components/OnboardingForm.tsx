"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Heart, Palette, Store } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { roleLabel } from "@/lib/utils";
import type { UserRole } from "@/types";

const roleOptions: Array<{
  role: UserRole;
  title: string;
  description: string;
  points: string[];
  icon: typeof Heart;
}> = [
  {
    role: "consumer",
    title: "동네 문화 소비자",
    description:
      "기본 화면처럼 카페와 이벤트를 탐색하고, 로그인 후 즐겨찾기와 후기를 남깁니다.",
    points: ["카페 즐겨찾기", "창작자 저장", "후기 작성"],
    icon: Heart,
  },
  {
    role: "creator",
    title: "창작자",
    description:
      "프로젝트 정보를 등록하고, 조건에 맞는 동네 카페 공간을 추천받습니다.",
    points: ["프로젝트 등록", "공간 매칭", "지역 관객 확보"],
    icon: Palette,
  },
  {
    role: "cafeOwner",
    title: "카페 주인",
    description:
      "영업을 유지한 채 활용 가능한 벽, 코너, 한적한 시간대를 등록합니다.",
    points: ["카페 공간 등록", "유휴 시간 활용", "문화 브랜딩"],
    icon: Store,
  },
];

export default function OnboardingForm() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [role, setRole] = useState<UserRole>(user?.role ?? "consumer");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const selectedRole = useMemo(
    () => roleOptions.find((option) => option.role === role)!,
    [role],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login({
      role,
      name: name || roleLabel(role),
      email: email || `${role}@localstage.kr`,
    });
    router.push("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-white">
          <Coffee size={24} aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm font-semibold text-accent">
          로그인 및 회원가입
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-ink">
          어떤 방식으로 Local Stage를 이용하시나요?
        </h1>
        <p className="mt-4 text-base leading-7 text-ink/72">
          지금은 백엔드 없이 역할을 고르는 목 온보딩입니다. 선택한 역할은
          브라우저에 저장되고, 화면 구성과 주요 행동이 달라집니다.
        </p>

        <div className="mt-6 rounded-lg border border-line bg-background p-4">
          <p className="text-sm font-bold text-primary">선택된 화면</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            {selectedRole.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            {selectedRole.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedRole.points.map((point) => (
              <span key={point} className="badge">
                {point}
              </span>
            ))}
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-white p-5 shadow-soft"
      >
        <fieldset>
          <legend className="label">역할 선택</legend>
          <div className="mt-3 grid gap-3">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const active = role === option.role;
              return (
                <label
                  key={option.role}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    active
                      ? "border-accent bg-accent/10 shadow-soft"
                      : "border-line bg-background hover:border-accent"
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
                  <span className="flex items-start gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-accent text-white" : "bg-white text-primary"
                      }`}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-bold text-ink">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-ink/68">
                        {option.description}
                      </span>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="label">이름</span>
            <input
              className="form-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 김로컬"
            />
          </label>
          <label className="space-y-1.5">
            <span className="label">이메일</span>
            <input
              className="form-field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="local@example.com"
            />
          </label>
        </div>

        <button
          type="submit"
          className="focus-ring mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
        >
          {roleLabel(role)}로 시작하기
        </button>
      </form>
    </div>
  );
}
