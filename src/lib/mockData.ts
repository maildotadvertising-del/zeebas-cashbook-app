export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  description: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  category: string;
}

export const invoices: Invoice[] = [
  { id: "1", number: "INV-001", client: "Acme Corp", amount: 4500, date: "2024-01-05", dueDate: "2024-02-05", status: "paid", description: "Web development services" },
  { id: "2", number: "INV-002", client: "TechStart Inc", amount: 2200, date: "2024-01-12", dueDate: "2024-02-12", status: "paid", description: "UI/UX design" },
  { id: "3", number: "INV-003", client: "Global Media", amount: 8750, date: "2024-01-20", dueDate: "2024-02-20", status: "overdue", description: "Content management system" },
  { id: "4", number: "INV-004", client: "Bright Futures", amount: 1600, date: "2024-02-01", dueDate: "2024-03-01", status: "pending", description: "Logo design" },
  { id: "5", number: "INV-005", client: "Summit Analytics", amount: 5300, date: "2024-02-10", dueDate: "2024-03-10", status: "paid", description: "Data dashboard" },
  { id: "6", number: "INV-006", client: "BlueSky Ventures", amount: 3400, date: "2024-02-18", dueDate: "2024-03-18", status: "pending", description: "Mobile app prototype" },
  { id: "7", number: "INV-007", client: "NovaTech", amount: 7200, date: "2024-03-01", dueDate: "2024-04-01", status: "overdue", description: "Backend API integration" },
  { id: "8", number: "INV-008", client: "Sunrise Events", amount: 1900, date: "2024-03-08", dueDate: "2024-04-08", status: "paid", description: "Event website" },
  { id: "9", number: "INV-009", client: "Coastal Realty", amount: 6100, date: "2024-03-15", dueDate: "2024-04-15", status: "pending", description: "Property management portal" },
  { id: "10", number: "INV-010", client: "Urban Eats", amount: 2800, date: "2024-03-22", dueDate: "2024-04-22", status: "paid", description: "Food delivery app" },
  { id: "11", number: "INV-011", client: "Mountain Gear Co", amount: 4100, date: "2024-04-02", dueDate: "2024-05-02", status: "overdue", description: "E-commerce platform" },
  { id: "12", number: "INV-012", client: "Zenith Studios", amount: 3700, date: "2024-04-10", dueDate: "2024-05-10", status: "paid", description: "Video streaming integration" },
  { id: "13", number: "INV-013", client: "PeakPerform", amount: 5500, date: "2024-04-18", dueDate: "2024-05-18", status: "pending", description: "Fitness tracking app" },
  { id: "14", number: "INV-014", client: "Harbor Health", amount: 9200, date: "2024-05-01", dueDate: "2024-06-01", status: "paid", description: "Patient management system" },
  { id: "15", number: "INV-015", client: "Skyline Architecture", amount: 4800, date: "2024-05-10", dueDate: "2024-06-10", status: "pending", description: "Portfolio website" },
  { id: "16", number: "INV-016", client: "Prime Logistics", amount: 6700, date: "2024-05-20", dueDate: "2024-06-20", status: "overdue", description: "Fleet management dashboard" },
  { id: "17", number: "INV-017", client: "Ember Finance", amount: 11500, date: "2024-06-01", dueDate: "2024-07-01", status: "paid", description: "Financial reporting tool" },
  { id: "18", number: "INV-018", client: "Crystal Clear Media", amount: 3200, date: "2024-06-10", dueDate: "2024-07-10", status: "pending", description: "Social media integration" },
  { id: "19", number: "INV-019", client: "Swift Delivery", amount: 2600, date: "2024-06-18", dueDate: "2024-07-18", status: "paid", description: "Courier tracking system" },
  { id: "20", number: "INV-020", client: "Apex Consulting", amount: 7800, date: "2024-06-25", dueDate: "2024-07-25", status: "pending", description: "CRM implementation" },
  { id: "21", number: "INV-021", client: "Fern Botanicals", amount: 1400, date: "2024-07-05", dueDate: "2024-08-05", status: "paid", description: "Online store" },
  { id: "22", number: "INV-022", client: "Iron Bridge Tech", amount: 8900, date: "2024-07-15", dueDate: "2024-08-15", status: "overdue", description: "Infrastructure monitoring" },
];

