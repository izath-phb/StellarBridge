export const STELLAR_NETWORK = "TESTNET";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";

export const ASSETS = {
  XLM: {
    code: "XLM",
    name: "Stellar Lumens",
    color: "#4f46e5",
    bgColor: "#e0e7ff",
  },
  USDC: {
    code: "USDC",
    name: "USD Coin",
    color: "#16a34a",
    bgColor: "#dcfce7",
  },
  EURC: {
    code: "EURC",
    name: "Euro Coin",
    color: "#2563eb",
    bgColor: "#dbeafe",
  },
};

export const MOCK_ISSUER_PUBKEY = "GA7T4LN4USEO7W5FPEOOPVXYNTNC6DA7MGT5XZIT2FMFAMLRZ6EEMTZK";
export const MOCK_ISSUER_SECRET = "SBSM5TGKHZ6AXAISSEE5U4GUBG2QW7ZNHREM6Y37D6DDHX7Q3Q3AEMKO";

export const MOCK_TRANSACTIONS = [
  { id: "1", type: "received", amount: "200", asset: "USDC", from: "GXXX...1234", to: "You", date: "2026-07-13", status: "SUCCESS", hash: "abc123def" },
  { id: "2", type: "sent", amount: "50", asset: "USDC", from: "You", to: "GYYY...5678", date: "2026-07-12", status: "SUCCESS", hash: "def456abc" },
  { id: "3", type: "received", amount: "100", asset: "XLM", from: "GZZZ...9012", to: "You", date: "2026-07-11", status: "SUCCESS", hash: "ghi789jkl" },
  { id: "4", type: "escrow", amount: "500", asset: "USDC", from: "You", to: "GZZZ...3456", date: "2026-07-10", status: "PENDING", hash: "mno012pqr" },
  { id: "5", type: "sent", amount: "25", asset: "XLM", from: "You", to: "GAAA...7890", date: "2026-07-09", status: "SUCCESS", hash: "stu345vwx" },
];

export const MOCK_ESCROWS = [
  { id: "ESC-001", title: "Website Development", client: "Digital Studio Japan", freelancer: "Alex Dev", amount: "500", asset: "USDC", status: "FUNDED", createdAt: "2026-07-10" },
  { id: "ESC-002", title: "Logo Design", client: "You", freelancer: "Maria Design", amount: "150", asset: "USDC", status: "APPROVED", createdAt: "2026-07-08" },
  { id: "ESC-003", title: "Mobile App UI", client: "StartupX", freelancer: "You", amount: "1200", asset: "USDC", status: "RELEASED", createdAt: "2026-07-01" },
];

export const MOCK_INVOICES = [
  { id: "INV-2026-001", amount: "10000", asset: "USDC", status: "PENDING", client: "Acme Corp", dueDate: "2026-07-30", createdAt: "2026-07-13", clientAddress: "" },
  { id: "INV-2026-002", amount: "2500", asset: "USDC", status: "PAID", client: "Tech Startup", dueDate: "2026-07-15", createdAt: "2026-07-05", clientAddress: "" },
  { id: "INV-2026-003", amount: "800", asset: "XLM", status: "COMPLETED", client: "Creative Agency", dueDate: "2026-07-10", createdAt: "2026-06-30", clientAddress: "" },
];

export const MOCK_MERCHANTS = [
  { id: "MER-001", name: "Digital Studio Japan", category: "Design", revenue: "15000", customers: 42, rating: 4.9 },
  { id: "MER-002", name: "GlobalDev Solutions", category: "Development", revenue: "80000", customers: 128, rating: 4.8 },
];

export const MOCK_COMMUNITIES = [
  { id: "COM-001", name: "APAC Developer Fund", members: 1000, treasury: "50000", currency: "USDC", proposals: 12 },
  { id: "COM-002", name: "Freelancer Guild ASEAN", members: 543, treasury: "22000", currency: "USDC", proposals: 5 },
];
