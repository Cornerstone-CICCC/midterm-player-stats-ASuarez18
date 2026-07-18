/**
 * @function getFlagEmoji
 * @description Generates a flag emoji dynamically from a country name or ISO 2-letter code.
 * @param country - The name or ISO alpha-2 code of the country (e.g., "Spain", "ES", "Mexico", "MX").
 * @returns The flag emoji as a string, or a white flag if unmatched.
 */
export const getFlagEmoji = (country: string): string => {
  if (!country) return "🏳️";

  const countryToISO: Record<string, string> = {
    // Other countries
    morocco: "MA",
    denmark: "DK",

    // Europe (UEFA)
    spain: "ES",
    france: "FR",
    england: "GB", 
    portugal: "PT",
    netherlands: "NL",
    germany: "DE",
    belgium: "BE",
    italy: "IT",
    croatia: "HR",
    switzerland: "CH",
    austria: "AT",
    turkey: "TR",

    // North & Central America (CONCACAF)
    mexico: "MX",
    usa: "US",
    "united states": "US",
    canada: "CA",
    "costa rica": "CR",
    jamaica: "JM",
    panama: "PA",

    // South America (CONMEBOL)
    argentina: "AR",
    brazil: "BR",
    uruguay: "UY",
    colombia: "CO",
    ecuador: "EC",
    chile: "CL",
    peru: "PE",
    venezuela: "VE",

    // Africa (CAF)
    senegal: "SN",
    egypt: "EG",
    nigeria: "NG",
    cameroon: "CM",
    ghana: "GH",
    algeria: "DZ",
    tunisia: "TN",
    "south africa": "ZA",

    // Asia & Oceania (AFC)
    japan: "JP",
    "south korea": "KR",
    australia: "AU",
    iran: "IR",
    "saudi arabia": "SA",
    iraq: "IQ",
    qatar: "QA",
    "new zealand": "NZ"
  };

  // 1. Obtain the ISO code from the country name or use the provided ISO code directly
  const cleanInput = country.trim().toLowerCase();
  const isoCode = countryToISO[cleanInput] || (country.length === 2 ? country.toUpperCase() : null);

  if (!isoCode) return "🏳️";

  // 2. Algorithm to convert ISO code to flag emoji
  return String.fromCodePoint(
    ...Array.from(isoCode).map((char) => char.charCodeAt(0) + 127397)
  );
};

/**
 * @function getInitials
 * @description Returns the initials of a given name. For PFP of players without images.
 * @param name - The full name of the player.
 * @returns The initials of the name in uppercase.
 */
export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * @function formatDate
 * @description Formats a date string into "DD MMM YYYY" format (e.g., "25 Dec 2023").
 * @param dateStr - The date string to format (e.g., "2023-12-25").
 * @returns The formatted date string.
 */
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