export const expenses: Expense[] = [
  { id: "1", date: "2024-01-03", description: "AWS hosting", category: "Infrastructure", amount: 320 },
  { id: "2", date: "2024-01-05", description: "Office lunch", category: "Food & Dining", amount: 85 },
  { id: "3", date: "2024-01-08", description: "Figma subscription", category: "Software", amount: 45 },
  { id: "4", date: "2024-01-10", description: "Uber to client meeting", category: "Transport", amount: 28 },
  { id: "5", date: "2024-01-12", description: "Internet bill", category: "Utilities", amount: 89 },
  { id: "6", date: "2024-01-15", description: "GitHub Pro", category: "Software", amount: 10 },
  { id: "7", date: "2024-01-18", description: "Office supplies", category: "Office", amount: 65 },
  { id: "8", date: "2024-01-22", description: "Team dinner", category: "Food & Dining", amount: 142 },
  { id: "9", date: "2024-01-25", description: "Electricity bill", category: "Utilities", amount: 110 },
  { id: "10", date: "2024-02-02", description: "Notion subscription", category: "Software", amount: 16 },
  { id: "11", date: "2024-02-05", description: "Coffee shop work", category: "Food & Dining", amount: 34 },
  { id: "12", date: "2024-02-08", description: "Train tickets", category: "Transport", amount: 56 },
  { id: "13", date: "2024-02-12", description: "Digital Ocean", category: "Infrastructure", amount: 240 },
  { id: "14", date: "2024-02-15", description: "Printer cartridges", category: "Office", amount: 48 },
  { id: "15", date: "2024-02-18", description: "Adobe Creative Cloud", category: "Software", amount: 55 },
  { id: "16", date: "2024-02-22", description: "Phone bill", category: "Utilities", amount: 75 },
  { id: "17", date: "2024-02-25", description: "Parking fees", category: "Transport", amount: 22 },
  { id: "18", date: "2024-03-01", description: "Slack workspace", category: "Software", amount: 30 },
  { id: "19", date: "2024-03-05", description: "Business lunch", category: "Food & Dining", amount: 95 },
  { id: "20", date: "2024-03-08", description: "AWS hosting", category: "Infrastructure", amount: 380 },
  { id: "21", date: "2024-03-12", description: "Freelance contractor", category: "Staff", amount: 1200 },
  { id: "22", date: "2024-03-15", description: "Standing desk", category: "Office", amount: 420 },
  { id: "23", date: "2024-03-18", description: "Conference ticket", category: "Education", amount: 299 },
  { id: "24", date: "2024-03-22", description: "Internet + phone bundle", category: "Utilities", amount: 159 },
  { id: "25", date: "2024-04-02", description: "Linear subscription", category: "Software", amount: 18 },
  { id: "26", date: "2024-04-05", description: "Team lunch", category: "Food & Dining", amount: 178 },
  { id: "27", date: "2024-04-10", description: "Vercel Pro", category: "Infrastructure", amount: 20 },
  { id: "28", date: "2024-04-15", description: "Taxi rides", category: "Transport", amount: 67 },
  { id: "29", date: "2024-04-20", description: "Online course", category: "Education", amount: 149 },
  { id: "30", date: "2024-05-01", description: "AWS hosting", category: "Infrastructure", amount: 290 },
  { id: "31", date: "2024-05-05", description: "Coffee supplies", category: "Food & Dining", amount: 42 },
  { id: "32", date: "2024-05-10", description: "Freelance designer", category: "Staff", amount: 800 },
  { id: "33", date: "2024-05-15", description: "Zoom subscription", category: "Software", amount: 15 },
];

export const monthlyData: MonthlyData[] = [
  { month: "Jan", income: 6700, expenses: 909 },
  { month: "Feb", income: 8700, expenses: 536 },
  { month: "Mar", income: 10000, expenses: 2583 },
  { month: "Apr", income: 14600, expenses: 932 },
  { month: "May", income: 9300, expenses: 1147 },
  { month: "Jun", income: 13300, expenses: 0 },
  { month: "Jul", income: 0, expenses: 0 },
  { month: "Aug", income: 0, expenses: 0 },
  { month: "Sep", income: 0, expenses: 0 },
  { month: "Oct", income: 0, expenses: 0 },
  { month: "Nov", income: 0, expenses: 0 },
  { month: "Dec", income: 0, expenses: 0 },
];

export const recentTransactions: Transaction[] = [
  { id: "1", date: "2024-07-15", description: "Iron Bridge Tech - INV-022", type: "income", amount: 8900, category: "Invoice" },
  { id: "2", date: "2024-07-10", description: "AWS hosting", type: "expense", amount: 320, category: "Infrastructure" },
  { id: "3", date: "2024-07-05", description: "Fern Botanicals - INV-021", type: "income", amount: 1400, category: "Invoice" },
  { id: "4", date: "2024-06-28", description: "Freelance contractor", type: "expense", amount: 1200, category: "Staff" },
  { id: "5", date: "2024-06-25", description: "Apex Consulting - INV-020", type: "income", amount: 7800, category: "Invoice" },
  { id: "6", date: "2024-06-20", description: "Team dinner", type: "expense", amount: 142, category: "Food & Dining" },
  { id: "7", date: "2024-06-18", description: "Swift Delivery - INV-019", type: "income", amount: 2600, category: "Invoice" },
  { id: "8", date: "2024-06-10", description: "Adobe Creative Cloud", type: "expense", amount: 55, category: "Software" },
];

export const expenseCategories = [
  { name: "Infrastructure", value: 1250, color: "#6366f1" },
  { name: "Software", value: 189, color: "#8b5cf6" },
  { name: "Food & Dining", value: 576, color: "#06b6d4" },
  { name: "Transport", value: 173, color: "#10b981" },
  { name: "Utilities", value: 433, color: "#f59e0b" },
  { name: "Office", value: 533, color: "#ef4444" },
  { name: "Staff", value: 2000, color: "#ec4899" },
  { name: "Education", value: 448, color: "#14b8a6" },
];
