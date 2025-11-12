// Quick authorization helper script
const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('\n==============================================');
console.log('GMAIL AUTHORIZATION REQUIRED');
console.log('==============================================\n');
console.log('To send emails, you need to authorize Gmail access.\n');
console.log('1. Copy the URL below:');
console.log('\n' + authUrl + '\n');
console.log('2. Paste it in your browser');
console.log('3. Sign in with your Gmail account');
console.log('4. Grant permission to send emails');
console.log('5. You will be redirected to a success page\n');
console.log('This is a ONE-TIME setup. The token will be saved.\n');
console.log('==============================================\n');
