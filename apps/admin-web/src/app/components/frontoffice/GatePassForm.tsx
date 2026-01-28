import React, { useState } from 'react';
import { toast } from 'sonner';
import { sendGatePass } from '../../services/gatePassService';

interface GatePassFormProps {
  onGatePassGenerated: (gatePassData: GatePassData) => void;
}

interface GatePassData {
  studentName: string;
  reason: string;
  contact: string;
}

const mockStudents = [
  { id: '1', name: 'John Doe', class: 'Grade 4' },
  { id: '2', name: 'Jane Smith', class: 'Grade 5' },
  { id: '3', name: 'Michael Brown', class: 'Grade 6' },
];

const GatePassForm: React.FC<GatePassFormProps> = ({ onGatePassGenerated }) => {
  const [studentName, setStudentName] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(mockStudents);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setStudentName(query);

    // Filter students based on the search query
    const filtered = mockStudents.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const handleSelectStudent = (studentName: string) => {
    setStudentName(studentName);
    setSelectedStudent(studentName);
    setFilteredStudents([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit button clicked'); // Debugging log
    // Validate inputs
    if (!selectedStudent || !reason || !contact) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!/^\d{10}$/.test(contact)) {
      toast.error('Please enter a valid 10-digit contact number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const gatePassData: GatePassData = { studentName: selectedStudent, reason, contact };
      await sendGatePass(gatePassData); // Call the service to send the gate pass
      onGatePassGenerated(gatePassData); // Notify parent component
      toast.success('Gate pass generated successfully!');
      setStudentName('');
      setReason('');
      setContact('');
      setSelectedStudent(null);
    } catch (error) {
      toast.error('Failed to generate gate pass. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Generate Gate Pass</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Name Search */}
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
            Student Name
          </label>
          <input
            type="text"
            id="studentName"
            value={studentName}
            onChange={handleSearch}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search student name"
          />
          {studentName && filteredStudents.length > 0 && (
            <ul className="mt-2 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto">
              {filteredStudents.map((student) => (
                <li
                  key={student.id}
                  onClick={() => handleSelectStudent(student.name)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {student.name} - {student.class}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contact Input */}
        <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                Parent Contact Number
            </label>
            <input
                type="text"
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className={`mt-1 block w-full border ${
                    /^\d{10}$/.test(contact) || contact === '' ? 'border-gray-300' : 'border-red-500'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter 10-digit contact number"
            />
            {!/^\d{10}$/.test(contact) && contact !== '' && (
                <p className="text-sm text-red-500 mt-1">Please enter a valid 10-digit contact number.</p>
            )}
        </div>

        {/* Reason Dropdown */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason for Early Exit
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a reason</option>
            <option value="Medical">Medical</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Generating...' : 'Generate Gate Pass'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GatePassForm;
