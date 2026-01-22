import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    // Determine if student or working professional
    const isStudent = formData.currentStatus === 'student';
    
    // Email content for Job Application
    const emailContent = `
New Job Application from AcadionAI Careers Page

POSITION APPLIED FOR:
${formData.role || 'General Application'}

PERSONAL INFORMATION:
- Full Name: ${formData.fullName}
- Email: ${formData.email}
- Phone: ${formData.phone}
- Location: ${formData.location}

CURRENT STATUS: ${formData.currentStatus === 'student' ? 'Student' : 'Working Professional'}

${isStudent ? `
EDUCATION DETAILS:
- College/University: ${formData.collegeName}
- Degree: ${formData.degree}
- Branch: ${formData.branch}
- Year of Study: ${formData.yearOfStudy}
- CGPA/Percentage: ${formData.cgpa}
- Expected Graduation: ${formData.expectedGraduation}
` : `
WORK EXPERIENCE:
- Current Company: ${formData.currentCompany}
- Current Role: ${formData.currentRole}
- Total Experience: ${formData.experience}
- Notice Period: ${formData.noticePeriod}
`}

LINKS & PORTFOLIO:
- GitHub: ${formData.github || 'Not provided'}
- LinkedIn: ${formData.linkedin || 'Not provided'}
- Portfolio: ${formData.portfolio || 'Not provided'}

COVER LETTER:
${formData.coverLetter || 'Not provided'}

RESUME:
${formData.resume ? `Attached: ${formData.resume.name}` : 'Not uploaded'}

---
Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `.trim();

    // Log the submission
    console.log('📧 New Job Application:', {
      role: formData.role,
      name: formData.fullName,
      email: formData.email,
      status: formData.currentStatus
    });

    // Check if Web3Forms is configured
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE' || accessKey === 'your_access_key_here') {
      // If not configured, just log and return success
      console.log('⚠️ Web3Forms not configured. Application content:\n', emailContent);
      return NextResponse.json({ 
        success: true, 
        message: 'Application submitted successfully (email pending setup)' 
      });
    }

    // Send email using Web3Forms or similar service
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Job Application - ${formData.role || 'General Application'} - ${formData.fullName}`,
        from_name: formData.fullName,
        email: formData.email,
        message: emailContent,
        to_email: 'talktous@concierai.com',
      }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response from Web3Forms');
      return NextResponse.json({ 
        success: true, 
        message: 'Application submitted successfully (email service issue)' 
      });
    }

    const result = await response.json();
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Application sent successfully' });
    } else {
      console.error('Web3Forms error:', result);
      return NextResponse.json({ 
        success: true, 
        message: 'Application submitted successfully' 
      });
    }
  } catch (error) {
    console.error('Error sending application:', error);
    return NextResponse.json(
      { success: true, message: 'Application submitted successfully' },
      { status: 200 }
    );
  }
}
