
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface BookingForExport {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  booking_date: string;
  created_at: string;
  services: string[];
  status: string;
  total_amount: number | null;
  amount_paid: number | null;
  time_slot?: string;
  category_list?: string[];
}

interface ExportStats {
  totalBookings: number;
  totalRevenue: number;
  totalAmountPaid: number;
  completedBookings: number;
  pendingBookings: number;
  acceptedBookings: number;
  cancelledBookings: number;
}

export const exportBookingsToExcel = (
  bookings: BookingForExport[],
  stats: ExportStats,
  filename: string,
  reportType: 'monthly' | 'yearly' | 'filtered'
) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data for main sheet
    const worksheetData = bookings.map((booking, index) => ({
      'S.No': index + 1,
      'Booking ID': booking.id.slice(0, 8) + '...',
      'Customer Name': booking.customer_name || 'Unknown',
      'Phone': booking.customer_phone || 'N/A',
      'Email': booking.customer_email || 'N/A',
      'Booking Date': format(new Date(booking.booking_date), 'dd/MM/yyyy'),
      'Created Date': format(new Date(booking.created_at), 'dd/MM/yyyy HH:mm'),
      'Services': booking.services.join(', '),
      'Categories': booking.category_list?.join(', ') || 'N/A',
      'Time Slot': booking.time_slot || 'N/A',
      'Status': booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
      'Total Amount (₹)': booking.total_amount || 0,
      'Amount Paid (₹)': booking.amount_paid || 0,
      'Balance (₹)': (booking.total_amount || 0) - (booking.amount_paid || 0)
    }));

    // Create main worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // S.No
      { wch: 15 }, // Booking ID
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Email
      { wch: 12 }, // Booking Date
      { wch: 18 }, // Created Date
      { wch: 30 }, // Services
      { wch: 20 }, // Categories
      { wch: 12 }, // Time Slot
      { wch: 12 }, // Status
      { wch: 15 }, // Total Amount
      { wch: 15 }, // Amount Paid
      { wch: 15 }  // Balance
    ];
    worksheet['!cols'] = columnWidths;

    // Add main sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings Data');

    // Create summary sheet
    const summaryData = [
      ['Report Summary', ''],
      ['Report Type', reportType.charAt(0).toUpperCase() + reportType.slice(1)],
      ['Generated On', format(new Date(), 'dd/MM/yyyy HH:mm:ss')],
      ['', ''],
      ['Booking Statistics', ''],
      ['Total Bookings', stats.totalBookings],
      ['Completed Bookings', stats.completedBookings],
      ['Accepted Bookings', stats.acceptedBookings],
      ['Pending Bookings', stats.pendingBookings],
      ['Cancelled Bookings', stats.cancelledBookings],
      ['', ''],
      ['Financial Summary', ''],
      ['Total Revenue Expected (₹)', stats.totalRevenue.toFixed(2)],
      ['Total Amount Paid (₹)', stats.totalAmountPaid.toFixed(2)],
      ['Outstanding Amount (₹)', (stats.totalRevenue - stats.totalAmountPaid).toFixed(2)],
      ['Collection Rate (%)', stats.totalRevenue > 0 ? ((stats.totalAmountPaid / stats.totalRevenue) * 100).toFixed(2) : '0.00']
    ];

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
    
    // Add summary sheet to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
};

export const generateMonthlyFilename = (year: number, month: number): string => {
  return `Bookings_Report_${year}_${month.toString().padStart(2, '0')}.xlsx`;
};

export const generateYearlyFilename = (year: number): string => {
  return `Bookings_Report_${year}.xlsx`;
};

export const generateFilteredFilename = (): string => {
  const now = new Date();
  return `Bookings_Filtered_${format(now, 'yyyy_MM_dd_HHmm')}.xlsx`;
};
