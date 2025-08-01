const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 5000;
const TO_EMAIL = 'torikul.meraj@gmail.com';

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5500", "http://localhost:5500", "https://fusaripro.com"],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS/SSL
  auth: {
    user: 'fusaripro@gmail.com',
    pass: 'xigg iyco bfbb jgnv', // App Password here (no spaces)
  },
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Function to generate PDF from HTML content
async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });

  await browser.close();
  return pdfBuffer;
}

// Form submission endpoint
app.post('/submit-distributorship-form', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully! We will contact you soon.'
    });
    const formData = req.body;

    // Format the email content for PDF
    const pdfHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Distributorship Form Submission</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 20px;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
          }
          .header { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
            text-align: center;
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .section h3 { 
            color: #2c3e50; 
            border-bottom: 2px solid #3498db; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
          }
          .question { 
            margin-bottom: 15px; 
            padding: 10px; 
            background-color: #f8f9fa; 
            border-radius: 5px; 
          }
          .question strong { 
            color: #2c3e50; 
            display: block; 
            margin-bottom: 5px; 
          }
          .answer { 
            color: #27ae60; 
            font-weight: 500; 
          }
          .no-answer { 
            color: #e74c3c; 
            font-style: italic; 
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; color: #2c3e50;">📋 New Distributorship Form Submission</h2>
            <p style="margin: 5px 0 0 0; color: #7f8c8d;">Received on ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="section">
            <h3>🏢 Business Overview</h3>
            <div class="question">
              <strong>What is the name of your tailor store?</strong>
              <div class="answer">${formData.store_name || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Where is your store located?</strong>
              <div class="answer">${formData.store_location || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Enter an email address like example@mysite.com.</strong>
              <div class="answer">${formData.email || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Do you specialize in any particular type of tailoring?</strong>
              <div class="answer">${formData.specialization || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Who is your target clientele?</strong>
              <div class="answer">${formData.target_clientele || '<span class="no-answer">Not provided</span>'}</div>
            </div>
          </div>
          
          <div class="section">
            <h3>👔 Current Product Offering</h3>
            <div class="question">
              <strong>What types of garments do you currently offer?</strong>
              <div class="answer">${Array.isArray(formData.current_products) ? formData.current_products.join(', ') : formData.current_products || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>What is your average order size per customer in term of Product number per order?</strong>
              <div class="answer">${formData.average_order_quantity || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>What is your average order size per customer in term of revenue?</strong>
              <div class="answer">${formData.average_order_revenue || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>What would you like to offer that you currently don't?</strong>
              <div class="answer">${formData.future_offering || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>How many supplier do you currently have?</strong>
              <div class="answer">${formData.supplier_count || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Where do you currently outsource your confection?</strong>
              <div class="answer">${formData.outsourcing_location || '<span class="no-answer">Not provided</span>'}</div>
            </div>
          </div>
          
          <div class="section">
            <h3>🔗 Supply Chain & Pain Points</h3>
            <div class="question">
              <strong>What is the % of order that you give to your main supplier?</strong>
              <div class="answer">${formData.main_supplier_order_percent || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>What are your biggest challenges with your current suppliers?</strong>
              <div class="answer">${Array.isArray(formData.supplier_challenges) ? formData.supplier_challenges.join(', ') : formData.supplier_challenges || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Do you feel you are losing time when taking orders?</strong>
              <div class="answer">${formData.losing_time_on_orders || '<span class="no-answer">Not provided</span>'}</div>
            </div>
          </div>
          
          <div class="section">
            <h3>🤝 Interest in a New Supplier</h3>
            <div class="question">
              <strong>Do you experience issues with reordering?</strong>
              <div class="answer">${formData.issues_with_reordering || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Are you open to exploring a supplier offering:</strong>
              <div class="answer">${Array.isArray(formData.interest_in_new_supplier) ? formData.interest_in_new_supplier.join(', ') : formData.interest_in_new_supplier || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>What factors would influence you to switch or add a new supplier?</strong>
              <div class="answer">${Array.isArray(formData.supplier_switch_factors) ? formData.supplier_switch_factors.join(', ') : formData.supplier_switch_factors || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Would you be interested in discovering our offering to evaluate all our benefits?</strong>
              <div class="answer">${formData.interest_in_demo || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>How do you want to talk?</strong>
              <div class="answer">${formData.preferred_contact_method || '<span class="no-answer">Not provided</span>'}</div>
            </div>
            <div class="question">
              <strong>Leave us your Whatsapp, your phone number and your email. We will contact you soon. Thanks a lot for your time</strong>
              <div class="answer">${formData.contact_details || '<span class="no-answer">Not provided</span>'}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Generate PDF
    const pdfBuffer = await generatePDF(pdfHtmlContent);

    // Create a temporary file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfFileName = `distributorship-form-${timestamp}.pdf`;
    const pdfFilePath = path.join(__dirname, pdfFileName);

    // Write PDF buffer to file
    fs.writeFileSync(pdfFilePath, pdfBuffer);

    // Email options with PDF attachment
    const mailOptions = {
      from: 'Fusari Pro <fusaripro@gmail.com>',
      to: TO_EMAIL, // Replace with recipient email
      subject: 'New Distributorship Form Submission - Fusari Pro',
      html: `
        <h2>New Distributorship Form Submission</h2>
        <p>A new distributorship form has been submitted. Please find the detailed form data attached as a PDF.</p>
        <p><strong>Store Name:</strong> ${formData.store_name || 'Not provided'}</p>
        <p><strong>Store Location:</strong> ${formData.store_location || 'Not provided'}</p>
        <p><strong>Email:</strong> ${formData.email || 'Not provided'}</p>
        <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
      `,
      attachments: [
        {
          filename: pdfFileName,
          path: pdfFilePath
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions).then(res => {
      console.log('Email sent successfully');
    }).catch(err => {
      console.log('Error sending email:', err);
    });

    // Clean up the temporary PDF file
    fs.unlinkSync(pdfFilePath)

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form. Please try again.'
    });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});   