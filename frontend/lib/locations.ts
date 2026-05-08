import type { CafeSpace } from "@/types";

export type LocationValue = {
  province: string;
  city: string;
  region: string;
};

export const locationTree: Record<string, Record<string, string[]>> = {
  서울특별시: {
    마포구: ["연남", "망원"],
    성동구: ["성수"],
    용산구: ["해방촌", "경리단"],
    종로구: ["익선"],
    중구: ["을지로"],
    서대문구: ["신촌"],
  },
  부산광역시: {
    수영구: ["광안리"],
    해운대구: ["해운대"],
    중구: ["남포"],
  },
  대구광역시: {
    중구: ["동성로"],
    수성구: ["수성못"],
  },
  인천광역시: {
    중구: ["개항로"],
    연수구: ["송도"],
  },
  광주광역시: {
    남구: ["양림동"],
    동구: ["충장로"],
  },
  대전광역시: {
    중구: ["대흥동"],
    유성구: ["봉명동"],
  },
  울산광역시: {
    중구: ["성남동"],
    남구: ["삼산동"],
  },
  세종특별자치시: {
    세종시: ["나성동", "조치원"],
  },
  경기도: {
    수원시: ["행궁동"],
    성남시: ["판교"],
    고양시: ["일산"],
    용인시: ["보정동"],
  },
  강원특별자치도: {
    강릉시: ["교동"],
    춘천시: ["효자동"],
    원주시: ["무실동"],
  },
  충청북도: {
    청주시: ["성안길"],
    충주시: ["성서동"],
  },
  충청남도: {
    천안시: ["불당동"],
    공주시: ["제민천"],
  },
  전북특별자치도: {
    전주시: ["객리단길"],
    군산시: ["월명동"],
  },
  전라남도: {
    목포시: ["목원동"],
    여수시: ["종화동"],
  },
  경상북도: {
    경주시: ["황리단길"],
    포항시: ["영일대"],
  },
  경상남도: {
    창원시: ["가로수길"],
    진주시: ["평거동"],
  },
  제주특별자치도: {
    제주시: ["애월", "구좌"],
    서귀포시: ["서귀포"],
  },
};

const cafeLocationById: Record<string, LocationValue> = {
  "cafe-yeonnam-window": {
    province: "서울특별시",
    city: "마포구",
    region: "연남",
  },
  "cafe-mangwon-record": {
    province: "서울특별시",
    city: "마포구",
    region: "망원",
  },
  "cafe-seongsu-brick": {
    province: "서울특별시",
    city: "성동구",
    region: "성수",
  },
  "cafe-haebang-poetry": {
    province: "서울특별시",
    city: "용산구",
    region: "해방촌",
  },
  "cafe-ikseon-lantern": {
    province: "서울특별시",
    city: "종로구",
    region: "익선",
  },
  "cafe-euljiro-print": {
    province: "서울특별시",
    city: "중구",
    region: "을지로",
  },
  "cafe-sinchon-study": {
    province: "서울특별시",
    city: "서대문구",
    region: "신촌",
  },
  "cafe-gyeongridan-rooftop": {
    province: "서울특별시",
    city: "용산구",
    region: "경리단",
  },
  "cafe-busan-gwangan-film": {
    province: "부산광역시",
    city: "수영구",
    region: "광안리",
  },
  "cafe-jeju-aewol-wind": {
    province: "제주특별자치도",
    city: "제주시",
    region: "애월",
  },
  "cafe-daegu-sound-cup": {
    province: "대구광역시",
    city: "중구",
    region: "동성로",
  },
  "cafe-gwangju-yangnim-art": {
    province: "광주광역시",
    city: "남구",
    region: "양림동",
  },
  "cafe-daejeon-daeheung-desk": {
    province: "대전광역시",
    city: "중구",
    region: "대흥동",
  },
  "cafe-incheon-openport": {
    province: "인천광역시",
    city: "중구",
    region: "개항로",
  },
  "cafe-suwon-haenggung-corner": {
    province: "경기도",
    city: "수원시",
    region: "행궁동",
  },
  "cafe-gangneung-gyodong-brewing": {
    province: "강원특별자치도",
    city: "강릉시",
    region: "교동",
  },
};

export function getProvinceOptions() {
  return Object.keys(locationTree);
}

export function getCityOptions(province: string) {
  if (province === "all") {
    return Array.from(
      new Set(Object.values(locationTree).flatMap((cities) => Object.keys(cities))),
    ).sort();
  }

  return Object.keys(locationTree[province] ?? {});
}

export function getRegionOptions(province: string, city: string) {
  if (province === "all" && city === "all") {
    return Array.from(
      new Set(
        Object.values(locationTree)
          .flatMap((cities) => Object.values(cities))
          .flat(),
      ),
    ).sort();
  }

  if (province === "all") {
    return Array.from(
      new Set(Object.values(locationTree).flatMap((cities) => cities[city] ?? [])),
    ).sort();
  }

  if (city === "all") {
    return Array.from(
      new Set(Object.values(locationTree[province] ?? {}).flat()),
    ).sort();
  }

  return locationTree[province]?.[city] ?? [];
}

export function getCafeLocation(cafe: CafeSpace): LocationValue {
  return (
    cafeLocationById[cafe.id] ?? {
      province: "서울특별시",
      city: cafe.address.split(" ")[0] ?? "",
      region: cafe.region,
    }
  );
}
