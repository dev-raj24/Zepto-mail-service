export async function POST(req: Request) {
  const { to, subject, body, mode, replyMapping } = await req.json();

  if (!to || !subject || !body || !mode) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const apiKey = process.env.ZEPTO_SECRET;
  const apiUrl = process.env.apiUrl ;
  const from = process.env.from ; // Verified sender

  try {
    for (let i = 0; i < to.length; i++) {
      const recipient = to[i];

      // Dynamic reply-to
      let replyTo: string;
      switch (mode) {
        case 1: // Use mapping if exists, else default to sender
          replyTo = (replyMapping && replyMapping[recipient]) || from;
          break;
        case 2: // Recipient cannot reply
          replyTo = "no-reply@codekraftsolutions.com"
          break;
        case 3: // Mail only goes to admin(s)
          if (!(replyMapping && replyMapping[recipient])) continue; // skip if recipient not in mapping
          replyTo = from;
          break;
        default:
          replyTo = from;
      }

      const emailData = {
        from: { address: from, name: "Port Flow" },
        to: [{ email_address: { address: recipient } }],
        reply_to: [{ address: replyTo, name: replyTo.split("@")[0] }],
        subject,
        htmlbody: body
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey
        },
        body: JSON.stringify(emailData)
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
