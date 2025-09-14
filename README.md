This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

How to Use the Email Sending API

To use the Email Sending API, first make sure your environment variables are set. You need ZEPTO_SECRET for your ZeptoMail API key, apiUrl for your email service endpoint, and from for the default sender email address, which will be used when sending emails in DEFAULT mode. In READ_ONLY mode, the from address will automatically switch to no-reply@yourdomain.com to prevent customers from replying. Once the environment is configured, you can make a POST request to your API endpoint, for example http://localhost:3000/api/send-email during local development or your deployed URL. The JSON body of the request should include the following fields: to (an array of all recipient emails including the admin and customers), cc (optional array of email addresses to send as CC), bcc (optional array of email addresses to send as BCC), subject (the email subject), body (the HTML content of the email), companyName (the sender name to display), adminEmail (the admin who receives customer replies), and mode which can be either "DEFAULT" for normal email interactions or "READ_ONLY" to prevent customer replies. For example, a JSON body might look like this: {"to":["admin@example.com","customer1@example.com"],"cc":["manager@example.com"],"bcc":["audit@example.com"],"subject":"Important Update","body":"<p>Hello, this is your message</p>","companyName":"My Company","adminEmail":"admin@example.com","mode":"READ_ONLY"}. After sending the request, the API will respond with a success message if all emails are sent correctly, or return an error message with the status code if any required fields are missing, the server is not configured, or if the email service returns an error. You can also test the API quickly using a curl command by sending the same JSON body to your endpoint with Content-Type: application/json. Following these steps ensures that admins receive normal emails while customers receive emails according to the selected mode, with READ_ONLY emails clearly marked and non-replyable, and CC/BCC recipients included if specified.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
