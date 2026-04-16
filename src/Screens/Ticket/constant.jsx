export const categoryOptions = [
  { label: "Technical", value: "technical" },
  { label: "Billing", value: "billing" },
  { label: "Feature Request", value: "feature_request" },
  { label: "General Inquiry", value: "general_inquiry" },
  { label: "Bug Report", value: "bug_report" },
];

export const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

export const statusOptions = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

export const mockTickets = [
  {
    id: "TKT-001",
    title: "Login page not loading on mobile",
    description: "The login page fails to load on iOS 16 devices. Users are unable to access the portal.",
    category: "technical",
    priority: "high",
    status: "open",
    createdAt: "2026-04-10",
    attachments: [],
  },
  {
    id: "TKT-002",
    title: "March invoice not generated",
    description: "Monthly invoice for March was not generated for client JFL. Finance team is blocked.",
    category: "billing",
    priority: "medium",
    status: "in_progress",
    createdAt: "2026-04-11",
    attachments: [],
  },
  {
    id: "TKT-003",
    title: "Request for dark mode",
    description: "Multiple customers have requested a dark mode option in the customer portal.",
    category: "feature_request",
    priority: "low",
    status: "open",
    createdAt: "2026-04-12",
    attachments: [],
  },
];
