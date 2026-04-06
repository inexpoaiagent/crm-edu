import en from "@/messages/en.json";
import tr from "@/messages/tr.json";
import fa from "@/messages/fa.json";

const dictionaries = {
  en,
  tr,
  fa,
} as const;

export type Locale = keyof typeof dictionaries;

export function getDictionary(locale: string | null | undefined) {
  const selected = (locale ?? "en") as Locale;
  return dictionaries[selected] ?? dictionaries.en;
}
