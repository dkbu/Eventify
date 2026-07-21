const MENU_ID = "eventify-find-dates";

const DATE_FORMATS = [
  "YYYY-MM-DD",
  "MM/DD/YYYY",
  "M/D/YYYY",
  "MM-DD-YYYY",
  "M-D-YYYY",
  "DD/MM/YYYY",
  "D/M/YYYY",
  "DD-MM-YYYY",
  "D-M-YYYY",
  "MMM D, YYYY",
  "MMMM D, YYYY",
  "D MMM YYYY",
  "D MMMM YYYY"
];

const PARTIAL_DATE_FORMATS = [
  "MM/DD",
  "M/D",
  "MM-DD",
  "M-D",
  "DD/MM",
  "D/M",
  "DD-MM",
  "D-M",
  "MMM D",
  "MMMM D",
  "D MMM",
  "D MMMM"
];

const MONTH_NAME_PATTERN = "(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)";
const DATE_CANDIDATE_PATTERN_FLAGS = "gi";

const FORMAT_TOKEN_TO_PATTERN = {
  YYYY: "\\d{4}",
  MMMM: MONTH_NAME_PATTERN,
  MMM: MONTH_NAME_PATTERN,
  MM: "\\d{1,2}",
  M: "\\d{1,2}",
  DD: "\\d{1,2}",
  D: "\\d{1,2}"
};

const FORMAT_TOKENS = Object.keys(FORMAT_TOKEN_TO_PATTERN).sort((a, b) => b.length - a.length);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatToRegex(format) {
  let pattern = escapeRegExp(format).replace(/\s+/g, "\\s+");
  for (const token of FORMAT_TOKENS) {
    pattern = pattern.replace(new RegExp(token, "g"), FORMAT_TOKEN_TO_PATTERN[token]);
  }

  // Allow optional comma in month-name formats like "Oct 2, 2026" and "Oct 2 2026".
  return pattern.replace(/,\\s\+/g, ",?\\s+");
}

const DATE_CANDIDATE_PATTERN_PARTS = Array.from(
  new Set([...DATE_FORMATS, ...PARTIAL_DATE_FORMATS].map(formatToRegex))
);

const DATE_CANDIDATE_PATTERN_SOURCE = String.raw`\b(?:${DATE_CANDIDATE_PATTERN_PARTS.join("|")})\b`;

const DATE_CANDIDATE_PATTERN = new RegExp(
  DATE_CANDIDATE_PATTERN_SOURCE,
  DATE_CANDIDATE_PATTERN_FLAGS
);

function findDates(text) {
  const matches = text.match(DATE_CANDIDATE_PATTERN) || [];
  const uniqueNormalizedDates = new Set();
  const currentYear = moment().year();
  const partialFormatsWithYear = PARTIAL_DATE_FORMATS.map((format) => `${format} YYYY`);

  for (const rawCandidate of matches) {
    const candidate = rawCandidate.trim();
    const parsed = moment(candidate, DATE_FORMATS, true);
    if (parsed.isValid()) {
      uniqueNormalizedDates.add(parsed.format("YYYY-MM-DD"));
      continue;
    }

    const isoParsed = moment(candidate, moment.ISO_8601, true);
    if (isoParsed.isValid()) {
      uniqueNormalizedDates.add(isoParsed.format("YYYY-MM-DD"));
      continue;
    }

    const partialParsed = moment(`${candidate} ${currentYear}`, partialFormatsWithYear, true);
    if (partialParsed.isValid()) {
      uniqueNormalizedDates.add(partialParsed.format("YYYY-MM-DD"));
    }
  }

  return Array.from(uniqueNormalizedDates).sort();
}

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: MENU_ID,
    title: "Find dates in selected text",
    contexts: ["selection"]
  });
});

browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== MENU_ID) {
    return;
  }

  const selection = (info.selectionText || "").trim();
  if (!selection) {
    return;
  }

  const dates = findDates(selection);

  const debugPattern = `/${DATE_CANDIDATE_PATTERN_SOURCE}/${DATE_CANDIDATE_PATTERN_FLAGS}`;
  const message = dates.length
    ? `Found ${dates.length} date(s): ${dates.join(", ")}`
    : `No recognizable dates found in selected text. Pattern: ${debugPattern}`;

  if (!dates.length) {
    console.debug("Eventify date regex pattern:", debugPattern);
  }

  browser.notifications.create({
    type: "basic",
    iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='10' ry='10' fill='%230066cc'/%3E%3Ctext x='32' y='41' font-size='30' text-anchor='middle' fill='white'%3ET%3C/text%3E%3C/svg%3E",
    title: "Eventify Date Search",
    message
  });
});
