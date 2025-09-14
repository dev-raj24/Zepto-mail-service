export async function POST(req: Request): Promise<Response> {
  type RequestBody = {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    companyName: string;
    adminEmail: string;
    mode: "DEFAULT" | "READ_ONLY";
  };

  const { companyName, to, cc, bcc, subject, body, adminEmail, mode }: RequestBody = await req.json();

  if (!to?.length || !subject || !body || !adminEmail || !mode) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const apiKey = process.env.ZEPTO_SECRET ?? "";
  const apiUrl = process.env.apiUrl ?? "";
  const defaultFrom = process.env.from ?? "";

  if (!apiKey || !apiUrl || !defaultFrom) {
    return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });
  }

  try {
    const customers = to.filter(email => email !== adminEmail);

    for (const recipient of to) {
      const isAdmin = recipient === adminEmail;

      let replyTo: { address: string; name: string }[] | undefined;
      let emailBody = body;
      const emailFrom = { address: defaultFrom, name: companyName };

      if (isAdmin) {
        // Admin replies go to all customers
        replyTo = customers.map(c => ({ address: c, name: c.split("@")[0] }));
      } else {
        if (mode === "DEFAULT") {
          // Customer can reply to admin
          replyTo = [{ address: adminEmail, name: adminEmail.split("@")[0] }];
        } else if (mode === "READ_ONLY") {
          // Customer cannot reply
          replyTo = undefined;
          emailBody += `<p style="color:red; font-style:italic;">⚠️ This is a read-only message. Please do not reply to this email.</p>`;
          emailFrom.address = "no-reply@codekraftsolutions.com"; // Force no-reply
        }
      }

      const emailData: Record<string, unknown> = {
        from: emailFrom,
        to: to.map(addr => ({ email_address: { address: addr } })),
        subject,
        htmlbody: emailBody,
        ...(cc && cc.length ? { cc: cc.map(addr => ({ email_address: { address: addr } })) } : {}),
        ...(bcc && bcc.length ? { bcc: bcc.map(addr => ({ email_address: { address: addr } })) } : {}),
        ...(replyTo && { reply_to: replyTo }),
      
      };

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
