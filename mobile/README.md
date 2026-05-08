# Local Stage Mobile

`frontend`의 사용자/소비자 경험만 분리한 Android 에뮬레이터용 Expo 모바일 MVP입니다.

## 실행

```bash
cd /Users/sonjiwoon/khu/mobile
npm install
npm run android
```

Android Studio 에뮬레이터가 먼저 켜져 있어야 합니다.

포트 충돌이 있으면:

```bash
npm run android:port
```

## 포함 범위

- 홈: 내 주변 문화 추천
- 공간 찾기: 지역/유형/검색 필터
- 일정: 전시, 공연, 팝업 이벤트
- 찜: 공간과 이벤트 저장
- 내 정보: 사용자 취향, 관심 지역, 활동 요약

창작자 등록, 카페 등록, 운영자 대시보드, 관리자 기능은 의도적으로 제외했습니다.
