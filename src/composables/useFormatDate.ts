import { useI18n } from "vue-i18n";

export interface FormattedDateParts {
  date: string;
  time: string;
}

export function useFormatDate() {
  const { locale } = useI18n();

  const formatDate = (
    date: string | null | undefined
  ): FormattedDateParts | null => {
    if (!date) return null;

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return null;

    const localeTag = locale.value === "ar" ? "ar-EG" : "en-GB";

    return {
      date: new Intl.DateTimeFormat(localeTag, {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(parsed),
      time: new Intl.DateTimeFormat(localeTag, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: locale.value !== "ar",
      }).format(parsed),
    };
  };

  return { formatDate };
}
