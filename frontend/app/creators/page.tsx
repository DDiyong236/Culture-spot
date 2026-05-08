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
            창작자와 프로젝트 정보를 등록하세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/72">
            활동 장르, 프로젝트 유형, 필요한 공간 조건을 입력하면 창작자
            등록 미리보기와 함께 어울리는 동네 카페 공간을 확인할 수 있습니다.
          </p>
        </div>
        <CreatorForm />
      </div>
    </div>
  );
}
