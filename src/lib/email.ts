import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type EmailSection = {
  label?: string;
  lines: Array<string | null | undefined>;
};

type EmailCta = {
  label: string;
  href: string;
};

type EmailPayload = {
  to: string | string[];
  subject: string;
  category?: string;
  eyebrow?: string;
  title: string;
  intro: string;
  sections?: EmailSection[];
  cta?: EmailCta;
  idempotencyKey?: string;
  replyTo?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

export type EmailResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  providerId?: string;
  statusCode?: number;
  recipients?: string[];
  subject?: string;
  category?: string;
};

export type EmailDeliveryLog = {
  id: string;
  recipient: string;
  subject: string;
  category: string | null;
  status: "sent" | "failed" | "skipped";
  provider: string;
  provider_message_id: string | null;
  provider_status: number | null;
  error: string | null;
  idempotency_key: string | null;
  created_at: string;
};

const resendApiUrl = "https://api.resend.com/emails";
const appUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL || "https://fixit247.com.au");
const fromEmail = process.env.RESEND_FROM_EMAIL || "Fixit247 <hello@fixit247.com.au>";
const adminAlertEmails = splitEmails(
  process.env.FIXIT_ALERT_EMAIL || process.env.ADMIN_ALERT_EMAIL || process.env.RESEND_ALERT_EMAIL || ""
);
const supportEmail = process.env.FIXIT_SUPPORT_EMAIL || adminAlertEmails[0] || "support@fixit247.com.au";

export function isEmailConfigured() {
  const config = getEmailConfig();
  return Boolean(config.apiKey && config.fromEmail);
}

export function getEmailRuntimeStatus() {
  const config = getEmailConfig();

  return {
    configured: Boolean(config.apiKey && config.fromEmail),
    hasApiKey: Boolean(config.apiKey),
    fromEmail: config.fromEmail,
    hasVerifiedSenderHint: /@fixit247\.com\.au[>\s]*$/i.test(config.fromEmail),
    adminAlertCount: config.adminAlertEmails.length,
    supportEmail: config.supportEmail,
    appUrl: config.appUrl
  };
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<EmailResult> {
  const config = getEmailConfig();
  const recipients = Array.isArray(payload.to) ? payload.to.filter(Boolean) : [payload.to].filter(Boolean);
  const category = payload.category || deriveCategory(payload);

  if (!recipients.length) return { ok: false, skipped: true, error: "No recipient.", subject: payload.subject, category };
  if (!config.apiKey) {
    await logEmailDelivery({
      recipients,
      subject: payload.subject,
      category,
      status: "skipped",
      error: "RESEND_API_KEY is not configured.",
      idempotencyKey: payload.idempotencyKey,
      metadata: payload.metadata
    });

    return {
      ok: false,
      skipped: true,
      error: "Resend is not configured.",
      recipients,
      subject: payload.subject,
      category
    };
  }

  const body = renderEmail(payload);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json"
  };

  if (payload.idempotencyKey) {
    headers["Idempotency-Key"] = payload.idempotencyKey.slice(0, 256);
  }

  try {
    const response = await fetch(resendApiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: config.fromEmail,
        to: recipients,
        subject: payload.subject,
        html: body.html,
        text: body.text,
        reply_to: payload.replyTo || config.supportEmail
      })
    });

    const responseText = await response.text().catch(() => "");
    const responseJson = safeJson(responseText);
    const providerId = typeof responseJson?.id === "string" ? responseJson.id : null;

    if (!response.ok) {
      const safeMessage = responseText.slice(0, 500);
      console.error("Fixit247 email send failed", response.status, safeMessage);
      await logEmailDelivery({
        recipients,
        subject: payload.subject,
        category,
        status: "failed",
        providerStatus: response.status,
        error: safeMessage || `Resend returned ${response.status}.`,
        idempotencyKey: payload.idempotencyKey,
        metadata: payload.metadata
      });

      return {
        ok: false,
        error: `Resend returned ${response.status}.`,
        statusCode: response.status,
        recipients,
        subject: payload.subject,
        category
      };
    }

    await logEmailDelivery({
      recipients,
      subject: payload.subject,
      category,
      status: "sent",
      providerId,
      providerStatus: response.status,
      idempotencyKey: payload.idempotencyKey,
      metadata: payload.metadata
    });

    return { ok: true, providerId: providerId ?? undefined, statusCode: response.status, recipients, subject: payload.subject, category };
  } catch (error) {
    console.error("Fixit247 email send failed", error);
    await logEmailDelivery({
      recipients,
      subject: payload.subject,
      category,
      status: "failed",
      error: error instanceof Error ? error.message : "Email request failed.",
      idempotencyKey: payload.idempotencyKey,
      metadata: payload.metadata
    });

    return { ok: false, error: "Email request failed.", recipients, subject: payload.subject, category };
  }
}

