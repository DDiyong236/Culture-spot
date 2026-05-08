import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { eventTypeLabels, eventTypes, events, regions, spaces } from "./src/data";
import { colors, shadow } from "./src/theme";
import type { EventType, LocalEvent, Space } from "./src/types";

type TabKey = "home" | "spaces" | "events" | "saved" | "me";
type SavedTarget = { id: string; type: "space" | "event" };
type IconName = keyof typeof Ionicons.glyphMap;

const tabs: Array<{
  key: TabKey;
  label: string;
  icon: IconName;
  activeIcon: IconName;
}> = [
  { key: "home", label: "홈", icon: "home-outline", activeIcon: "home" },
  { key: "spaces", label: "공간", icon: "map-outline", activeIcon: "map" },
  { key: "events", label: "일정", icon: "calendar-outline", activeIcon: "calendar" },
  { key: "saved", label: "찜", icon: "heart-outline", activeIcon: "heart" },
  { key: "me", label: "내정보", icon: "person-outline", activeIcon: "person" },
];

const settingRows: Array<{ icon: IconName; title: string; copy: string }> = [
  {
    icon: "location-outline",
    title: "관심 동네",
    copy: "연남, 망원, 성수 중심 추천",
  },
  {
    icon: "notifications-outline",
    title: "알림",
    copy: "찜한 일정과 새 이벤트 알림",
  },
  {
    icon: "chatbubble-ellipses-outline",
    title: "피드백",
    copy: "사용자 MVP 개선 의견 보내기",
  },
];

function savedKey(target: SavedTarget) {
  return `${target.type}:${target.id}`;
}

function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onPress} hitSlop={10}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function SaveButton({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[styles.saveButton, active && styles.saveButtonActive]}
    >
      <Ionicons
        name={active ? "heart" : "heart-outline"}
        size={18}
        color={active ? colors.white : colors.primary}
      />
    </Pressable>
  );
}

