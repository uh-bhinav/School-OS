import React from 'react';
import { Printer, Share2 } from 'lucide-react';

interface GatePass {
  id: string;
  studentName: string;
  reason: string;
  contact: string;
  createdAt: string;
}

interface GatePassListProps {
  gatePasses: GatePass[];
}

const GatePassList: React.FC<GatePassListProps> = ({ gatePasses }) => {
  const handlePrint = (gatePass: GatePass) => {
    // Logic to print the gate pass
    window.print();
  };

  const handleShare = (gatePass: GatePass) => {
    // Logic to share the gate pass via WhatsApp or SMS
    const message = `Gate Pass for ${gatePass.studentName}:\nReason: ${gatePass.reason}\nContact: ${gatePass.contact}\nDate: ${new Date(
      gatePass.createdAt
    ).toLocaleString()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Generated Gate Passes</h2>
      {gatePasses.length === 0 ? (
        <p className="text-gray-600">No gate passes generated yet.</p>
      ) : (
        <ul className="space-y-4">
          {gatePasses.map((gatePass) => (
            <li
              key={gatePass.id}
              className="p-4 border border-gray-300 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-medium text-gray-800">{gatePass.studentName}</p>
                <p className="text-sm text-gray-600">
                  Reason: {gatePass.reason} | Contact: {gatePass.contact}
                </p>
                <p className="text-sm text-gray-500">
                  Created At: {new Date(gatePass.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePrint(gatePass)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                  title="Print Gate Pass"
                >
                  <Printer className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => handleShare(gatePass)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                  title="Share Gate Pass"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GatePassList;