export async function sendAdminAlert(payload: Omit<EmailPayload, "to">): Promise<EmailResult> {
  const config = getEmailConfig();
  if (!config.adminAlertEmails.length) return { ok: false, skipped: true, error: "Admin alert email is not configured.", subject: payload.subject };
  return sendTransactionalEmail({ ...payload, to: config.adminAlertEmails });
}

export async function sendBestEffort(emails: Array<Promise<EmailResult> | false | null | undefined>): Promise<EmailResult[]> {
  const tasks = emails.filter((email): email is Promise<EmailResult> => Boolean(email));
  const results = await Promise.allSettled(tasks);
  return results.map((result) => {
    if (result.status === "rejected") {
      console.error("Fixit247 email task failed", result.reason);
      return { ok: false, error: "Email task failed." };
    }

    if (!result.value.ok && !result.value.skipped) {
      console.error("Fixit247 email delivery failed", result.value.error);
    }

    return result.value;
  });
}

export async function notifyRequestReceived(input: {
  requestId: string;
  reference: string;
  recipientEmail?: string | null;
  firstName?: string | null;
  title: string;
  lane: string;
  category: string;
  location?: string | null;
  phone?: string | null;
  contactMethod?: string | null;
  dashboardUrl?: string | null;
}) {
  const location = input.location || "Location to be confirmed";
  const requestUrl = input.dashboardUrl ? absoluteUrl(input.dashboardUrl) : null;

  await sendBestEffort([
    input.recipientEmail
      ? sendTransactionalEmail({
          to: input.recipientEmail,
          subject: `Fixit247 request received: ${input.reference}`,
          eyebrow: "Request received",
          title: `We have your request, ${input.firstName || "there"}.`,
          intro:
            "Fixit247 has saved your request and will keep the next step clear. If it is urgent, keep your phone nearby so the right contact path stays open.",
          sections: [
            {
              label: "Request details",
              lines: [input.title, `Reference: ${input.reference}`, `Type: ${labelize(input.lane)}`, `Location: ${location}`]
            },
            {
              label: "What happens next",
              lines: [
                "Your request is reviewed for urgency and trade fit.",
                "You can use your reference when speaking with Fixit247 support.",
                "For immediate danger, call emergency services first."
              ]
            }
          ],
          cta: requestUrl ? { label: "View request", href: requestUrl } : { label: "Start another request", href: `${appUrl}/post-job` },
          idempotencyKey: `request-confirmation-${input.requestId}`
        })
      : null,
    sendAdminAlert({
      subject: `New Fixit247 request ${input.reference}`,
      eyebrow: "Live request",
      title: input.title,
      intro: "A new request is ready for review, matching, and customer follow-up.",
      sections: [
        {
          label: "Request",
          lines: [
            `Reference: ${input.reference}`,
            `Lane: ${labelize(input.lane)}`,
            `Category: ${input.category}`,
            `Location: ${location}`,
            input.phone ? `Phone: ${input.phone}` : null,
            input.contactMethod ? `Preferred contact: ${labelize(input.contactMethod)}` : null
          ]
        }
      ],
      cta: { label: "Open admin queue", href: `${appUrl}/admin/jobs` },
      idempotencyKey: `request-admin-${input.requestId}`
    })
  ]);
}

export async function notifyNewsletterSignup(input: { email: string; source?: string | null }) {
  await sendBestEffort([
    sendTransactionalEmail({
      to: input.email,
      subject: "You are on the Fixit247 update list",
      eyebrow: "Fixit247 updates",
      title: "Calm home and property updates, only when useful.",
      intro:
        "You are on the list for practical Fixit247 updates around emergency help, PropertySafe, Fixit Plus, and safer maintenance planning.",
      sections: [
        {
          label: "What to expect",
          lines: [
            "Short product updates.",
            "Useful property readiness reminders.",
            "Only practical updates when there is something worth knowing."
          ]
        }
      ],
      cta: { label: "Visit Fixit247", href: appUrl },
      idempotencyKey: `newsletter-${input.email.toLowerCase()}`
    })
  ]);
}

