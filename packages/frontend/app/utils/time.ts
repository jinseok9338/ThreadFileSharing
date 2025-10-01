import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import "dayjs/locale/en";

// dayjs 플러그인 및 로케일 설정
dayjs.extend(relativeTime);

/**
 * 현재 언어에 따른 시간 포맷팅 함수
 * @param timestamp - 포맷팅할 시간
 * @param locale - 언어 설정 (기본: 'ko')
 * @returns 포맷팅된 시간 문자열
 */
export const formatTime = (
  timestamp?: Date | string,
  locale: string = "ko"
): string => {
  if (!timestamp) return "";

  // dayjs 로케일 설정
  dayjs.locale(locale);

  const now = dayjs();
  const time = dayjs(timestamp);
  const diffInMinutes = now.diff(time, "minute");

  // 1분 미만
  if (diffInMinutes < 1) {
    return locale === "ko" ? "방금" : "just now";
  }

  // 1시간 미만
  if (diffInMinutes < 60) {
    return locale === "ko" ? `${diffInMinutes}분 전` : `${diffInMinutes}m ago`;
  }

  // 24시간 미만
  const diffInHours = now.diff(time, "hour");
  if (diffInHours < 24) {
    return locale === "ko" ? `${diffInHours}시간 전` : `${diffInHours}h ago`;
  }

  // 7일 미만
  const diffInDays = now.diff(time, "day");
  if (diffInDays < 7) {
    return locale === "ko" ? `${diffInDays}일 전` : `${diffInDays}d ago`;
  }

  // 1년 미만
  const diffInMonths = now.diff(time, "month");
  if (diffInMonths < 12) {
    return locale === "ko" ? `${diffInMonths}개월 전` : `${diffInMonths}mo ago`;
  }

  // 1년 이상
  const diffInYears = now.diff(time, "year");
  return locale === "ko" ? `${diffInYears}년 전` : `${diffInYears}y ago`;
};

/**
 * 상대적 시간 표시 (dayjs relativeTime 사용)
 * @param timestamp - 포맷팅할 시간
 * @param locale - 언어 설정 (기본: 'ko')
 * @returns 상대적 시간 문자열
 */
export const formatRelativeTime = (
  timestamp?: Date | string,
  locale: string = "ko"
): string => {
  if (!timestamp) return "";

  dayjs.locale(locale);
  return dayjs(timestamp).fromNow();
};

/**
 * 날짜 포맷팅
 * @param timestamp - 포맷팅할 시간
 * @param format - 포맷 문자열 (기본: 'YYYY-MM-DD')
 * @param locale - 언어 설정 (기본: 'ko')
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (
  timestamp?: Date | string,
  format: string = "YYYY-MM-DD",
  locale: string = "ko"
): string => {
  if (!timestamp) return "";

  dayjs.locale(locale);
  return dayjs(timestamp).format(format);
};

/**
 * 시간 포맷팅
 * @param timestamp - 포맷팅할 시간
 * @param format - 포맷 문자열 (기본: 'HH:mm')
 * @param locale - 언어 설정 (기본: 'ko')
 * @returns 포맷팅된 시간 문자열
 */
export const formatDateTime = (
  timestamp?: Date | string,
  format: string = "YYYY-MM-DD HH:mm",
  locale: string = "ko"
): string => {
  if (!timestamp) return "";

  dayjs.locale(locale);
  return dayjs(timestamp).format(format);
};
