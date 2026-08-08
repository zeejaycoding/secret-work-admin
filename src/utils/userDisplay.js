export function getUserStatus(u) {
  return u?.status === "suspended" ? "Suspended" : "Active";
}

export function getPlanLabel(u) {
  if (u?.subscriptionTier === "free") return "Free";
  return u?.billingInterval === "annual" ? "Annual" : "Monthly";
}

export function getRoleLabel(u) {
  return u?.role === "coach" ? "Coach" : "Member";
}

export function getUserName(u) {
  const first = u?.firstName || "";
  const last = u?.lastName || "";
  return first || last ? `${first} ${last}`.trim() : "Unknown user";
}

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const statusColors = {
  Active: { bg: "#132018", color: "#22C55E" },
  Suspended: { bg: "#2A0F12", color: "#E50914" },
};
