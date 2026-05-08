"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Coffee,
  Heart,
  Palette,
  Store,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { backendRoleFromUserRole, loginUser, signupUser } from "@/lib/authApi";
import type { UserRole } from "@/types";

const roleOptions: Array<{
  role: UserRole;
  title: string;
  description: string;
  icon: typeof Heart;
}> = [
  {
    role: "consumer",
    title: "사용자",
    description: "동네 카페 공간과 아티스트를 둘러보고 후기를 남깁니다.",
    icon: Heart,
  },
  {
    role: "creator",
    title: "아티스트",
    description: "프로젝트를 등록하고 카페와 협업을 신청합니다.",
    icon: Palette,
  },
  {
    role: "cafeOwner",
    title: "사장님",
    description: "카페 공간을 등록하고 아티스트 프로젝트를 찾습니다.",
    icon: Store,
  },
];

export default function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("consumer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== passwordConfirm) {
      setStatus("error");
      setMessage("비밀번호가 서로 다릅니다.");
      return;
    }

    setStatus("saving");
    setMessage("");

    try {
      await signupUser({
        email: email.trim(),
        password,
        name: name.trim(),
        role: backendRoleFromUserRole(role),
      });
      const session = await loginUser({
        email: email.trim(),
        password,
      });

      login({
        ...session.user,
        tokens: session.tokens,
        remember: true,
      });
      router.push("/dashboard");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "회원가입에 실패했습니다. 입력 정보를 다시 확인해주세요.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl rounded-lg border border-line bg-white p-5 shadow-soft sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-white">
            <Coffee size={24} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-semibold text-accent">회원가입</p>
          <h1 className="mt-1 text-3xl font-bold text-ink">
            컬처 SPOT! 계정을 만들어주세요.
          </h1>
        </div>
        <Link
          href="/onboarding"
          className="focus-ring inline-flex items-center justify-center rounded-lg border border-line bg-background px-4 py-2.5 text-sm font-bold text-primary transition hover:border-accent"
        >
          로그인으로 돌아가기
        </Link>
      </div>

      <fieldset className="mt-6">
        <legend className="label">가입 유형</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const active = role === option.role;

            return (
              <label
                key={option.role}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  active
                    ? "border-primary bg-background shadow-soft"
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
                <span className="flex items-start gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
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
            placeholder="홍길동"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="label">이메일</span>
          <input
            className="form-field"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="culture@example.com"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="label">비밀번호</span>
          <input
            className="form-field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8자 이상 권장"
            required
          />
        </label>
        <label className="space-y-1.5">
          <span className="label">비밀번호 확인</span>
          <input
            className="form-field"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="비밀번호를 한 번 더 입력"
            required
          />
        </label>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg border border-line bg-background p-3 text-sm font-semibold text-accent">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "saving"}
        className="focus-ring mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-bold text-white shadow-soft transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "saving" ? "회원가입 중..." : "회원가입 완료"}
        {status === "saving" ? null : <ArrowRight size={20} aria-hidden="true" />}
      </button>
    </form>
  );
}
