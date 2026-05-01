/**
 * PDF Receipt Generator
 * Generates a printable receipt for the parcel confirmation
 */

export const generateReceiptHTML = (data) => {
        const {
            parcelType,
            parcelName,
            weight,
            senderName,
            senderAddress,
            senderPhone,
            senderDistrict,
            pickupInstruction,
            receiverName,
            receiverAddress,
            receiverPhone,
            receiverDistrict,
            deliveryInstruction,
            deliveryType,
            basePrice,
            extraCharges,
            totalPrice,
            orderId
        } = data;

        const formattedDate = new Date().toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Parcel Confirmation Receipt</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          background: #f5f5f5;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #65a30d;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #65a30d;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .order-id {
          font-size: 14px;
          color: #6b7280;
          margin-top: 10px;
        }
        .date {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 5px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
        }
        .info-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 150px;
        }
        .info-value {
          color: #1f2937;
          text-align: right;
        }
        
        .pricing-table {
          width: 100%;
          margin-top: 20px;
        }
        .pricing-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .pricing-row.header {
          font-weight: bold;
          border-bottom: 2px solid #1f2937;
          color: #1f2937;
        }
        .pricing-row.total {
          font-weight: bold;
          font-size: 18px;
          background: #f0fdf4;
          border-top: 2px solid #65a30d;
          border-bottom: 2px solid #65a30d;
          padding: 15px 0;
          color: #15803d;
        }
        .pricing-label {
          color: #4b5563;
        }
        .pricing-value {
          text-align: right;
          color: #1f2937;
        }
        .pricing-value.total {
          color: #15803d;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .thank-you {
          font-size: 14px;
          font-weight: bold;
          color: #65a30d;
          margin-bottom: 10px;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">📦 ProFast</div>
          <div class="title">Parcel Confirmation Receipt</div>
          <div class="order-id">Order ID: ${orderId || 'PF-' + Date.now()}</div>
          <div class="date">Date: ${formattedDate}</div>
        </div>

        <!-- Parcel Information -->
        <div class="section">
          <div class="section-title">📋 Parcel Information</div>
          <div class="info-row">
            <span class="info-label">Parcel Type</span>
            <span class="info-value">${parcelType === 'document' ? 'Document' : 'Non-Document'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Parcel Name</span>
            <span class="info-value">${parcelName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Weight</span>
            <span class="info-value">${weight} KG</span>
          </div>
        </div>

        <!-- Sender Details -->
        <div class="section">
          <div class="section-title">👤 Sender Details</div>
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">${senderName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address</span>
            <span class="info-value">${senderAddress}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">${senderPhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">District</span>
            <span class="info-value">${senderDistrict}</span>
          </div>
          ${pickupInstruction ? `
            <div class="info-row">
              <span class="info-label">Pickup Instruction</span>
              <span class="info-value">${pickupInstruction}</span>
            </div>
          ` : ''}
        </div>

        <!-- Receiver Details -->
        <div class="section">
          <div class="section-title">📬 Receiver Details</div>
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-value">${receiverName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address</span>
            <span class="info-value">${receiverAddress}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone</span>
            <span class="info-value">${receiverPhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">District</span>
            <span class="info-value">${receiverDistrict}</span>
          </div>
          ${deliveryInstruction ? `
            <div class="info-row">
              <span class="info-label">Delivery Instruction</span>
              <span class="info-value">${deliveryInstruction}</span>
            </div>
          ` : ''}
        </div>

        <!-- Delivery Information -->
        <div class="section">
          <div class="section-title">🚚 Delivery Information</div>
          <div class="info-row">
            <span class="info-label">Delivery Type</span>
            <span class="info-value">${deliveryType === 'within-city' ? 'Within City' : 'Outside City/District'}</span>
          </div>
        </div>

        <!-- Pricing Breakdown -->
        <div class="section">
          <div class="section-title">💰 Pricing Breakdown</div>
          <table class="pricing-table">
            <tr class="pricing-row header">
              <td class="pricing-label">Description</td>
              <td class="pricing-value">Amount (৳)</td>
            </tr>
            <tr class="pricing-row">
              <td class="pricing-label">Base Delivery Charge</td>
              <td class="pricing-value">${basePrice}</td>
            </tr>
            ${extraCharges > 0 ? `
              <tr class="pricing-row">
                <td class="pricing-label">Extra Charges</td>
                <td class="pricing-value">${extraCharges}</td>
              </tr>
            ` : ''}
            <tr class="pricing-row total">
              <td class="pricing-label">Total Price</td>
              <td class="pricing-value total">৳${totalPrice}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">Thank you for choosing ProFast! 🙏</div>
          <p>Your parcel will be picked up between 4 PM – 7 PM</p>
          <p style="margin-top: 10px; color: #d1d5db;">For support, contact us at support@profast.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceipt = (data, format = 'pdf') => {
  const html = generateReceiptHTML(data);

  if (format === 'print') {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  } else if (format === 'pdf') {
    // Using print-to-PDF browser feature
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};