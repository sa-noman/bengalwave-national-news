# Bengal Wave: Supabase default invitation email

The Supabase Free Tier limits auth-email template customization unless a custom SMTP service is configured. This project works with the unmodified **Invite user** template (which uses \`{{ .ConfirmationURL }}\`).

## Recommended no-template-edit setup
1. In Supabase Authentication → URL Configuration, set the **Site URL** to:
   \`https://bengalwave-national-news-git-preview-bengalwa-e67896-noman-17e9.vercel.app/auth/complete\`
2. Save the exact HTTPS URL. Do not change the **Confirm sign up** email template.
3. In Authentication → Users, invite the previously confirmed admin email through the Dashboard only after ensuring outbound email delivery is available.
4. Default invite link verification redirects back with a session token fragment or an auth code. The client-side callback converts that into Supabase SSR cookie-based auth and opens \`/admin/set-password\`.
5. Password changes happen inside the protected app. The Owner profile is assigned **after** email verification, via an authorized admin database operation.

## Alternative existing root Site URL
If Site URL was already saved as the preview website root, the homepage will forward the invite session fragment/code to \`/auth/complete\` in the browser.

## Outbound email limitation
Supabase's default SMTP only delivers to email addresses on the project organization's team. If the desired email is **not** an authorized team email, configure a reputable custom SMTP provider first; do not add an unrelated email as a broad project collaborator simply to circumvent the limit. This cannot be configured by the existing Supabase connector. No invitation was sent from the repository.

## Security
- Vercel Authentication protects all deployments. Only allowed Vercel team users can access preview.
- Never paste password, invite URL with tokens, access token, refresh token, or OTP into a chat, issue, commit, or screenshot.
- Auth callback removes tokens from the visible URL and does not grant \`owner\` automatically.
- Supabase owner permission, invitation delivery and browser authentication require end-to-end verification before marking onboarding complete.

Reference: https://supabase.com/docs/guides/auth/auth-smtp
