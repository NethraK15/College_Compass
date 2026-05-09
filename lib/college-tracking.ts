export const collegeTrackingStatuses = ["LONG_LIST", "SHORT_LIST", "WANT_TO_APPLY", "APPLIED"] as const;

export type CollegeTrackingStatus = (typeof collegeTrackingStatuses)[number];

export const collegeTrackingStatusLabels: Record<CollegeTrackingStatus, string> = {
  LONG_LIST: "Long list",
  SHORT_LIST: "Short list",
  WANT_TO_APPLY: "Want to apply",
  APPLIED: "Applied"
};

export const collegeTrackingStatusStyles: Record<CollegeTrackingStatus, string> = {
  LONG_LIST: "border-slate-200 bg-slate-50 text-slate-700",
  SHORT_LIST: "border-cyan-200 bg-cyan-50 text-cyan-800",
  WANT_TO_APPLY: "border-amber-200 bg-amber-50 text-amber-800",
  APPLIED: "border-emerald-200 bg-emerald-50 text-emerald-800"
};
