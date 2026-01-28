import React from 'react';
import GatePassTemplate from './GatePassTemplate';

interface GatePassPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gatePassData: {
    studentName: string;
    reason: string;
    contact: string;
    createdAt: string;
  } | null;
  onPrint: () => void;
}

const GatePassPreviewModal: React.FC<GatePassPreviewModalProps> = ({
  isOpen,
  onClose,
  gatePassData,
  onPrint,
}) => {
  if (!isOpen || !gatePassData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <GatePassTemplate
          studentName={gatePassData.studentName}
          reason={gatePassData.reason}
          contact={gatePassData.contact}
          createdAt={gatePassData.createdAt}
        />
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Print Gate Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default GatePassPreviewModal;
