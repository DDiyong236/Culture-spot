import CafeRegisterForm from "@/components/CafeRegisterForm";

export default function CafeRegisterPage() {
  return (
    <div className="surface-grid min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-accent">
            카페 공간 등록
          </p>
          <h1 className="mt-2 text-4xl font-bold text-ink">
            쓰이지 않던 카페 공간을 문화 기회로 바꿔보세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            공간 이미지와 장비, 가능한 이벤트 유형을 등록하세요. 카페는
            계속 손님을 맞이하고, 창작자는 공간에 작은 동네 무대를 더합니다.
          </p>
        </div>
        <CafeRegisterForm />
      </div>
    </div>
  );
}
