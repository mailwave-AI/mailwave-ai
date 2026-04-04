const { google } = require('googleapis');

const getOAuthClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  // This automatically uses the refresh token inside Googleapis if the access token is expired!
  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken
  });
  return oauth2Client;
};

// Helper: Decodes complex MIME payload tree down to plaintext body
const getBody = (payload) => {
  if (!payload.parts) {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf8');
    }
    return '';
  }
  let body = '';
  for (let part of payload.parts) {
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      body += Buffer.from(part.body.data, 'base64').toString('utf8');
    } else if (part.parts) {
      body += getBody(part); // Recursive search for body part
    }
  }
  return body;
};

// Helper: Easily grab standard headers like from/subject
const getHeader = (headers, name) => {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : '';
};

exports.getInbox = async (req, res) => {
  try {
    const auth = getOAuthClient(req.user);
    const gmail = google.gmail({ version: 'v1', auth });

    // Fetch the 10 most recent emails from the INBOX
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      labelIds: ['INBOX'],
    });

    const messages = response.data.messages || [];
    if (messages.length === 0) return res.json([]);

    // The list endpoint only gives IDs. We must fetch full data for each ID.
    const fullMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgData = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        });
        const headers = msgData.data.payload.headers;
        return {
          id: msgData.data.id,
          snippet: msgData.data.snippet, // 1 line short preview
          subject: getHeader(headers, 'subject') || '(No Subject)',
          from: getHeader(headers, 'from'),
          date: getHeader(headers, 'date'),
          body: getBody(msgData.data.payload) // Multi-line full text body
        };
      })
    );

    res.json(fullMessages);
  } catch (error) {
    console.error("Fetch Inbox Error:", error);
    res.status(500).json({ message: 'Failed to access Gmail API' });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const auth = getOAuthClient(req.user);
    const gmail = google.gmail({ version: 'v1', auth });

    // Construct raw MIME email format correctly with Base64 encoding
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${req.user.email}`,
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    
    // URL-safe base64 encoding (crucial for Gmail API)
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error("Send Email Error:", error);
    res.status(500).json({ message: 'Failed to send email via Gmail API' });
  }
};