export async function notifySupportTicketCreated(input: {
  ticketId: string;
  userEmail?: string | null;
  userName?: string | null;
  role: string;
  subject: string;
  message: string;
}) {
  await sendBestEffort([
    input.userEmail
      ? sendTransactionalEmail({
          to: input.userEmail,
          subject: "Fixit247 support received your message",
          eyebrow: "Support received",
          title: "Your message is with Fixit247 support.",
          intro: "We have saved your support request. The team can now review the detail and follow up through the right account path.",
          sections: [{ label: "Subject", lines: [input.subject] }],
          cta: { label: "Open support", href: `${appUrl}/dashboard/support` },
          idempotencyKey: `support-confirmation-${input.ticketId}`
        })
      : null,
    sendAdminAlert({
      subject: `New support request: ${input.subject}`,
      eyebrow: "Support",
      title: input.subject,
      intro: "A customer or Fixer has sent a support request.",
      sections: [
        {
          label: "Sender",
          lines: [input.userName || input.userEmail || "Account user", `Role: ${labelize(input.role)}`]
        },
        { label: "Message", lines: [input.message] }
      ],
      cta: { label: "Open support queue", href: `${appUrl}/admin/support` },
      idempotencyKey: `support-admin-${input.ticketId}`
    })
  ]);
}

export async function notifyCustomerRegistered(input: { userId: string; email: string; firstName?: string | null }) {
  await sendBestEffort([
    sendTransactionalEmail({
      to: input.email,
      subject: "Welcome to Fixit247",
      eyebrow: "Account ready",
      title: `Welcome${input.firstName ? `, ${input.firstName}` : ""}.`,
      intro:
        "Your Fixit247 account is ready. You can start requests, save property details, and keep Safety Checks and PropertySafe records in one place.",
      sections: [
        {
          label: "Useful next steps",
          lines: ["Save your home or investment property details.", "Start a request when something needs attention.", "Review Fixit Plus if you want Safety Checks included."]
        }
      ],
      cta: { label: "Open my account", href: `${appUrl}/dashboard/customer` },
      idempotencyKey: `customer-welcome-${input.userId}`
    })
  ]);
}

export async function notifyAgencyRegistered(input: {
  userId: string;
  email: string;
  firstName?: string | null;
  agencyName: string;
  portfolioSize: string;
}) {
  await sendBestEffort([
    sendTransactionalEmail({
      to: input.email,
      subject: "Your PropertySafe agency account is ready",
      category: "agency",
      eyebrow: "Agency account ready",
      title: `Welcome${input.firstName ? `, ${input.firstName}` : ""}.`,
      intro:
        "Your PropertySafe agency account is ready. Start with the agency profile, add the first managed property, then prepare careful sharing only when the record is ready.",
      sections: [
        {
          label: input.agencyName,
          lines: [
            `Portfolio size: ${input.portfolioSize}`,
            "Agency users manage the process.",
            "Owners and landlords see only the records your team chooses to share.",
            "Maintenance requests still move through Fixit247 so the useful history stays connected."
          ]
        }
      ],
      cta: { label: "Open agency account", href: `${appUrl}/dashboard/agency` },
      idempotencyKey: `agency-welcome-${input.userId}`
    }),
    sendAdminAlert({
      subject: `New PropertySafe agency account: ${input.agencyName}`,
      category: "agency",
      eyebrow: "Agency onboarding",
      title: input.agencyName,
      intro: "A PropertySafe agency account has been created and is ready for onboarding follow-up.",
      sections: [{ label: "Portfolio", lines: [`Size: ${input.portfolioSize}`, `Email: ${input.email}`] }],
      cta: { label: "Open PropertySafe admin", href: `${appUrl}/admin/propertysafe` },
      idempotencyKey: `agency-admin-${input.userId}`
    })
  ]);
}

export async function notifyFixerRegistered(input: {
  userId: string;
  email: string;
  firstName?: string | null;
  businessName: string;
  bonusCredits: number;
}) {
  await sendBestEffort([
    sendTransactionalEmail({
      to: input.email,
      subject: "Your Fixit247 Fixer account is ready",
      eyebrow: "Fixer onboarding",
      title: `Welcome${input.firstName ? `, ${input.firstName}` : ""}.`,
      intro:
        "Your Fixer account has been created. Open your dashboard to complete your profile, verify your contact email, and add the details the team needs for review.",
      sections: [
        {
          label: input.businessName,
          lines: [
            "Start with the dashboard checklist.",
            "Add trade, service area, ABN, licence, insurance, documents, and work preferences there.",
            "Use the dashboard email verification task when you are ready."
          ]
        }
      ],
      cta: { label: "Open Fixer account", href: `${appUrl}/dashboard/tradie` },
      idempotencyKey: `fixer-welcome-${input.userId}`
    }),
    sendAdminAlert({
      subject: `New Fixer signup: ${input.businessName}`,
      eyebrow: "Fixer onboarding",
      title: input.businessName,
      intro: "A new Fixer has created an account and can complete the full onboarding checklist from the dashboard.",
      sections: [{ label: "Signup", lines: ["Account created.", "Email verification, trade details, ABN, licence, insurance, and documents are dashboard tasks."] }],
      cta: { label: "Open Fixer directory", href: `${appUrl}/admin/tradies` },
      idempotencyKey: `fixer-admin-${input.userId}`
    })
  ]);
}

