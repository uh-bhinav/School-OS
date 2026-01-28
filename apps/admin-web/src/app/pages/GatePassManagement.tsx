import React, { useState } from 'react';
import GatePassForm from '../components/frontoffice/GatePassForm';
import GatePassList from '../components/frontoffice/GatePassList';
import GatePassPreviewModal from '../components/frontoffice/GatePassPreviewModal';
import { toast } from 'sonner';

interface GatePass {
  id: string;
  studentName: string;
  reason: string;
  contact: string;
  createdAt: string;
}

const GatePassManagement: React.FC = () => {
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [previewGatePass, setPreviewGatePass] = useState<GatePass | null>(null);

  const handleGatePassGenerated = (gatePassData: Omit<GatePass, 'id' | 'createdAt'>) => {
    console.log('Gate pass data:', gatePassData); // Debugging log
    const newGatePass: GatePass = {
      ...gatePassData,
      id: `${Date.now()}`, // Generate a unique ID
      createdAt: new Date().toISOString(),
    };

    // Add the new gate pass to the list
    setGatePasses((prevGatePasses) => [newGatePass, ...prevGatePasses]);

    // Open the preview modal
    setPreviewGatePass(newGatePass);
  };

  const handlePrint = () => {
    if (previewGatePass) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Gate Pass</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                }
                .gate-pass {
                  max-width: 400px;
                  margin: auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .gate-pass h1 {
                  font-size: 24px;
                  margin-bottom: 10px;
                }
                .gate-pass p {
                  margin: 5px 0;
                }
              </style>
            </head>
            <body>
              <div class="gate-pass">
                <h1>Gate Pass</h1>
                <p><strong>Student Name:</strong> ${previewGatePass.studentName}</p>
                <p><strong>Reason for Early Exit:</strong> ${previewGatePass.reason}</p>
                <p><strong>Parent Contact Number:</strong> ${previewGatePass.contact}</p>
                <p><strong>Issued On:</strong> ${new Date(previewGatePass.createdAt).toLocaleString()}</p>
                <p style="margin-top: 20px; font-size: 12px; color: gray;">This gate pass is valid for the current day only.</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
      toast.success('Gate pass printed successfully!');
      setPreviewGatePass(null); // Close the modal after printing
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Gate Pass Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gate Pass Form */}
        <GatePassForm onGatePassGenerated={handleGatePassGenerated} />

        {/* Gate Pass List */}
        <GatePassList gatePasses={gatePasses} />
      </div>

      {/* Gate Pass Preview Modal */}
      <GatePassPreviewModal
        isOpen={!!previewGatePass}
        onClose={() => setPreviewGatePass(null)}
        gatePassData={previewGatePass}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default GatePassManagement;
