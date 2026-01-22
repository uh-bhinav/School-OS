import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    
    // Email content for Get In Touch form
    const emailContent = `
New Contact Request from AcadionAI Website

SCHOOL INFORMATION:
- School Name: ${formData.schoolName}
- Number of Students: ${formData.studentCount || 'Not specified'}

CONTACT PERSON:
- Name: ${formData.principalName}
- Phone: ${formData.phone}
- Email: ${formData.email}

LOCATION:
- Address: ${formData.address}
- City: ${formData.city}
- State: ${formData.state}

MESSAGE:
${formData.message || 'No message provided'}

---
Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `.trim();

    // Log the submission (for now, since Web3Forms needs setup)
    console.log('📧 New Contact Request:', {
      school: formData.schoolName,
      contact: formData.principalName,
      email: formData.email,
      phone: formData.phone
    });

    // Check if Web3Forms is configured
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    
    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE' || accessKey === 'your_access_key_here') {
      // If not configured, just log and return success
      console.log('⚠️ Web3Forms not configured. Email content:\n', emailContent);
      return NextResponse.json({ 
        success: true, 
        message: 'Form submitted successfully (email pending setup)' 
      });
    }

    // Try to send via Web3Forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New Contact Request - ${formData.schoolName}`,
        from_name: formData.principalName,
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
        message: 'Form submitted successfully (email service issue)' 
      });
    }

    const result = await response.json();
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      console.error('Web3Forms error:', result);
      return NextResponse.json({ 
        success: true, 
        message: 'Form submitted successfully' 
      });
    }
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    );
  }
}