export async function notifyFixerOnboardingCompleted(input: {
  userId: string;
  email?: string | null;
  firstName?: string | null;
  businessName: string;
  tradeCategory?: string | null;
  serviceArea?: string | null;
  emergencyAvailable: boolean;
  agencyInterest: boolean;
  plannedMaintenanceInterest: boolean;
}) {
  await sendBestEffort([
    sendAdminAlert({
      subject: `Fixer profile completed: ${input.businessName}`,
      category: "fixer",
      eyebrow: "Fixer onboarding complete",
      title: input.businessName,
      intro: "A Fixer has completed the core dashboard onboarding details and is ready for admin review.",
      sections: [
        {
          label: "Profile",
          lines: [
            input.email ? `Email: ${input.email}` : null,
            input.tradeCategory ? `Trade: ${input.tradeCategory}` : null,
            input.serviceArea ? `Service area: ${input.serviceArea}` : null,
            `Emergency availability: ${input.emergencyAvailable ? "Yes" : "No"}`,
            `Agency/property maintenance interest: ${input.agencyInterest ? "Yes" : "No"}`,
            `Planned maintenance/contracts interest: ${input.plannedMaintenanceInterest ? "Yes" : "No"}`
          ]
        }
      ],
      cta: { label: "Review Fixer profile", href: `${appUrl}/admin/tradies` },
      idempotencyKey: `fixer-onboarding-complete-admin-${input.userId}`
    })
  ]);
}

export async function notifySafetyCheckBooked(input: {
  safetyCheckId: string;
  userEmail?: string | null;
  firstName?: string | null;
  propertyLabel?: string | null;
  preferredWindow: string;
}) {
  await sendBestEffort([
    input.userEmail
      ? sendTransactionalEmail({
          to: input.userEmail,
          subject: "Your Fixit247 Safety Check request is saved",
          eyebrow: "Safety Check",
          title: "Your Safety Check booking request is saved.",
          intro:
            "Fixit247 has your preferred window. The team can now review the booking and assign a suitable Fixer when the appointment is ready to move forward.",
          sections: [
            {
              label: "Booking",
              lines: [input.propertyLabel || "Saved property", `Preferred window: ${input.preferredWindow}`]
            }
          ],
          cta: { label: "View Safety Checks", href: `${appUrl}/dashboard/customer/safety-checks` },
          idempotencyKey: `safety-check-booked-${input.safetyCheckId}`
        })
      : null,
    sendAdminAlert({
      subject: "New Safety Check booking request",
      eyebrow: "Safety Check",
      title: input.propertyLabel || "Safety Check booking",
      intro: "A member has requested a Safety & Readiness Check.",
      sections: [{ label: "Preferred window", lines: [input.preferredWindow] }],
      cta: { label: "Open Safety Checks", href: `${appUrl}/admin/safety-checks` },
      idempotencyKey: `safety-check-admin-${input.safetyCheckId}`
    })
  ]);
}

export async function notifySafetyCheckReportPublished(input: {
  safetyCheckId: string;
  userEmail?: string | null;
  scoreAfter: number;
  recommendationCount: number;
}) {
  await sendBestEffort([
    input.userEmail
      ? sendTransactionalEmail({
          to: input.userEmail,
          subject: "Your Fixit247 Safety Check report is ready",
          eyebrow: "Report ready",
          title: "Your Safety Check report is ready.",
          intro:
            "Your completed report is now available in your account. PropertySafe has also been updated from the real check details.",
          sections: [
            {
              label: "Summary",
              lines: [`Readiness score: ${input.scoreAfter}/100`, `${input.recommendationCount} recommended fixes recorded.`]
            }
          ],
          cta: { label: "View report", href: `${appUrl}/dashboard/customer/safety-checks/${input.safetyCheckId}` },
          idempotencyKey: `safety-check-report-${input.safetyCheckId}`
        })
      : null
  ]);
}

