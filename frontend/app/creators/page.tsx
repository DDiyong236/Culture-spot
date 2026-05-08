import CreatorForm from "@/components/CreatorForm";

export default function CreatorsPage() {
  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold text-accent">
            창작자 등록
          </p>
          <h1 className="mt-2 text-4xl font-bold text-ink">
            내 프로젝트와 어울리는 동네 카페를 찾아보세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            필요한 분위기, 공간 조건, 예산, 시간대를 입력하세요. Local
            Stage는 전체 공간을 빌리지 않고도 실제 지역 관객을 만날 수
            있는 카페를 추천합니다.
          </p>
        </div>
        <CreatorForm />
      </div>
    </div>
  );
}
