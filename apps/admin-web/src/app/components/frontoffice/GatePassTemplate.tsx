import React from 'react';

interface GatePassTemplateProps {
  studentName: string;
  reason: string;
  contact: string;
  createdAt: string;
}

const GatePassTemplate: React.FC<GatePassTemplateProps> = ({
  studentName,
  reason,
  contact,
  createdAt,
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-300 print-only">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Gate Pass</h1>
        <p className="text-sm text-gray-600">Issued on: {new Date(createdAt).toLocaleString()}</p>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Student Name:</p>
          <p className="text-lg font-semibold text-gray-800">{studentName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Reason for Early Exit:</p>
          <p className="text-lg font-semibold text-gray-800">{reason}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Parent Contact Number:</p>
          <p className="text-lg font-semibold text-gray-800">{contact}</p>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">This gate pass is valid for the current day only.</p>
      </div>
    </div>
  );
};

export default GatePassTemplate;