export async function notifyLeadClaimed(input: {
  jobId: string;
  reference: string;
  jobTitle: string;
  fixerName: string;
  fixerEmail?: string | null;
  customerEmail?: string | null;
}) {
  await sendBestEffort([
    input.fixerEmail
      ? sendTransactionalEmail({
          to: input.fixerEmail,
          subject: `Lead claimed: ${input.reference}`,
          eyebrow: "Lead claimed",
          title: "The request is now in your claimed list.",
          intro: "You can review the customer details and continue from your Fixer account.",
          sections: [{ label: "Request", lines: [input.jobTitle, `Reference: ${input.reference}`] }],
          cta: { label: "Open leads", href: `${appUrl}/dashboard/tradie/leads` },
          idempotencyKey: `lead-claimed-fixer-${input.jobId}-${input.fixerEmail}`
        })
      : null,
    input.customerEmail
      ? sendTransactionalEmail({
          to: input.customerEmail,
          subject: `A Fixer has claimed your request ${input.reference}`,
          eyebrow: "Fixer update",
          title: "A Fixer is reviewing your request.",
          intro: "Your request has moved forward. Keep an eye on your account for the next update.",
          sections: [{ label: "Request", lines: [input.jobTitle, `Fixer: ${input.fixerName}`] }],
          cta: { label: "Open request", href: `${appUrl}/dashboard/customer/jobs/${input.jobId}` },
          idempotencyKey: `lead-claimed-customer-${input.jobId}-${input.customerEmail}`
        })
      : null,
    sendAdminAlert({
      subject: `Lead claimed: ${input.reference}`,
      eyebrow: "Lead claim",
      title: input.jobTitle,
      intro: `${input.fixerName} claimed this request.`,
      cta: { label: "Open request", href: `${appUrl}/admin/jobs/${input.jobId}` },
      idempotencyKey: `lead-claimed-admin-${input.jobId}-${input.fixerName}`
    })
  ]);
}

export async function notifyJobStatusChanged(input: {
  jobId: string;
  reference: string;
  title: string;
  status: string;
  customerEmail?: string | null;
  fixerEmail?: string | null;
}) {
  const statusLabel = labelize(input.status);
  await sendBestEffort([
    input.customerEmail
      ? sendTransactionalEmail({
          to: input.customerEmail,
          subject: `Fixit247 request update: ${statusLabel}`,
          eyebrow: "Request update",
          title: statusLabel,
          intro: "Your request status has been updated. The latest detail is available in your account.",
          sections: [{ label: "Request", lines: [input.title, `Reference: ${input.reference}`] }],
          cta: { label: "View request", href: `${appUrl}/dashboard/customer/jobs/${input.jobId}` },
          idempotencyKey: `job-status-customer-${input.jobId}-${input.status}`
        })
      : null,
    input.fixerEmail
      ? sendTransactionalEmail({
          to: input.fixerEmail,
          subject: `Fixit247 assigned request update: ${statusLabel}`,
          eyebrow: "Request update",
          title: statusLabel,
          intro: "The assigned request status has been updated.",
          sections: [{ label: "Request", lines: [input.title, `Reference: ${input.reference}`] }],
          cta: { label: "View assigned request", href: `${appUrl}/dashboard/tradie/jobs/${input.jobId}` },
          idempotencyKey: `job-status-fixer-${input.jobId}-${input.status}`
        })
      : null
  ]);
}

export async function notifyPropertySafeInvite(input: {
  participantId: string;
  email: string;
  propertyLabel?: string | null;
  agencyName?: string | null;
  relationship: string;
}) {
  await sendBestEffort([
    sendTransactionalEmail({
      to: input.email,
      subject: "PropertySafe access has been prepared for you",
      eyebrow: "PropertySafe",
      title: "A property record is ready to review.",
      intro:
        "Fixit247 PropertySafe lets owners, landlords, and agencies keep Safety Check history, recommendations, and follow-up work connected to the property record.",
      sections: [
        {
          label: input.propertyLabel || "PropertySafe record",
          lines: [
            input.agencyName ? `Shared by: ${input.agencyName}` : null,
            `Access type: ${labelize(input.relationship)}`,
            "Sign in or create an account with this email address to view shared access."
          ]
        }
      ],
      cta: { label: "Open PropertySafe", href: `${appUrl}/dashboard/customer` },
      idempotencyKey: `propertysafe-invite-${input.participantId}`
    })
  ]);
}

