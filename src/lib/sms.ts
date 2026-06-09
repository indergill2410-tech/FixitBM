export type SmsResult = {
  ok: boolean;
  sid?: string;
  error?: string;
};

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    return { ok: false, error: "SMS not configured." };
  }

  const normalised = normaliseAuPhone(to);
  if (!normalised) {
    return { ok: false, error: "Invalid phone number." };
  }

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ To: normalised, From: from, Body: body }).toString()
      }
    );

    const data = (await response.json()) as { sid?: string; message?: string };
    if (!response.ok) {
      return { ok: false, error: data.message ?? "SMS delivery failed." };
    }
    return { ok: true, sid: data.sid };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "SMS delivery failed." };
  }
}

function normaliseAuPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("61") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+61${digits.slice(1)}`;
  if (digits.length === 9) return `+61${digits}`;
  return null;
}

export async function notifyFixerAssignedSms(params: {
  fixerPhone: string | null | undefined;
  jobTitle: string;
  reference: string;
  urgency: string;
}) {
  if (!params.fixerPhone) return;
  const urgencyPrefix = params.urgency === "emergency" ? "🚨 EMERGENCY — " : "";
  await sendSms(
    params.fixerPhone,
    `${urgencyPrefix}Fixit247: You have been assigned a new job — ${params.jobTitle} (${params.reference}). Log in to view details.`
  );
}

export async function notifyCustomerStatusSms(params: {
  customerPhone: string | null | undefined;
  status: string;
  reference: string;
}) {
  if (!params.customerPhone) return;
  const label = params.status.replaceAll("_", " ");
  await sendSms(
    params.customerPhone,
    `Fixit247: Your request ${params.reference} has been updated — ${label}. Log in to track progress.`
  );
}

export async function notifySafetyCheckBookedSms(params: {
  adminPhone?: string | null;
  customerName: string;
  reference: string;
}) {
  const adminPhone = process.env.ADMIN_SMS_ALERT_PHONE;
  if (!adminPhone) return;
  await sendSms(
    adminPhone,
    `Fixit247 Safety Check booked by ${params.customerName} (${params.reference}). Assign a Fixer in the admin console.`
  );
}
