# Email Setup Guide

To enable email sending from the contact form, you need to configure SMTP settings.

## Gmail Setup (Recommended)

1. **Enable 2-Step Verification** on your Google Account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate an App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Pizza Time Backend" as the name
   - Copy the generated 16-character password

3. **Update `.env` file** in the `backend` directory:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```
Update the transporter in `server.js`:
```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Custom SMTP
```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
```
Update the transporter in `server.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## Testing

After setting up, restart the backend server and test the contact form. Emails will be sent to: **nithinjd06@gmail.com**

## Troubleshooting

- **"Invalid login"**: Check that your email and password are correct
- **"Connection timeout"**: Check your firewall/network settings
- **Gmail issues**: Make sure you're using an App Password, not your regular password
- **Check server logs**: Look for detailed error messages in the console

