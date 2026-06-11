const blockedWords = [
  "fuck",
  "fucker",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "dick",
  "cock",
  "pussy",
  "nigger",
  "nigga",
  "fag",
  "faggot",
  "whore",
  "slut",
  "cum",
  "porn",
  "sex",
];

const reservedNames = [
  "admin",
  "administrator",
  "moderator",
  "support",
  "world cup",
  "fifa",
  "official",
  "system",
];

const validNamePattern = /^[a-zA-Z0-9 _-]+$/;

export function normalizeDisplayName(value: string) {
  return value.trim();
}

export function getDisplayNameError(value: unknown) {
  if (typeof value !== "string") {
    return "Please enter your name or nickname.";
  }

  const displayName = normalizeDisplayName(value);
  const normalizedName = displayName.toLowerCase().replace(/\s+/g, " ");

  if (displayName.length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (displayName.length > 25) {
    return "Name must be 25 characters or fewer.";
  }

  if (!validNamePattern.test(displayName)) {
    return "Name contains invalid characters.";
  }

  if (blockedWords.some((word) => normalizedName.includes(word))) {
    return "Please choose a different display name.";
  }

  if (
    reservedNames.some(
      (reservedName) =>
        normalizedName === reservedName || normalizedName.includes(reservedName)
    )
  ) {
    return "Please choose a different display name.";
  }

  return "";
}
