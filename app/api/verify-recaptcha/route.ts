// API route that verifies Google reCAPTCHA tokens to prevent bot signups.
// Returns success status and score from the Google verification API.

// Verify a reCAPTCHA token against the Google API
export async function POST(request: Request) {
  const { token } = await request.json()

  if (!token) {
    return Response.json({ success: false }, { status: 400 })
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
        response: token,
      }).toString(),
    })

    const data = await response.json()

    return Response.json({
      success: data.success,
      score: data.score,
    })
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return Response.json({ success: false }, { status: 500 })
  }
}
