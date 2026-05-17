export const emailTestingTemplate = () => {
  return {
    subject: "Nodemailer Testing - Freshora",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; background: #f4f6f9; padding: 20px; border-radius: 16px;">
    <h2 style="color: #10b981;">Team 1</h2>
    <p>this email is for testing purposes only <strong style="color: #10b981;">freshora</strong>.</p>
    <div style="background: white; padding: 20px; text-align: center; border-radius: 12px;">
      <h3 style="color: #065f46;">Message:</h3>
      <h1 style="letter-spacing: 5px; color: #10b981;">TESTING</h1>
    </div>

    <hr style="border-color: #d1d5db;">
    <p style="font-size: 12px; color: #6b7280;">sent by Freshora — Eating healthy everywhere.</p>
  </div>
`,
  };
};
