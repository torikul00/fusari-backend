# Server Setup

## Email Configuration

To enable email functionality, you need to set up environment variables:

1. Create a `.env` file in the server directory
2. Add the following variables:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RECIPIENT_EMAIL=recipient@example.com
PORT=3000
```

### Gmail Setup Instructions:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS`

3. Replace `your-email@gmail.com` with your actual Gmail address
4. Replace `recipient@example.com` with the email where you want to receive form submissions

## Running the Server

```bash
npm start
```

The server will run on port 3000 and serve the client files from the `../client` directory.

## API Endpoints

- `POST /submit-distributorship-form` - Handles form submissions and sends emails 