export async function notifyAgencyOwnerInvited(input: {
  inviteId: string;
  email: string;
  agencyName: string;
  propertyLabel: string;
  ownerName?: string | null;
  accessLevel: string;
  status: string;
}) {
  await sendBestEffort([
    sendTransactionalEmail({
      to: input.email,
      subject: `${input.agencyName} prepared PropertySafe access`,
      eyebrow: "PropertySafe owner access",
      title: input.ownerName ? `${input.ownerName}, your property record is being prepared.` : "Your property record is being prepared.",
      intro:
        "PropertySafe gives owners and landlords a clearer view of useful property history while the agency keeps maintenance work organised and deliberate.",
      sections: [
        {
          label: input.propertyLabel,
          lines: [
            `Agency: ${input.agencyName}`,
            `Access: ${labelize(input.accessLevel)}`,
            input.status === "active"
              ? "Your account is already linked to this owner access."
              : "Create or sign in with this email address when the agency is ready to share the record."
          ]
        }
      ],
      cta: { label: "Open Fixit247 account", href: `${appUrl}/dashboard` },
      idempotencyKey: `agency-owner-invite-${input.inviteId}`
    })
  ]);
}

export async function notifyPropertySafeWalkthroughRequested(input: {
  ticketId?: string | null;
  name: string;
  email: string;
  phone: string;
  agencyName: string;
  role: string;
  portfolioSize: string;
  priority: string;
  suburb?: string | null;
  message?: string | null;
}) {
  const ticketRef = input.ticketId ? `Reference: ${input.ticketId}` : null;

  await sendBestEffort([
    sendTransactionalEmail({
      to: input.email,
      subject: "Your PropertySafe walkthrough request is in",
      eyebrow: "PropertySafe onboarding",
      title: "We have your PropertySafe walkthrough request.",
      intro:
        "The walkthrough is for understanding your property portfolio, sharing needs, maintenance flow, and how PropertySafe can sit beside your current agency process.",
      sections: [
        {
          label: input.agencyName,
          lines: [
            `Portfolio size: ${input.portfolioSize}`,
            `Main focus: ${labelize(input.priority)}`,
            input.suburb ? `Primary area: ${input.suburb}` : null,
            ticketRef
          ]
        },
        {
          label: "What happens next",
          lines: [
            "Fixit247 reviews the details and prepares the right onboarding conversation.",
            "You can create an agency account now if you want the setup ready before the call.",
            "Urgent maintenance requests can still be started separately through Get help now."
          ]
        }
      ],
      cta: { label: "Create agency account", href: `${appUrl}/agency/register` },
      idempotencyKey: `propertysafe-walkthrough-user-${input.email.toLowerCase()}-${input.ticketId ?? input.agencyName}`
    }),
    sendAdminAlert({
      subject: `PropertySafe walkthrough: ${input.agencyName}`,
      eyebrow: "PropertySafe agency lead",
      title: `${input.agencyName} requested a walkthrough.`,
      intro: "A property manager, agency, landlord, or owner wants PropertySafe onboarding.",
      sections: [
        {
          label: "Lead",
          lines: [
            `Name: ${input.name}`,
            `Email: ${input.email}`,
            `Phone: ${input.phone}`,
            `Role: ${labelize(input.role)}`,
            `Portfolio: ${input.portfolioSize}`,
            `Focus: ${labelize(input.priority)}`,
            input.suburb ? `Area: ${input.suburb}` : null,
            ticketRef
          ]
        },
        input.message ? { label: "Message", lines: [input.message] } : { lines: [] }
      ],
      cta: { label: "Open support queue", href: `${appUrl}/admin/support` },
      replyTo: input.email,
      idempotencyKey: `propertysafe-walkthrough-admin-${input.email.toLowerCase()}-${input.ticketId ?? input.agencyName}`
    })
  ]);
}

export async function notifyFixerVerificationReviewed(input: {
  documentId: string;
  fixerEmail?: string | null;
  status: string;
  notes?: string | null;
}) {
  await sendBestEffort([
    input.fixerEmail
      ? sendTransactionalEmail({
          to: input.fixerEmail,
          subject: `Fixit247 verification ${input.status}`,
          eyebrow: "Verification",
          title: `Verification ${labelize(input.status)}.`,
          intro:
            input.status === "approved"
              ? "Your verification has been approved. Your Fixer profile is stronger for customers reviewing your work."
              : "Your verification needs another look. Review the note and update your documents when ready.",
          sections: input.notes ? [{ label: "Admin note", lines: [input.notes] }] : undefined,
          cta: { label: "Open Fixer profile", href: `${appUrl}/dashboard/tradie/profile` },
          idempotencyKey: `verification-${input.documentId}-${input.status}`
        })
      : null
  ]);
}

