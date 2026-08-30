const baseUrl = (process.env.REVIEW_ACCOUNT_BASE_URL ?? 'https://teag.me').replace(/\/$/, '');
const email = process.env.REVIEW_ACCOUNT_EMAIL;
const password = process.env.REVIEW_ACCOUNT_PASSWORD;
const name = process.env.REVIEW_ACCOUNT_NAME ?? 'App Review';

if (!email || !password) {
  console.error('Set REVIEW_ACCOUNT_EMAIL and REVIEW_ACCOUNT_PASSWORD before running this command.');
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: baseUrl },
  body: JSON.stringify({ name, email, password }),
});

const body = await response.text();
if (!response.ok) {
  console.error(`Review account provisioning failed (${response.status}): ${body}`);
  process.exit(1);
}

console.log(`Review account is ready for ${email}. Store its credentials in App Store Connect review notes.`);
