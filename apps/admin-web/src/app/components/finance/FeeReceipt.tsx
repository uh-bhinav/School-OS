// apps/admin-web/src/app/components/finance/FeeReceipt.tsx
/**
 * Fee Receipt Component
 * Displays fee receipt in professional format matching school receipt design
 */

import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import type { WizardFeeComponent } from '../../services/finance/types';

interface FeeReceiptProps {
  receiptNo: string;
  receiptDate: string;
  studentName: string;
  registrationNo: string;
  academicBatch: string;
  degree: string;
  branch: string;
  year: string;
  financialYear: string;
  feeComponents: WizardFeeComponent[];
  totalAmount: number;
  paymentMode?: string;
  bankDetails?: string;
  remarks?: string;
}

const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero Rupees Only';

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  if (num < 1000) return convertLessThanThousand(num) + ' Rupees Only';

  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;

  let result = '';
  if (thousands > 0) {
    result += convertLessThanThousand(thousands) + ' Thousand';
  }
  if (remainder > 0) {
    result += ' ' + convertLessThanThousand(remainder);
  }

  return result.trim() + ' Rupees Only';
};

export default function FeeReceipt({
  receiptNo,
  receiptDate,
  studentName,
  registrationNo,
  academicBatch,
  degree,
  branch,
  year,
  financialYear,
  feeComponents,
  totalAmount,
  paymentMode = 'Online Payment',
  bankDetails = '',
  remarks = 'Student Online Payment',
}: FeeReceiptProps) {
  return (
    <Box
      sx={{
        width: '210mm',
        minHeight: '297mm',
        bgcolor: 'white',
        p: 3,
        mx: 'auto',
        boxShadow: 3,
        '@media print': {
          boxShadow: 'none',
          p: 2,
        },
      }}
    >
      {/* School Header */}
      <Box sx={{ border: '2px solid #8B0000', borderBottom: 'none', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          {/* Logo Placeholder - Left */}
          <Box
            sx={{
              width: 80,
              height: 80,
              border: '2px dashed #666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f5f5f5',
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary" textAlign="center">
              School
              <br />
              Logo
            </Typography>
          </Box>

          {/* School Name and Details */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#8B0000',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              [SCHOOL NAME]
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#8B0000', fontWeight: 600 }}>
              [School Address Line 1]
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: '#666' }}>
              [Address Line 2] | Ph: [Phone Number] | Email: [Email]
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
              An Autonomous Institution Affiliated to [Board Name]
            </Typography>
          </Box>

          {/* Logo Placeholder - Right */}
          <Box
            sx={{
              width: 80,
              height: 80,
              border: '2px dashed #666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f5f5f5',
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Founder
              <br />
              Photo
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Title */}
      <Box
        sx={{
          border: '2px solid #8B0000',
          borderTop: '1px solid #8B0000',
          bgcolor: '#f9f9f9',
          py: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
          OTHER FEES RECEIPT
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
          Student Copy
        </Typography>
      </Box>

      {/* Receipt Details */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '2px solid #8B0000', borderTop: 'none' }}>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%', border: '1px solid #000' }}>Receipt No :</TableCell>
              <TableCell sx={{ width: '25%', border: '1px solid #000' }}>{receiptNo}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%', border: '1px solid #000' }}>Receipt Date :</TableCell>
              <TableCell sx={{ width: '25%', border: '1px solid #000' }}>{receiptDate}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Student :</TableCell>
              <TableCell colSpan={3} sx={{ border: '1px solid #000' }}>
                {studentName}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Reg. No :</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{registrationNo}</TableCell>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Acd. Batch :</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{academicBatch}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Degree :</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{degree}</TableCell>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Branch :</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{branch}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Year :</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{year}</TableCell>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Financial Yr :</TableCell>
              <TableCell sx={{ border: '1px solid #000' }}>{financialYear}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Fee Particulars Table */}
        <Table size="small" sx={{ mt: 0 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  textAlign: 'center',
                  border: '1px solid #000',
                  bgcolor: '#f0f0f0',
                  width: '10%',
                }}
              >
                S.NO
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  textAlign: 'center',
                  border: '1px solid #000',
                  bgcolor: '#f0f0f0',
                  width: '60%',
                }}
              >
                PARTICULARS
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  textAlign: 'center',
                  border: '1px solid #000',
                  bgcolor: '#f0f0f0',
                  width: '30%',
                }}
              >
                AMOUNT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feeComponents.map((component, index) => (
              <TableRow key={component.component_id}>
                <TableCell sx={{ textAlign: 'center', border: '1px solid #000' }}>{index + 1}</TableCell>
                <TableCell sx={{ border: '1px solid #000', pl: 2 }}>{component.component_name}</TableCell>
                <TableCell sx={{ textAlign: 'right', border: '1px solid #000', pr: 2 }}>
                  {component.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            {/* Empty rows to maintain height */}
            {Array.from({ length: Math.max(0, 8 - feeComponents.length) }).map((_, index) => (
              <TableRow key={`empty-${index}`}>
                <TableCell sx={{ border: '1px solid #000', height: 40 }}>&nbsp;</TableCell>
                <TableCell sx={{ border: '1px solid #000' }}>&nbsp;</TableCell>
                <TableCell sx={{ border: '1px solid #000' }}>&nbsp;</TableCell>
              </TableRow>
            ))}
            {/* Total Row */}
            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 700, textAlign: 'center', border: '1px solid #000' }}>
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right', border: '1px solid #000', pr: 2 }}>
                ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Payment Details */}
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%', border: '1px solid #000' }}>In words :</TableCell>
              <TableCell colSpan={3} sx={{ border: '1px solid #000', fontWeight: 600 }}>
                {numberToWords(totalAmount)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Pay't Mode :</TableCell>
              <TableCell colSpan={3} sx={{ border: '1px solid #000' }}>
                {paymentMode}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Bank :</TableCell>
              <TableCell colSpan={3} sx={{ border: '1px solid #000' }}>
                {bankDetails}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Remarks :</TableCell>
              <TableCell colSpan={3} sx={{ border: '1px solid #000' }}>
                {remarks}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          This is Computer Generated Receipt
        </Typography>
      </Box>

      {/* Note */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Note : Produce this receipt for future clarification in respective of fees paid.
        </Typography>
        <br />
        <Typography variant="caption">*Collected on behalf of third party service provider</Typography>
      </Box>
    </Box>
  );
}