export async function notifyLeadCreditsRefunded(input: {
  leadClaimId: string;
  fixerEmail?: string | null;
  amount: number;
  reason: string;
}) {
  await sendBestEffort([
    input.fixerEmail
      ? sendTransactionalEmail({
          to: input.fixerEmail,
          subject: "Fixit247 lead credits refunded",
          eyebrow: "Credits refunded",
          title: `${input.amount} lead credits have been returned.`,
          intro: "Fixit247 reviewed the lead claim and returned credits to your wallet.",
          sections: [{ label: "Reason", lines: [input.reason] }],
          cta: { label: "Open wallet", href: `${appUrl}/dashboard/tradie/wallet` },
          idempotencyKey: `lead-refund-${input.leadClaimId}`
        })
      : null
  ]);
}

export async function notifySupportTicketStatusChanged(input: {
  ticketId: string;
  userEmail?: string | null;
  subject: string;
  status: string;
  note?: string | null;
}) {
  await sendBestEffort([
    input.userEmail
      ? sendTransactionalEmail({
          to: input.userEmail,
          subject: `Fixit247 support update: ${labelize(input.status)}`,
          eyebrow: "Support update",
          title: labelize(input.status),
          intro: "Your support request has been updated.",
          sections: [
            { label: "Subject", lines: [input.subject] },
            input.note ? { label: "Note", lines: [input.note] } : { lines: [] }
          ],
          cta: { label: "Open support", href: `${appUrl}/dashboard/support` },
          idempotencyKey: `support-status-${input.ticketId}-${input.status}`
        })
      : null
  ]);
}

export async function notifyMembershipStatusChanged(input: {
  membershipId: string;
  userEmail?: string | null;
  status: string;
  plan?: string | null;
}) {
  await sendBestEffort([
    input.userEmail
      ? sendTransactionalEmail({
          to: input.userEmail,
          subject: `Fixit247 membership ${labelize(input.status)}`,
          eyebrow: "Membership",
          title: `Your membership is ${labelize(input.status)}.`,
          intro:
            input.status === "active"
              ? "Your Fixit Plus membership is active. Safety Check access and member benefits are now available according to your plan."
            : "Your Fixit Plus membership status has changed. You can review the latest detail in your account.",
          sections: [{ label: "Plan", lines: [input.plan ? labelize(input.plan) : "Fixit Plus"] }],
          cta: { label: "Open membership", href: `${appUrl}/dashboard/customer/membership` },
          idempotencyKey: `membership-${input.membershipId}-${input.status}`
        })
      : null
  ]);
}

export async function notifySafetyCheckAssigned(input: {
  safetyCheckId: string;
  customerEmail?: string | null;
  fixerEmail?: string | null;
  fixerName?: string | null;
}) {
  await sendBestEffort([
    input.customerEmail
      ? sendTransactionalEmail({
          to: input.customerEmail,
          subject: "A Fixer has been assigned to your Safety Check",
          eyebrow: "Safety Check",
          title: "Your Safety Check has an assigned Fixer.",
          intro: "Fixit247 has moved your booking forward. You can review the booking from your account.",
          sections: [{ label: "Assigned Fixer", lines: [input.fixerName || "Fixit247 Fixer"] }],
          cta: { label: "View Safety Checks", href: `${appUrl}/dashboard/customer/safety-checks` },
          idempotencyKey: `safety-check-assigned-customer-${input.safetyCheckId}`
        })
      : null,
    input.fixerEmail
      ? sendTransactionalEmail({
          to: input.fixerEmail,
          subject: "New Fixit247 Safety Check assignment",
          eyebrow: "Safety Check",
          title: "A Safety Check has been assigned to you.",
          intro: "Review the appointment and prepare the checklist before attending.",
          cta: { label: "Open Safety Checks", href: `${appUrl}/dashboard/tradie/safety-checks` },
          idempotencyKey: `safety-check-assigned-fixer-${input.safetyCheckId}`
        })
      : null
  ]);
}

export async function notifySafetyCheckStatusChanged(input: {
  safetyCheckId: string;
  customerEmail?: string | null;
  status: string;
  note?: string | null;
}) {
  await sendBestEffort([
    input.customerEmail
      ? sendTransactionalEmail({
          to: input.customerEmail,
          subject: `Fixit247 Safety Check update: ${labelize(input.status)}`,
          eyebrow: "Safety Check update",
          title: labelize(input.status),
          intro: "Your Safety Check status has been updated.",
          sections: input.note ? [{ label: "Note", lines: [input.note] }] : undefined,
          cta: { label: "View Safety Checks", href: `${appUrl}/dashboard/customer/safety-checks` },
          idempotencyKey: `safety-check-status-${input.safetyCheckId}-${input.status}`
        })
      : null
  ]);
}

