export async function POST(req: Request): Promise<Response> {
  type RequestBody = {
    to: string[];
    subject: string;
    body: string;
    companyName:string,
    mode: "DEFAULT" | "READ_ONLY";
    replyMapping?: Record<string, string>;
  };

  const {  companyName ,to, subject, body, mode, replyMapping }: RequestBody = await req.json();

  if (!to || !Array.isArray(to) || !subject || !body || !mode) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const apiKey = process.env.ZEPTO_SECRET ?? "";
  const apiUrl = process.env.apiUrl ?? "";
  const from = process.env.from ?? "";

  if (!apiKey || !apiUrl || !from) {
    return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });
  }

  try {
    for (const recipient of to) {
      const replyTo = mode === "DEFAULT"
        ? replyMapping?.[recipient] || from
        : undefined;

      const emailData: Record<string, unknown> = {
        from: { address: from, name: companyName },
        to: [{ email_address: { address: recipient } }],
        subject,
        htmlbody: body,
      };

      if (replyTo) {
        emailData.reply_to = [{ address: replyTo, name: replyTo.split("@")[0] }];
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const text = await response.text();
        return new Response(text, { status: response.status });
      }
    }

    return new Response(JSON.stringify({ message: "Emails sent successfully" }), { status: 200 });
  } catch (err) {
    console.error("Error sending emails:", err);
    return new Response(JSON.stringify({ error: "Failed to send emails" }), { status: 500 });
  }
}
