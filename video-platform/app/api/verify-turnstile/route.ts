import { NextRequest, NextResponse } from 'next/server';

interface TurnstileVerifyResponse {
	success: boolean;
	'error-codes'?: string[];
}

export async function POST(request: NextRequest) {
	try {
		const { token } = (await request.json()) as { token?: string };

		if (!token) {
			return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
		}

		const secret = process.env.TURNSTILE_SECRET_KEY;
		if (!secret) {
			if (process.env.NODE_ENV !== 'production') {
				return NextResponse.json({ success: true, bypassed: true });
			}

			return NextResponse.json({ success: false, error: 'Turnstile is not configured' }, { status: 500 });
		}

		const formData = new URLSearchParams();
		formData.append('secret', secret);
		formData.append('response', token);

		const forwardedFor = request.headers.get('x-forwarded-for');
		if (forwardedFor) {
			formData.append('remoteip', forwardedFor.split(',')[0].trim());
		}

		const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: formData.toString(),
			cache: 'no-store',
		});

		if (!verifyResponse.ok) {
			return NextResponse.json({ success: false, error: 'Verification request failed' }, { status: 502 });
		}

		const data = (await verifyResponse.json()) as TurnstileVerifyResponse;

		return NextResponse.json({
			success: data.success === true,
			errors: data['error-codes'] ?? [],
		});
	} catch (error) {
		console.error('Turnstile verification failed:', error);
		return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
	}
}