function renderEmail(payload: EmailPayload) {
  const safeTitle = escapeHtml(payload.title);
  const safeIntro = escapeHtml(payload.intro);
  const eyebrow = payload.eyebrow ? `<p style="margin:0 0 16px;color:#d97706;font-size:13px;font-weight:800;letter-spacing:.02em;">${escapeHtml(payload.eyebrow)}</p>` : "";
  const sections = (payload.sections ?? [])
    .map((section) => {
      const lines = section.lines.filter(Boolean).map((line) => `<p style="margin:6px 0;color:#5f5a54;font-size:15px;line-height:1.6;">${escapeHtml(line || "")}</p>`);
      if (!lines.length) return "";
      return `<div style="margin-top:24px;padding-top:18px;border-top:1px solid #eee7dc;">${
        section.label ? `<p style="margin:0 0 8px;color:#1f1b18;font-size:14px;font-weight:900;">${escapeHtml(section.label)}</p>` : ""
      }${lines.join("")}</div>`;
    })
    .join("");
  const cta = payload.cta
    ? `<a href="${escapeHtml(payload.cta.href)}" style="display:inline-block;margin-top:28px;background:#f59e0b;color:#1f1b18;text-decoration:none;font-weight:900;border-radius:14px;padding:14px 20px;">${escapeHtml(payload.cta.label)}</a>`
    : "";

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f7f4ee;font-family:Arial,Helvetica,sans-serif;color:#1f1b18;">
    <div style="display:none;max-height:0;overflow:hidden;">${safeIntro}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ee;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdfa;border:1px solid #eadfce;border-radius:22px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 10px;">
                <p style="margin:0;font-size:18px;font-weight:900;">Fixit<span style="color:#f59e0b;">247</span></p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 32px;">
                ${eyebrow}
                <h1 style="margin:0 0 14px;font-size:30px;line-height:1.12;color:#1f1b18;">${safeTitle}</h1>
                <p style="margin:0;color:#5f5a54;font-size:16px;line-height:1.7;">${safeIntro}</p>
                ${sections}
                ${cta}
                <p style="margin:28px 0 0;color:#8b8379;font-size:13px;line-height:1.6;">Need help? Contact Fixit247 support at ${escapeHtml(supportEmail)}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textParts = [
    "Fixit247",
    payload.eyebrow,
    payload.title,
    payload.intro,
    ...(payload.sections ?? []).flatMap((section) => [section.label, ...section.lines.filter(Boolean)]),
    payload.cta ? `${payload.cta.label}: ${payload.cta.href}` : null,
    `Support: ${supportEmail}`
  ].filter(Boolean);

  return {
    html,
    text: textParts.join("\n\n")
  };
}

function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${appUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    appUrl,
    fromEmail,
    adminAlertEmails,
    supportEmail
  };
}

function deriveCategory(payload: EmailPayload) {
  const key = `${payload.idempotencyKey ?? ""} ${payload.subject}`.toLowerCase();
  if (key.includes("newsletter")) return "newsletter";
  if (key.includes("walkthrough") || key.includes("propertysafe")) return "propertysafe";
  if (key.includes("support")) return "support";
  if (key.includes("safety-check") || key.includes("safety check")) return "safety_check";
  if (key.includes("lead")) return "lead";
  if (key.includes("membership")) return "membership";
  if (key.includes("verification")) return "verification";
  if (key.includes("fixer")) return "fixer";
  if (key.includes("customer") || key.includes("welcome")) return "account";
  if (key.includes("request") || key.includes("job")) return "request";
  return "transactional";
}

async function logEmailDelivery(input: {
  recipients: string[];
  subject: string;
  category: string;
  status: "sent" | "failed" | "skipped";
  providerId?: string | null;
  providerStatus?: number | null;
  error?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const rows = input.recipients.map((recipient) => ({
    recipient,
    subject: input.subject,
    category: input.category,
    status: input.status,
    provider: "resend",
    provider_message_id: input.providerId ?? null,
    provider_status: input.providerStatus ?? null,
    error: input.error ? input.error.slice(0, 1000) : null,
    idempotency_key: input.idempotencyKey ? input.idempotencyKey.slice(0, 256) : null,
    metadata: input.metadata ?? {}
  }));

  const { error } = await supabase.from("email_delivery_logs").insert(rows);
  if (error && error.code !== "42P01") {
    console.error("Fixit247 email log failed", error.message);
  }
}

function safeJson(value: string) {
  if (!value) return null;
  try {
    return JSON.parse(value) as { id?: unknown };
  } catch {
    return null;
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function splitEmails(value: string) {
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function labelize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
