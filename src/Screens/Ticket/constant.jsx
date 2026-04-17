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

export const TicketsData = [
  {
    "id": 1,
    "Date": "2025-09-19",
    "Client ": "Client 2",
    "Module": "DPAI",
    "Environment": "UAT",
    "Title": "Calendar Save Fails with 400 Error",
    "Issues": "While configuring a calendar the system does not allow saving and returns status code: 400",
    "Status": "Severity 2 (Moderate) ",
    "Ticket Category": "Environment issue",
    "Delivery SPOC": "Nikita"
  },
  {
    "id": 2,
    "Date": "2025-12-23",
    "Client ": "Client 1",
    "Module": "DPAI",
    "Environment": "Prod",
    "Title": "Generated Forecast Not Visible on UI",
    "Issues": "On Prod platform, the forecast has generated successfully but on UI it is not visible",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Other",
    "Delivery SPOC": "Nikita"
  },
  {
    "id": 3,
    "Date": "2025-10-10",
    "Client ": "Client 1",
    "Module": "DPAI",
    "Environment": "Prod",
    "Title": "Forecast Stuck in Progress for Trigger Date",
    "Issues": "The forecast with trigger date as 09-10-2025, isn\u2019t generated yet and the status remains \"Forecast in Progress\".",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Environment issue",
    "Delivery SPOC": "Nikita"
  },
  {
    "id": 4,
    "Date": "2025-12-23",
    "Client ": "Client 1",
    "Module": "DPAI",
    "Environment": "Prod",
    "Title": "SNOP Stuck in Progress and DFUs Not Loading",
    "Issues": "SNOP status stuck at Forecast in Progress and DFUs not loading",
    "Status": "Severity 3 (Minor)",
    "Ticket Category": "Performance issue",
    "Delivery SPOC": "Nikita"
  },
  {
    "id": 5,
    "Date": "2025-11-18",
    "Client ": "Client 2",
    "Module": "DPAI",
    "Environment": "UAT",
    "Title": "Forecast Download Fails from Grid",
    "Issues": "When attempting to download the forecast from the grid, the system displays a toaster message \"Download Failed, Please Try Again\".",
    "Status": " Severity 2 (Moderate) ",
    "Ticket Category": "Configuration gap",
    "Delivery SPOC": "Nikita"
  },
  {
    "id": 6,
    "Date": "2026-02-26",
    "Client ": "Client 1",
    "Module": "TMS",
    "Environment": "Prod",
    "Title": "Route Re-Sync Reflects Unmaintained Routes",
    "Issues": "Route Re Sync button has bug, \nRoutes are reflecting even when it is not maintained in Route Master",
    "Status": " Severity 2 (Moderate) ",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Shyam"
  },
  {
    "id": 7,
    "Date": "2026-03-06",
    "Client ": "Client 1",
    "Module": "TMS",
    "Environment": "Prod",
    "Title": "Add Customer Name/Code Sorting on Multi Planning",
    "Issues": "On Multi Planning page, Client needs sorting option for Customer Name/Code",
    "Status": " Severity 2 (Moderate) ",
    "Ticket Category": "Configuration gap",
    "Delivery SPOC": "Shyam"
  },
  {
    "id": 8,
    "Date": "2026-03-23",
    "Client ": "Client 1",
    "Module": "TMS",
    "Environment": "Prod",
    "Title": "Complete Loading Fails in TMS",
    "Issues": "Getting error while performing complete loading in TMS",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Shyam"
  },
  {
    "id": 9,
    "Date": "2026-01-05",
    "Client ": "Client 2",
    "Module": "EDM",
    "Environment": "Prod",
    "Title": "Personnel Master Upload Fails with Network Error",
    "Issues": "While uploading the Personnel Master file in EDM, a popup message \"Network Error\" is displayed and the upload fails",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Other",
    "Delivery SPOC": "Nikita"
  },
  {
    "id": 10,
    "Date": "2025-11-12",
    "Client ": "Client 3",
    "Module": "EDM",
    "Environment": "Prod",
    "Title": "Personnel Demand Hierarchy Sequence Incorrect",
    "Issues": "demand hierarchy in Personnel stored in wrong sequence when more than 9 hierarchies defined",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Data issue",
    "Delivery SPOC": "Ken"
  },
  {
    "id": 11,
    "Date": "2026-01-12",
    "Client ": "Client 2",
    "Module": "EDM",
    "Environment": "PROD",
    "Title": "Downloaded EDM File Contains Duplicate Records",
    "Issues": "File downloaded from EDM is having duplicate records. While no duplicate records were uploaded in EDM",
    "Status": " Severity 2 (Moderate) ",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Sam"
  },
  {
    "id": 12,
    "Date": "2025-11-04",
    "Client ": "Client 3",
    "Module": "EDM",
    "Environment": "PROD",
    "Title": "Network Master Download Missing Mandatory Columns",
    "Issues": " When downloading the Network Master, all mandatory columns are missing. In the EDM UI, columns like Start Node, End Node, SKU Code, Mode of Transport, and others are not included in the downloaded file.",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Hershita"
  },
  {
    "id": 13,
    "Date": "2026-02-13",
    "Client ": "Client 3",
    "Module": "EDM",
    "Environment": "UAT",
    "Title": "Budget Upload Shows Error Without Error File",
    "Issues": "The user uploaded the budget template, but the status shows an error. However, the skipped records count is displayed as 0, and the error file for the Budget entity is also not available for download.",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Hershita"
  },
  {
    "id": 14,
    "Date": "2026-04-06",
    "Client ": "Client 3",
    "Module": "EDM",
    "Environment": "UAT",
    "Title": "Transaction Logs Missing Data for PIM Filter",
    "Issues": "[UAT] Transaction Logs Not Showing Data for PIM Entity Filter",
    "Status": "Severity 2 (Moderate) ",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Aniket "
  },
  {
    "id": 15,
    "Date": "2025-11-04",
    "Client ": "Client 3",
    "Module": "EDM",
    "Environment": "PROD",
    "Title": "Mapping Master Shows N/A for Quantity UOM",
    "Issues": "While downloading the Mapping Master, the Quantity UOM column shows \u201cN/A.\u201d",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Hershita"
  },
  {
    "id": 16,
    "Date": "2025-11-27",
    "Client ": "Client 3",
    "Module": "EDM",
    "Environment": "PROD",
    "Title": "Uploaded By Field Shows Incorrect Username",
    "Issues": "When the user uploads the master data, the uploader\u2019s username should automatically appear in the \u201cUploaded By\u201d field of the transaction log. Currently, the correct username is not being displayed.",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Hershita"
  },
  {
    "id": 206,
    "Date": "2026-02-06",
    "Client ": "Client 2",
    "Module": "DS",
    "Environment": "PROD",
    "Title": "Abnormal Forecast Spike in Last Two Horizons",
    "Issues": "Abnormal spike in forecast values for the last two horizons.\n> SNOP- S&OP January 2026",
    "Status": "Severity 1 (High)",
    "Ticket Category": "Bug (Code defect)",
    "Delivery SPOC": "Sam"
  },
  {
    "id": 207,
    "Date": "2025-09-22",
    "Client ": "Client 2",
    "Module": "DS",
    "Environment": "UAT",
    "Title": "SNOP Forecast Status Remains In Progress",
    "Issues": "The forecast status is showing as \u201cIn Progress\u201d even though the SNOP was successfully created on 19th.",
    "Status": "Severity 2 (Moderate) ",
    "Ticket Category": "Other",
    "Delivery SPOC": "Nikita"
  }
]