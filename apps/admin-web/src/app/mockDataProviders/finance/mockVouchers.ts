// ============================================================================
// MOCK VOUCHERS - Daily Expense Voucher System
// ============================================================================
// Audit-ready daily voucher/expense management with approval workflow

export type VoucherStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type ExpenseCategory = 'Hospitality' | 'Utilities' | 'Stationery' | 'Maintenance' | 'Transport' | 'Cleaning' | 'Events' | 'Printing' | 'Misc';
export type PaymentMode = 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI';

export interface Voucher {
  voucher_id: number;
  voucher_number: string;
  date: string;
  expense_category: ExpenseCategory;
  description: string;
  amount: number;
  gst_percent: number;
  gst_amount: number;
  total_amount: number;
  payment_mode: PaymentMode;
  paid_to: string;
  bill_reference?: string;
  attachment_url?: string;
  attachment_name?: string;
  created_by: string;
  created_by_role: string;
  approved_by?: string;
  approved_by_role?: string;
  approval_date?: string;
  approval_comment?: string;
  status: VoucherStatus;
  audit_flag: boolean;
  created_at: string;
  updated_at?: string;
}

export interface VoucherCreate {
  date: string;
  expense_category: ExpenseCategory;
  description: string;
  amount: number;
  gst_percent: number;
  payment_mode: PaymentMode;
  paid_to: string;
  bill_reference?: string;
  attachment_name?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

let voucherIdCounter = 5000;

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Hospitality', 'Utilities', 'Stationery', 'Maintenance', 'Transport', 'Cleaning', 'Events', 'Printing', 'Misc'];
const PAYMENT_MODES: PaymentMode[] = ['Cash', 'Bank Transfer', 'Cheque', 'UPI'];

function generateVoucherNumber(id: number): string {
  return `VCH-2025-${String(id).padStart(5, '0')}`;
}

function generateInitialVouchers(): Voucher[] {
  const vouchers: Voucher[] = [];

  const entries: Array<{
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    gst: number;
    mode: PaymentMode;
    paid_to: string;
    status: VoucherStatus;
    bill_ref?: string;
    attachment?: string;
  }> = [
    // January 2025
    { date: '2025-01-06', category: 'Utilities', description: 'Electricity bill for main building - Jan', amount: 28500, gst: 18, mode: 'Bank Transfer', paid_to: 'MSEDCL', status: 'approved', bill_ref: 'EB-JAN-2025', attachment: 'electricity_jan.pdf' },
    { date: '2025-01-08', category: 'Stationery', description: 'Whiteboard markers, chalk, dusters - Bulk purchase', amount: 4250, gst: 12, mode: 'Cash', paid_to: 'Sarvodaya Stationery', status: 'approved', bill_ref: 'SS-0089' },
    { date: '2025-01-10', category: 'Cleaning', description: 'Monthly cleaning supplies - Phenyl, bleach, mops', amount: 3800, gst: 5, mode: 'Cash', paid_to: 'Swachh Supplies', status: 'approved' },
    { date: '2025-01-15', category: 'Maintenance', description: 'Plumbing repair in boys washroom Block B', amount: 7500, gst: 0, mode: 'Cash', paid_to: 'Ganesh Plumbing Works', status: 'approved' },
    { date: '2025-01-20', category: 'Transport', description: 'Diesel for school bus fleet - January', amount: 45000, gst: 18, mode: 'Bank Transfer', paid_to: 'Indian Oil', status: 'approved', bill_ref: 'IOC-2025-1120' },
    { date: '2025-01-22', category: 'Hospitality', description: 'Tea & snacks for PTA meeting', amount: 2800, gst: 5, mode: 'Cash', paid_to: 'Sharma Caterers', status: 'approved' },

    // February 2025
    { date: '2025-02-03', category: 'Utilities', description: 'Water tanker supply x 4', amount: 12000, gst: 0, mode: 'Cash', paid_to: 'Jal Suppliers', status: 'approved' },
    { date: '2025-02-05', category: 'Utilities', description: 'Electricity bill for main building - Feb', amount: 31200, gst: 18, mode: 'Bank Transfer', paid_to: 'MSEDCL', status: 'approved', bill_ref: 'EB-FEB-2025', attachment: 'electricity_feb.pdf' },
    { date: '2025-02-10', category: 'Maintenance', description: 'AC servicing - Staff room and Principal office', amount: 8500, gst: 18, mode: 'Cheque', paid_to: 'Cool Tech Services', status: 'approved', bill_ref: 'CTS-445' },
    { date: '2025-02-12', category: 'Printing', description: 'Report card printing 800 copies', amount: 16000, gst: 12, mode: 'UPI', paid_to: 'Shree Printers', status: 'approved' },
    { date: '2025-02-14', category: 'Events', description: "Decoration for Republic Day event", amount: 5500, gst: 0, mode: 'Cash', paid_to: 'Event Decor Shop', status: 'approved' },
    { date: '2025-02-18', category: 'Transport', description: 'Bus tyre replacement x 2 (Bus #3)', amount: 18000, gst: 18, mode: 'Bank Transfer', paid_to: 'Apollo Tyres Dealer', status: 'approved', bill_ref: 'APL-7788' },
    { date: '2025-02-20', category: 'Stationery', description: 'A4 paper 50 reams, files, folders', amount: 8900, gst: 12, mode: 'UPI', paid_to: 'Sarvodaya Stationery', status: 'approved', bill_ref: 'SS-0112' },
    { date: '2025-02-25', category: 'Cleaning', description: 'Deep cleaning chemicals for annual cleaning', amount: 6200, gst: 5, mode: 'Cash', paid_to: 'Swachh Supplies', status: 'approved' },

    // March 2025
    { date: '2025-03-03', category: 'Utilities', description: 'Internet & WiFi bill - March', amount: 9500, gst: 18, mode: 'Bank Transfer', paid_to: 'Airtel Business', status: 'approved', bill_ref: 'AIR-MAR-25' },
    { date: '2025-03-05', category: 'Maintenance', description: 'Electrical wiring repair in Lab 2', amount: 12000, gst: 0, mode: 'Cash', paid_to: 'Rajesh Electricals', status: 'approved' },
    { date: '2025-03-08', category: 'Events', description: 'Annual Day stage setup and sound system rental', amount: 35000, gst: 18, mode: 'Bank Transfer', paid_to: 'Sound & Light Co', status: 'approved', bill_ref: 'SLC-2025-003' },
    { date: '2025-03-10', category: 'Hospitality', description: 'Lunch for 50 guests - Annual Day function', amount: 25000, gst: 5, mode: 'Bank Transfer', paid_to: 'Bhagwati Caterers', status: 'approved', bill_ref: 'BC-1234' },
    { date: '2025-03-12', category: 'Printing', description: 'Annual report brochures 200 copies', amount: 12500, gst: 12, mode: 'UPI', paid_to: 'Shree Printers', status: 'approved' },
    { date: '2025-03-15', category: 'Stationery', description: 'Exam answer booklets 2000 pcs', amount: 14000, gst: 12, mode: 'UPI', paid_to: 'Sarvodaya Stationery', status: 'approved', bill_ref: 'SS-0145' },
    { date: '2025-03-20', category: 'Transport', description: 'Diesel for school bus fleet - March', amount: 48000, gst: 18, mode: 'Bank Transfer', paid_to: 'Indian Oil', status: 'approved', bill_ref: 'IOC-2025-1445' },

    // April 2025
    { date: '2025-04-02', category: 'Utilities', description: 'Electricity bill - April (Summer peak)', amount: 42000, gst: 18, mode: 'Bank Transfer', paid_to: 'MSEDCL', status: 'approved', bill_ref: 'EB-APR-2025' },
    { date: '2025-04-07', category: 'Maintenance', description: 'Classroom desk repair 25 units', amount: 15000, gst: 0, mode: 'Cash', paid_to: 'Furniture Mart', status: 'approved' },
    { date: '2025-04-10', category: 'Stationery', description: 'New academic year supplies - registers, chalk', amount: 22000, gst: 12, mode: 'Bank Transfer', paid_to: 'Sarvodaya Stationery', status: 'approved', bill_ref: 'SS-0178' },
    { date: '2025-04-15', category: 'Cleaning', description: 'Washroom renovation supplies', amount: 18000, gst: 18, mode: 'UPI', paid_to: 'Home Centre', status: 'approved' },

    // May 2025
    { date: '2025-05-05', category: 'Utilities', description: 'Electricity bill - May', amount: 38500, gst: 18, mode: 'Bank Transfer', paid_to: 'MSEDCL', status: 'approved', bill_ref: 'EB-MAY-2025' },
    { date: '2025-05-08', category: 'Maintenance', description: 'CCTV camera repair and new installation (2 cameras)', amount: 22000, gst: 18, mode: 'Bank Transfer', paid_to: 'SecureView Solutions', status: 'approved', bill_ref: 'SVS-0045' },
    { date: '2025-05-12', category: 'Transport', description: 'Bus insurance renewal - 5 buses', amount: 85000, gst: 18, mode: 'Bank Transfer', paid_to: 'New India Assurance', status: 'approved', bill_ref: 'NIA-BUS-25' },
    { date: '2025-05-15', category: 'Hospitality', description: 'Refreshments for teacher training workshop', amount: 4500, gst: 5, mode: 'Cash', paid_to: 'Sharma Caterers', status: 'approved' },

    // June 2025
    { date: '2025-06-02', category: 'Utilities', description: 'Electricity bill - June', amount: 35000, gst: 18, mode: 'Bank Transfer', paid_to: 'MSEDCL', status: 'approved', bill_ref: 'EB-JUN-2025' },
    { date: '2025-06-05', category: 'Stationery', description: 'Science lab chemicals and glassware', amount: 28000, gst: 18, mode: 'Bank Transfer', paid_to: 'Lab Pro India', status: 'approved', bill_ref: 'LPI-2025-067' },
    { date: '2025-06-10', category: 'Events', description: "Yoga Day celebration materials", amount: 3500, gst: 0, mode: 'Cash', paid_to: 'Fitness World', status: 'approved' },
    { date: '2025-06-15', category: 'Maintenance', description: 'Playground equipment repair', amount: 12000, gst: 0, mode: 'Cash', paid_to: 'Iron Works Pune', status: 'approved' },
    { date: '2025-06-20', category: 'Transport', description: 'Diesel for school bus fleet - June', amount: 46000, gst: 18, mode: 'Bank Transfer', paid_to: 'Indian Oil', status: 'approved', bill_ref: 'IOC-2025-2210' },
    { date: '2025-06-22', category: 'Printing', description: 'Admission forms and school prospectus', amount: 9000, gst: 12, mode: 'UPI', paid_to: 'Shree Printers', status: 'approved' },

    // July 2025 - mix of statuses
    { date: '2025-07-02', category: 'Utilities', description: 'Electricity bill - July', amount: 33000, gst: 18, mode: 'Bank Transfer', paid_to: 'MSEDCL', status: 'approved', bill_ref: 'EB-JUL-2025' },
    { date: '2025-07-05', category: 'Maintenance', description: 'Roof leak repair in Block A', amount: 25000, gst: 0, mode: 'Cash', paid_to: 'BuildRight Contractors', status: 'approved' },
    { date: '2025-07-08', category: 'Stationery', description: 'Sports day prizes and certificates', amount: 15000, gst: 12, mode: 'UPI', paid_to: 'Trophy World', status: 'approved' },
    { date: '2025-07-12', category: 'Cleaning', description: 'Monthly pest control service', amount: 5500, gst: 18, mode: 'Cash', paid_to: 'Pest Free India', status: 'approved' },
    { date: '2025-07-15', category: 'Transport', description: 'Bus AC repair - Bus #1', amount: 14000, gst: 18, mode: 'Bank Transfer', paid_to: 'Cool Tech Services', status: 'approved', bill_ref: 'CTS-502' },
    { date: '2025-07-18', category: 'Events', description: 'Independence Day celebration decorations', amount: 8000, gst: 0, mode: 'Cash', paid_to: 'Event Decor Shop', status: 'approved' },
    { date: '2025-07-22', category: 'Hospitality', description: 'Tea and snacks - Board meeting', amount: 6500, gst: 5, mode: 'Cash', paid_to: 'Sharma Caterers', status: 'approved' },
    { date: '2025-07-25', category: 'Maintenance', description: 'Water purifier AMC renewal', amount: 18000, gst: 18, mode: 'Bank Transfer', paid_to: 'Aqua Systems', status: 'approved', bill_ref: 'AQ-AMC-25' },

    // Recent - some pending/submitted
    { date: '2025-07-28', category: 'Stationery', description: 'Mid-term exam paper printing', amount: 8500, gst: 12, mode: 'UPI', paid_to: 'Shree Printers', status: 'submitted' },
    { date: '2025-07-29', category: 'Maintenance', description: 'Fire extinguisher refilling - 10 units', amount: 12000, gst: 18, mode: 'Cash', paid_to: 'Fire Safety India', status: 'submitted' },
    { date: '2025-07-30', category: 'Cleaning', description: 'Washroom supplies restocking', amount: 4200, gst: 5, mode: 'Cash', paid_to: 'Swachh Supplies', status: 'submitted' },
    { date: '2025-07-31', category: 'Misc', description: 'Courier charges for document dispatch', amount: 1800, gst: 18, mode: 'Cash', paid_to: 'DTDC Express', status: 'draft' },
    { date: '2025-07-31', category: 'Utilities', description: 'Telephone bill - July', amount: 3500, gst: 18, mode: 'Bank Transfer', paid_to: 'BSNL', status: 'draft' },
  ];

  entries.forEach((e) => {
    const id = ++voucherIdCounter;
    const gstAmount = Math.round(e.amount * e.gst / 100);
    const totalAmount = e.amount + gstAmount;
    vouchers.push({
      voucher_id: id,
      voucher_number: generateVoucherNumber(id),
      date: e.date,
      expense_category: e.category,
      description: e.description,
      amount: e.amount,
      gst_percent: e.gst,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      payment_mode: e.mode,
      paid_to: e.paid_to,
      bill_reference: e.bill_ref,
      attachment_url: e.attachment ? `/uploads/vouchers/${e.attachment}` : undefined,
      attachment_name: e.attachment,
      created_by: 'Mrs. Sunita Kulkarni',
      created_by_role: 'Accountant',
      approved_by: e.status === 'approved' ? 'Dr. Anand Joshi' : undefined,
      approved_by_role: e.status === 'approved' ? 'Principal' : undefined,
      approval_date: e.status === 'approved' ? e.date : undefined,
      approval_comment: e.status === 'rejected' ? 'Insufficient documentation. Please attach original bill.' : undefined,
      status: e.status,
      audit_flag: false,
      created_at: `${e.date}T09:00:00Z`,
      updated_at: e.status !== 'draft' ? `${e.date}T14:00:00Z` : undefined,
    });
  });

  return vouchers;
}

let mockVouchers: Voucher[] = generateInitialVouchers();

// ============================================================================
// DELAY SIMULATION
// ============================================================================

function simulateDelay(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getVouchers(filters?: {
  status?: VoucherStatus;
  category?: ExpenseCategory;
  fromDate?: string;
  toDate?: string;
  paymentMode?: PaymentMode;
}): Promise<Voucher[]> {
  await simulateDelay();
  let filtered = [...mockVouchers];

  if (filters?.status) {
    filtered = filtered.filter(v => v.status === filters.status);
  }
  if (filters?.category) {
    filtered = filtered.filter(v => v.expense_category === filters.category);
  }
  if (filters?.fromDate) {
    filtered = filtered.filter(v => v.date >= filters.fromDate!);
  }
  if (filters?.toDate) {
    filtered = filtered.filter(v => v.date <= filters.toDate!);
  }
  if (filters?.paymentMode) {
    filtered = filtered.filter(v => v.payment_mode === filters.paymentMode);
  }

  return filtered.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getVoucherById(id: number): Promise<Voucher | null> {
  await simulateDelay(100);
  return mockVouchers.find(v => v.voucher_id === id) || null;
}

export async function createVoucher(data: VoucherCreate): Promise<Voucher> {
  await simulateDelay(300);
  const id = ++voucherIdCounter;
  const gstAmount = Math.round(data.amount * data.gst_percent / 100);

  const voucher: Voucher = {
    voucher_id: id,
    voucher_number: generateVoucherNumber(id),
    date: data.date,
    expense_category: data.expense_category,
    description: data.description,
    amount: data.amount,
    gst_percent: data.gst_percent,
    gst_amount: gstAmount,
    total_amount: data.amount + gstAmount,
    payment_mode: data.payment_mode,
    paid_to: data.paid_to,
    bill_reference: data.bill_reference,
    attachment_name: data.attachment_name,
    created_by: 'Mrs. Sunita Kulkarni',
    created_by_role: 'Accountant',
    status: 'draft',
    audit_flag: false,
    created_at: new Date().toISOString(),
  };

  mockVouchers.push(voucher);
  return voucher;
}

export async function submitVoucher(id: number): Promise<Voucher | null> {
  await simulateDelay(200);
  const voucher = mockVouchers.find(v => v.voucher_id === id);
  if (!voucher || voucher.status !== 'draft') return null;
  voucher.status = 'submitted';
  voucher.updated_at = new Date().toISOString();
  return voucher;
}

export async function approveVoucher(id: number, comment?: string): Promise<Voucher | null> {
  await simulateDelay(200);
  const voucher = mockVouchers.find(v => v.voucher_id === id);
  if (!voucher || voucher.status !== 'submitted') return null;
  voucher.status = 'approved';
  voucher.approved_by = 'Dr. Anand Joshi';
  voucher.approved_by_role = 'Principal';
  voucher.approval_date = new Date().toISOString().split('T')[0];
  voucher.approval_comment = comment;
  voucher.updated_at = new Date().toISOString();
  return voucher;
}

export async function rejectVoucher(id: number, comment: string): Promise<Voucher | null> {
  await simulateDelay(200);
  const voucher = mockVouchers.find(v => v.voucher_id === id);
  if (!voucher || voucher.status !== 'submitted') return null;
  voucher.status = 'rejected';
  voucher.approval_comment = comment;
  voucher.updated_at = new Date().toISOString();
  return voucher;
}

export const mockVouchersProvider = {
  getVouchers,
  getVoucherById,
  createVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
};

export const EXPENSE_CATEGORIES_LIST = EXPENSE_CATEGORIES;
export const PAYMENT_MODES_LIST = PAYMENT_MODES;
