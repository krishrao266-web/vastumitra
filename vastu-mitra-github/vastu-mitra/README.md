# Vastu Mitra

A pay-per-question Vastu Shastra Q&A website. Users pay ₹20 via Razorpay, then get an
answer generated live by Claude.

## What's in this folder

- `index.html` — the whole frontend (single page, no build step)
- `api/create-order.js` — serverless function that creates a ₹20 Razorpay order
- `api/verify-and-ask.js` — serverless function that verifies the payment signature, then calls Claude and returns the answer
- `package.json` — the one dependency (`razorpay`) the functions need
- `.env.example` — the three environment variables you must set

## 1. Get your keys

**Razorpay**
1. Sign up free at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys and generate a **test mode** key pair first
3. Copy the Key ID and Key Secret

**Anthropic**
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys and create a new key
3. Add billing so the key can make live calls

## 2. Deploy on Vercel (free)

1. Push this folder to a new GitHub repository
2. Go to [vercel.com](https://vercel.com), sign in, click **Add New → Project**, and import that repo
3. Vercel will auto-detect `index.html` as static and the `api/` folder as serverless functions — no config needed
4. Before the first deploy finishes, open **Settings → Environment Variables** and add:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `ANTHROPIC_API_KEY`
5. Deploy. Vercel gives you a free URL like `vastu-mitra.vercel.app`

## 3. Test before going live

Razorpay test mode lets you complete the full payment flow with fake cards — no real money moves:
- Card number: `4111 1111 1111 1111`, any future expiry, any CVV
- Or use test UPI ID `success@razorpay`

Ask a question on your deployed site, pay with the test card, and confirm you get a real Claude-generated answer back.

## 4. Go live

1. Complete Razorpay KYC (PAN + bank account for an individual; add business proof if registered)
2. Once approved, switch to your **live mode** keys in Razorpay and update the environment variables in Vercel
3. Redeploy (or just save the env vars — Vercel redeploys automatically)

## Notes

- The Anthropic API key never reaches the browser — it's only used inside `api/verify-and-ask.js`, which runs on Vercel's servers.
- The Claude call only happens *after* the Razorpay signature is verified, so nobody can get a free answer by faking a payment response.
- Each question costs you a small amount in Claude API usage on top of Razorpay's ~2% transaction fee — factor that into your ₹20 pricing.
