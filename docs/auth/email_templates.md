# AI-Recruit360 — Custom Email Templates & Configuration Guide

This guide explains how to configure Supabase Auth with AI-Recruit360's custom branded HTML email templates for **Confirm Signup** and **Reset Password**.

---

## 1. Supabase Dashboard Email Template Configuration

1. Log in to your Supabase Project Dashboard:
   **[https://hkybdnbrrdjkrotwftrn.supabase.co](https://hkybdnbrrdjkrotwftrn.supabase.co)**

2. Navigate to:
   **Authentication → Email Templates**

---

### Template 1: Confirm Signup (Email Confirmation)

- **Subject**: `Confirm your AI-Recruit360 Workspace`
- **Body**: Copy the HTML content from [`public/email-templates/signup-confirmation.html`](file:///d:/FinalYearProject%282026%29/AI-Recruit360/frontend/public/email-templates/signup-confirmation.html) or below.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your AI-Recruit360 Workspace</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F7FA; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08090B; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #0D0F12; border: 1px solid #242932; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Logo Bar -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #242932; background-color: #12151A;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #F5F7FA; letter-spacing: -0.5px;">
                      AI-Recruit<span style="color: #39D9FF;">360</span>
                    </span>
                    <span style="display: block; font-size: 10px; font-family: monospace; color: #68717E; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px;">
                      Recruitment Intelligence Platform
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: rgba(57, 217, 255, 0.1); border: 1px solid rgba(57, 217, 255, 0.3); border-radius: 20px; font-size: 10px; font-family: monospace; color: #39D9FF; text-transform: uppercase; letter-spacing: 1px;">
                      Action Required
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding: 40px 32px;">
              <div style="display: inline-block; font-size: 11px; font-family: monospace; color: #39D9FF; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; font-weight: 700;">
                AI-POWERED RECRUITMENT INTELLIGENCE
              </div>

              <h1 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 700; color: #F5F7FA; line-height: 1.25; letter-spacing: -0.5px;">
                Confirm your email &amp; <br>activate your workspace.
              </h1>

              <p style="margin: 0 0 24px 0; font-size: 14px; color: #A7AFBC; line-height: 1.6;">
                Welcome to <strong style="color: #F5F7FA;">AI-Recruit360</strong>. You are one step away from transforming candidate screening into intelligent, evidence-backed hiring decisions.
              </p>
              <p style="margin: 0 0 32px 0; font-size: 14px; color: #A7AFBC; line-height: 1.6;">
                Please click the button below to confirm your email address and launch your workspace.
              </p>

              <!-- Primary CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 36px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #39D9FF;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #08090B; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                      Confirm Email Address &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Platform Capability Highlights Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #12151A; border: 1px solid #242932; border-radius: 12px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 20px;">
                    <span style="font-size: 11px; font-family: monospace; color: #68717E; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 12px;">
                      Included In Your Workspace
                    </span>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #F5F7FA;">
                          <span style="color: #39D9FF; margin-right: 8px;">&bull;</span> Candidate Match Scoring &amp; Alignment Matrix
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #F5F7FA;">
                          <span style="color: #39D9FF; margin-right: 8px;">&bull;</span> Resume Evidence Extraction &amp; Skill Verification
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #F5F7FA;">
                          <span style="color: #39D9FF; margin-right: 8px;">&bull;</span> Structured AI-Assisted Interview Evaluation
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Direct Link Copy Fallback -->
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #68717E;">
                Button not working? Copy and paste this URL into your browser:
              </p>
              <div style="background-color: #12151A; border: 1px solid #242932; border-radius: 6px; padding: 10px 12px; word-break: break-all; font-family: monospace; font-size: 11px; color: #39D9FF;">
                {{ .ConfirmationURL }}
              </div>
            </td>
          </tr>

          <!-- Security Note & Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #08090B; border-top: 1px solid #242932; font-size: 11px; color: #68717E; line-height: 1.5;">
              <p style="margin: 0 0 12px 0;">
                If you did not sign up for an account on AI-Recruit360, please ignore this email or contact security if you have concerns.
              </p>
              <p style="margin: 0; font-family: monospace; color: #68717E;">
                &copy; 2026 AI-Recruit360 &bull; Intelligence for Modern Hiring
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Supabase Auth URL Configuration

Under **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (or your production URL)
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`

---

## 3. How the Confirmation Link Operates

When the candidate/recruiter clicks **Confirm Email Address** in Gmail or Outlook:
1. The link calls `{{ .ConfirmationURL }}` (which points to `http://localhost:3000/auth/callback?token_hash=...&type=signup`).
2. Next.js App Router executes `app/auth/callback/route.ts`.
3. Supabase Auth verifies the token hash and sets authenticated cookies.
4. User is redirected straight into `/dashboard` with an active, authenticated session.