function SpaceCard({
  space,
  saved,
  onToggleSave,
}: {
  space: Space;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: space.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={styles.flexOne}>
            <Text style={styles.kicker}>{space.region}</Text>
            <Text style={styles.cardTitle}>{space.name}</Text>
          </View>
          <SaveButton active={saved} onPress={onToggleSave} />
        </View>
        <Text style={styles.description}>{space.description}</Text>
        <View style={styles.tagRow}>
          {space.eventTypes.map((type) => (
            <View key={type} style={styles.tag}>
              <Text style={styles.tagText}>{eventTypeLabels[type]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={15} color={colors.sage} />
            <Text style={styles.metaText}>{space.openLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="wallet-outline" size={15} color={colors.sage} />
            <Text style={styles.metaText}>{space.priceLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function EventCard({
  event,
  compact,
  saved,
  onToggleSave,
}: {
  event: LocalEvent;
  compact?: boolean;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <View style={[styles.eventCard, compact && styles.eventCardCompact]}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.cardTopRow}>
          <View style={styles.flexOne}>
            <Text style={styles.kicker}>
              {event.region} · {eventTypeLabels[event.eventType]}
            </Text>
            <Text style={styles.cardTitle}>{event.title}</Text>
          </View>
          <SaveButton active={saved} onPress={onToggleSave} />
        </View>
        <Text style={styles.description}>{event.description}</Text>
        <View style={styles.eventMeta}>
          <Ionicons name="calendar-outline" size={15} color={colors.primary} />
          <Text style={styles.eventMetaText}>
            {event.dateLabel} · {event.timeLabel}
          </Text>
        </View>
        <Text style={styles.smallMuted}>
          {event.creatorName} · {event.cafeName}
        </Text>
        <View style={styles.tagRow}>
          {event.tags.slice(0, compact ? 2 : 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function HomeScreen({
  setTab,
  isSaved,
  toggleSaved,
}: {
  setTab: (tab: TabKey) => void;
  isSaved: (target: SavedTarget) => boolean;
  toggleSaved: (target: SavedTarget) => void;
}) {
  const recommendedSpaces = [...spaces]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <LinearGradient
        colors={["#6F3E2E", "#A9495F", "#F37338"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroTop}>
          <Text style={styles.heroKicker}>사용자 추천</Text>
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text style={styles.locationText}>내 주변</Text>
          </View>
        </View>
        <Text style={styles.heroTitle}>오늘 들르기 좋은 작은 문화 공간</Text>
        <Text style={styles.heroCopy}>
          전시, 공연, 팝업을 동네 카페 안에서 가볍게 발견하세요.
        </Text>
        <Pressable style={styles.heroButton} onPress={() => setTab("spaces")}>
          <Text style={styles.heroButtonText}>공간 둘러보기</Text>
          <Ionicons name="arrow-forward" size={17} color={colors.primary} />
        </Pressable>
      </LinearGradient>

      <SectionHeader
        title="다가오는 문화 일정"
        actionLabel="전체"
        onPress={() => setTab("events")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {events.slice(0, 3).map((event) => (
          <EventCard
            key={event.id}
            event={event}
            compact
            saved={isSaved({ id: event.id, type: "event" })}
            onToggleSave={() => toggleSaved({ id: event.id, type: "event" })}
          />
        ))}
      </ScrollView>

      <SectionHeader
        title="취향에 맞는 공간"
        actionLabel="더보기"
        onPress={() => setTab("spaces")}
      />
      {recommendedSpaces.map((space) => (
        <SpaceCard
          key={space.id}
          space={space}
          saved={isSaved({ id: space.id, type: "space" })}
          onToggleSave={() => toggleSaved({ id: space.id, type: "space" })}
        />
      ))}
    </ScrollView>
  );
}

function SpacesScreen({
  isSaved,
  toggleSaved,
}: {
  isSaved: (target: SavedTarget) => boolean;
  toggleSaved: (target: SavedTarget) => void;
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("전체");
  const [type, setType] = useState<EventType | "all">("all");

  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const keyword = query.trim().toLowerCase();
      const matchedQuery =
        keyword.length === 0 ||
        `${space.name} ${space.region} ${space.description} ${space.atmosphere}`
          .toLowerCase()
          .includes(keyword);
      const matchedRegion = region === "전체" || space.region === region;
      const matchedType = type === "all" || space.eventTypes.includes(type);
      return matchedQuery && matchedRegion && matchedType;
    });
  }, [query, region, type]);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Text style={styles.screenTitle}>공간 찾기</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="지역, 공간명, 분위기 검색"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
      >
        {regions.map((item) => (
          <Pill
            key={item}
            label={item}
            selected={region === item}
            onPress={() => setRegion(item)}
          />
        ))}
      </ScrollView>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setType("all")}
          style={[styles.segmentItem, type === "all" && styles.segmentItemActive]}
        >
          <Text
            style={[
              styles.segmentText,
              type === "all" && styles.segmentTextActive,
            ]}
          >
            전체
          </Text>
        </Pressable>
        {eventTypes.map((eventType) => (
          <Pressable
            key={eventType}
            onPress={() => setType(eventType)}
            style={[
              styles.segmentItem,
              type === eventType && styles.segmentItemActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                type === eventType && styles.segmentTextActive,
              ]}
            >
              {eventTypeLabels[eventType]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.resultText}>{filteredSpaces.length}개 공간</Text>
      {filteredSpaces.map((space) => (
        <SpaceCard
          key={space.id}
          space={space}
          saved={isSaved({ id: space.id, type: "space" })}
          onToggleSave={() => toggleSaved({ id: space.id, type: "space" })}
        />
      ))}
    </ScrollView>
  );
}

function EventsScreen({
  isSaved,
  toggleSaved,
}: {
  isSaved: (target: SavedTarget) => boolean;
  toggleSaved: (target: SavedTarget) => void;
}) {
  const [type, setType] = useState<EventType | "all">("all");
  const filteredEvents =
    type === "all" ? events : events.filter((event) => event.eventType === type);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Text style={styles.screenTitle}>문화 일정</Text>
      <View style={styles.noticeCard}>
        <Ionicons name="sparkles-outline" size={22} color={colors.accent} />
        <View style={styles.flexOne}>
          <Text style={styles.noticeTitle}>이번 주 추천</Text>
          <Text style={styles.noticeText}>
            퇴근 후 1시간 안에 들를 수 있는 전시와 공연을 모았어요.
          </Text>
        </View>
      </View>

      <View style={styles.segment}>
        <Pressable
          onPress={() => setType("all")}
          style={[styles.segmentItem, type === "all" && styles.segmentItemActive]}
        >
          <Text
            style={[
              styles.segmentText,
              type === "all" && styles.segmentTextActive,
            ]}
          >
            전체
          </Text>
        </Pressable>
        {eventTypes.map((eventType) => (
          <Pressable
            key={eventType}
            onPress={() => setType(eventType)}
            style={[
              styles.segmentItem,
              type === eventType && styles.segmentItemActive,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                type === eventType && styles.segmentTextActive,
              ]}
            >
              {eventTypeLabels[eventType]}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          saved={isSaved({ id: event.id, type: "event" })}
          onToggleSave={() => toggleSaved({ id: event.id, type: "event" })}
        />
      ))}
    </ScrollView>
  );
}

function SavedScreen({
  saved,
  toggleSaved,
}: {
  saved: Set<string>;
  toggleSaved: (target: SavedTarget) => void;
}) {
  const savedSpaces = spaces.filter((space) =>
    saved.has(savedKey({ id: space.id, type: "space" })),
  );
  const savedEvents = events.filter((event) =>
    saved.has(savedKey({ id: event.id, type: "event" })),
  );

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Text style={styles.screenTitle}>찜</Text>
      {savedSpaces.length === 0 && savedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={34} color={colors.accent} />
          <Text style={styles.emptyTitle}>아직 찜한 항목이 없어요</Text>
          <Text style={styles.emptyText}>
            마음에 드는 공간이나 이벤트를 저장하면 여기에 모입니다.
          </Text>
        </View>
      ) : null}

      {savedSpaces.length > 0 ? <SectionHeader title="저장한 공간" /> : null}
      {savedSpaces.map((space) => (
        <SpaceCard
          key={space.id}
          space={space}
          saved
          onToggleSave={() => toggleSaved({ id: space.id, type: "space" })}
        />
      ))}

      {savedEvents.length > 0 ? <SectionHeader title="저장한 일정" /> : null}
      {savedEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          saved
          onToggleSave={() => toggleSaved({ id: event.id, type: "event" })}
        />
      ))}
    </ScrollView>
  );
}

function MeScreen({ savedCount }: { savedCount: number }) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Text style={styles.screenTitle}>내 정보</Text>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={30} color={colors.white} />
        </View>
        <View style={styles.flexOne}>
          <Text style={styles.profileName}>로컬 문화 탐색자</Text>
          <Text style={styles.profileCopy}>연남 · 망원 · 성수 주변을 탐색 중</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{savedCount}</Text>
          <Text style={styles.statLabel}>찜</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>관심 지역</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>취향</Text>
        </View>
      </View>

      <SectionHeader title="내 취향" />
      <View style={styles.preferenceCard}>
        <View style={styles.tagRow}>
          <Pill label="조용한 전시" selected />
          <Pill label="퇴근 후 공연" selected />
          <Pill label="주말 팝업" />
        </View>
      </View>

      {settingRows.map(({ icon, title, copy }) => (
        <View key={title} style={styles.settingRow}>
          <Ionicons name={icon} size={20} color={colors.primary} />
          <View style={styles.flexOne}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingCopy}>{copy}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
      ))}
    </ScrollView>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(["space:cafe-yeonnam-window", "event:event-rain-windows"]),
  );

  function isSaved(target: SavedTarget) {
    return saved.has(savedKey(target));
  }

  function toggleSaved(target: SavedTarget) {
    setSaved((current) => {
      const next = new Set(current);
      const key = savedKey(target);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.appName}>Local Stage</Text>
          <Text style={styles.appSubtitle}>사용자 모바일 MVP</Text>
        </View>
        <Pressable style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={21} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {activeTab === "home" ? (
          <HomeScreen
            setTab={setActiveTab}
            isSaved={isSaved}
            toggleSaved={toggleSaved}
          />
        ) : null}
        {activeTab === "spaces" ? (
          <SpacesScreen isSaved={isSaved} toggleSaved={toggleSaved} />
        ) : null}
        {activeTab === "events" ? (
          <EventsScreen isSaved={isSaved} toggleSaved={toggleSaved} />
        ) : null}
        {activeTab === "saved" ? (
          <SavedScreen saved={saved} toggleSaved={toggleSaved} />
        ) : null}
        {activeTab === "me" ? <MeScreen savedCount={saved.size} /> : null}
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tabItem}
            >
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={22}
                color={active ? colors.primary : colors.muted}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? NativeStatusBar.currentHeight : 0,
  },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.background,
  },
  appName: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: "800",
  },
  appSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  content: {
    flex: 1,
  },
  screenContent: {
    padding: 18,
    paddingBottom: 28,
    gap: 14,
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 2,
  },
  hero: {
    borderRadius: 24,
    padding: 22,
    minHeight: 226,
    justifyContent: "space-between",
    ...shadow,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroKicker: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.9,
  },
  locationBadge: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  locationText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: colors.white,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
    marginTop: 18,
  },
  heroCopy: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginTop: 18,
  },
  heroButtonText: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  sectionAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  horizontalList: {
    gap: 12,
    paddingRight: 18,
  },
  card: {
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  cardImage: {
    width: "100%",
    height: 170,
  },
  cardBody: {
    padding: 15,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  flexOne: {
    flex: 1,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  saveButtonActive: {
    backgroundColor: colors.berry,
    borderColor: colors.berry,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  eventCard: {
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  eventCardCompact: {
    width: 292,
  },
  eventImage: {
    width: "100%",
    height: 138,
  },
  eventContent: {
    padding: 15,
    gap: 10,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventMetaText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  smallMuted: {
    color: colors.muted,
    fontSize: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: colors.ink,
    fontSize: 15,
  },
  chipList: {
    gap: 8,
    paddingRight: 18,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  pillTextSelected: {
    color: colors.white,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: "#EFE3D4",
    borderRadius: 16,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    borderRadius: 12,
  },
  segmentItemActive: {
    backgroundColor: colors.surface,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: colors.primary,
  },
  resultText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  noticeCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
  },
  noticeTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  noticeText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  emptyState: {
    alignItems: "center",
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 28,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  profileCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
    ...shadow,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  profileName: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900",
  },
  profileCopy: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 15,
  },
  statValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  preferenceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 15,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 15,
  },
  settingTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  settingCopy: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === "android" ? 10 : 18,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  tabTextActive: {
    color: colors.primary,
  },
});
