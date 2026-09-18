type EmailTemplate =
  | "welcome"
  | "password_reset"
  | "listing_submitted"
  | "listing_approved"
  | "listing_rejected"
  | "payment_successful"
  | "promotion_activated"
  | "promotion_expiring"
  | "plan_upgraded";

type SendEmailInput = {
  to: string;
  template: EmailTemplate;
  data: Record<string, string | number | undefined>;
};

export interface EmailProvider {
  name: string;
  send(input: SendEmailInput): Promise<void>;
}

const templates: Record<EmailTemplate, (data: SendEmailInput["data"]) => { subject: string; body: string }> = {
  welcome: (d) => ({
    subject: "Welcome to MakeMeViral",
    body: `Hi ${d.name},\n\nWelcome to MakeMeViral — discover what's trending.\n\nCreate your first listing and get discovered.`,
  }),
  password_reset: (d) => ({
    subject: "Reset your password",
    body: `Reset link: ${d.link}`,
  }),
  listing_submitted: (d) => ({
    subject: "Listing submitted for review",
    body: `"${d.title}" is pending moderation.`,
  }),
  listing_approved: (d) => ({
    subject: "Your listing was approved",
    body: `"${d.title}" is now live.`,
  }),
  listing_rejected: (d) => ({
    subject: "Listing not approved",
    body: `"${d.title}" was rejected. Reason: ${d.reason}`,
  }),
  payment_successful: (d) => ({
    subject: "Payment successful",
    body: `We received your payment of ${d.amount} ${d.currency}.`,
  }),
  promotion_activated: (d) => ({
    subject: "Promotion activated",
    body: `Your promotion is active until ${d.endAt}.`,
  }),
  promotion_expiring: (d) => ({
    subject: "Promotion expiring soon",
    body: `Your promotion expires at ${d.endAt}.`,
  }),
  plan_upgraded: (d) => ({
    subject: "Plan upgraded",
    body: `You're now on the ${d.plan} plan.`,
  }),
};

const consoleProvider: EmailProvider = {
  name: "console",
  async send(input) {
    const t = templates[input.template](input.data);
    console.info(`[email:${this.name}] to=${input.to} subject=${t.subject}\n${t.body}`);
  },
};

export const emailService = {
  async send(input: SendEmailInput) {
    const providerName = process.env.EMAIL_PROVIDER ?? "console";
    const provider = providerName === "console" ? consoleProvider : consoleProvider;
    await provider.send(input);
  },
};
