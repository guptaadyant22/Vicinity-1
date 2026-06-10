// API route that emails the business data report PDF to a provided email address.
// Uses Nodemailer + Gmail SMTP — free, no domain needed, sends to any address.

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create Gmail transporter using App Password (not your regular Gmail password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { email, pdfBase64, businessName, dateRange, stats } = await req.json()

    if (!email || !pdfBase64) {
      return NextResponse.json(
        { error: 'Email and PDF data are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Gmail credentials missing in .env.local')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Strip base64 prefix if present (e.g. "data:application/pdf;base64,")
    const base64Data = pdfBase64.includes(',')
      ? pdfBase64.split(',')[1]
      : pdfBase64

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Vicinity Business Report</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#3b82f6 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:14px;padding:12px 20px;margin-bottom:20px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">VICINITY</span>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px;letter-spacing:-0.8px;">
                Business Report Ready
              </h1>
              <p style="color:#bfdbfe;font-size:15px;margin:0;">
                ${businessName}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;">
              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Your data export has been generated and is attached to this email as a PDF.
              </p>

              <!-- Period pill -->
              <table cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:10px;border-left:4px solid #2563eb;margin-bottom:28px;width:100%;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:#1e40af;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Export Period</p>
                    <p style="margin:4px 0 0;color:#1d4ed8;font-size:15px;font-weight:500;">
                      ${dateRange?.start || 'All time'} &rarr; ${dateRange?.end || today}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Stats row -->
              ${stats ? `
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
                <tr>
                  <td width="33%" style="text-align:center;background:#f8fafc;border-radius:12px;padding:16px 8px;border:1px solid #e2e8f0;">
                    <div style="color:#2563eb;font-size:24px;font-weight:700;">${stats.reviews ?? 0}</div>
                    <div style="color:#64748b;font-size:12px;margin-top:4px;">Reviews</div>
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="text-align:center;background:#f8fafc;border-radius:12px;padding:16px 8px;border:1px solid #e2e8f0;">
                    <div style="color:#2563eb;font-size:24px;font-weight:700;">${stats.deals ?? 0}</div>
                    <div style="color:#64748b;font-size:12px;margin-top:4px;">Deals</div>
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="text-align:center;background:#f8fafc;border-radius:12px;padding:16px 8px;border:1px solid #e2e8f0;">
                    <div style="color:#2563eb;font-size:24px;font-weight:700;">${stats.favorites ?? 0}</div>
                    <div style="color:#64748b;font-size:12px;margin-top:4px;">Favourites</div>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 8px;">
                The attached PDF includes all selected data sections. Open it in any PDF viewer on desktop or mobile.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                Generated on ${today} &middot; Vicinity Local Business Platform
              </p>
              <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">
                You received this because a report was requested for your business on Vicinity.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const mailOptions = {
      from: `Vicinity Reports <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your Vicinity Business Report — ${businessName}`,
      html: htmlBody,
      attachments: [
        {
          filename: `${businessName}_Vicinity_Report_${new Date().toISOString().split('T')[0]}.pdf`,
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    }

    await transporter.sendMail(mailOptions)

    console.log(`✅ Email sent successfully to ${email}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('❌ Email route error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}