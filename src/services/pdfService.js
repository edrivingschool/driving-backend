const PDFDocument = require('pdfkit');

class PdfService {
  static async generateReport(data, reportType) {
    return new Promise((resolve, reject) => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return reject(new Error("No data provided for the report."));
      }

      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fontSize(18).text(`${reportType.replace('-', ' ')} Report`, { align: 'center' });
      doc.moveDown(2);

      switch (reportType) {
        case 'teacher-assignments':
          this.generateTeacherAssignments(doc, data);
          break;

        case 'document-verification':
          this.generateDocumentVerification(doc, data);
          break;

        case 'payment-status':
          this.generatePaymentStatus(doc, data);
          break;

        default:
          this.generateDefaultTable(doc, data);
          break;
      }

      doc.end();
    });
  }

  static generateTeacherAssignments(doc, data) {
    data.forEach(teacher => {
      doc.fontSize(14).text(teacher.teacher_name, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor('black').text(`Total Students: ${teacher.total_students}`);
      doc.text(`Courses Assigned: ${teacher.courses_assigned}`);
      doc.moveDown(1);

      teacher.students.forEach(student => {
        doc.fillColor(student.enrollment_status === 'accepted' ? 'green' : 'red')
          .text(`• ${student.student_name} - ${student.course_title} (${student.enrollment_status})`);
      });

      doc.fillColor('black').moveDown(2);
    });
  }

  static generateDocumentVerification(doc, data) {
    data.forEach((record, index) => {
      doc.fontSize(12).fillColor('#333333').text(`Document ${index + 1}`, { underline: true });
      doc.moveDown(0.5);

      const colWidth = (doc.page.width - 100) / 2;
      const x = 50;
      const y = doc.y;

      doc.fillColor('black');
      doc.text(`User: ${record.first_name} ${record.last_name}`, x, y);
      doc.text(`Email: ${record.email}`, x, y + 20);
      doc.text(`Submission Date: ${new Date(record.created_at).toLocaleDateString()}`, x, y + 40);
      doc.text(`Status: ${record.status}`, x, y + 60);

      doc.text(`Verified By: ${record.verified_by || 'N/A'}`, x + colWidth, y);
      doc.text(`Verification Date: ${record.verified_at ? new Date(record.verified_at).toLocaleDateString() : 'N/A'}`, x + colWidth, y + 20);
      doc.text(`Remarks: ${record.remarks || 'None'}`, x + colWidth, y + 40, {
        width: colWidth,
        height: 40,
        ellipsis: true,
      });

      doc.moveDown(4).font('Helvetica-Bold').text('Document Links:', { underline: true });
      doc.font('Helvetica').text(`National ID: ${record.national_id_url}`, { indent: 10 });
      doc.text(`Educational Certificate: ${record.educational_certificate_url}`, { indent: 10 });
      doc.text(`Medical Report: ${record.medical_report_url}`, { indent: 10 });
      doc.text(`User Image: ${record.user_image_url}`, { indent: 10 });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown(2);

      if (doc.y > doc.page.height - 100) doc.addPage();
    });
  }

 static generatePaymentStatus(doc, data) {
  data.forEach((payment, index) => {
    const colWidth = (doc.page.width - 100) / 2;
    const x = 50;
    const yStart = doc.y;

    // Section header
    const status = payment.status ? payment.status.toUpperCase() : 'UNKNOWN';
    doc.fontSize(12).fillColor('#333333')
       .text(`Payment ${index + 1}`, { underline: true });
    
    doc.moveDown(0.5);

    // LEFT COLUMN
    const leftColumn = [
      `Payment ID: ${payment.id}`,
      `Amount: ${payment.currency ?? ''} ${payment.amount}`,
      `Payment Date: ${new Date(payment.paid_at).toLocaleDateString()}`,
      `Payment Proof: ${payment.payment_proof_url}`,
    ];

    // RIGHT COLUMN
    const rightColumn = [
      `Student: ${payment.first_name}`,
      `Course: ${payment.course_title}`,
      `Enrollment Status: ${payment.enrollment_status}`,
      `Verified: ${payment.verified ? 'Yes' : 'No'}`,
    ];

    // Draw columns in parallel
    let maxLines = Math.max(leftColumn.length, rightColumn.length);
    const lineHeight = 18;
    for (let i = 0; i < maxLines; i++) {
      if (leftColumn[i]) {
        doc.text(leftColumn[i], x, doc.y);
      }
      if (rightColumn[i]) {
        doc.text(rightColumn[i], x + colWidth, doc.y);
      }
      doc.moveDown();
    }

    doc.moveDown();
    doc.font('Helvetica-Bold').text('Transaction Details:', { underline: true });
    doc.font('Helvetica').text(`Reference: ${payment.transaction_id || 'N/A'}`, { indent: 10 });
    doc.text(`Payment Proof: ${payment.payment_proof_url ? 'Attached' : 'Not provided'}`, { indent: 10 });

    if (payment.notes) {
      doc.text(`Notes: ${payment.notes}`, {
        indent: 10,
        width: doc.page.width - 100,
        ellipsis: true
      });
    }

    // Colored square
    doc.moveDown();
    doc.fillColor(payment.verified ? '#4CAF50' : '#F44336')
       .rect(x, doc.y, 20, 20)
       .fill();
    doc.fillColor('black');

    doc.moveDown(2);

    // Divider line
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(2);

    // Page break check
    if (doc.y > doc.page.height - 100) doc.addPage();
  });
}


  static generateDefaultTable(doc, data) {
    const headers = Object.keys(data[0]);
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const columnWidth = usableWidth / headers.length;
    const rowHeight = 25;
    const padding = 5;
    let rowY = doc.y;

    // Header
    headers.forEach((header, i) => {
      const x = doc.page.margins.left + i * columnWidth;
      doc.rect(x, rowY, columnWidth, rowHeight).fillAndStroke('#f0f0f0', 'black');
      doc.fillColor('black').font('Helvetica-Bold').fontSize(10)
        .text(header.toUpperCase(), x + padding, rowY + padding, {
          width: columnWidth - 2 * padding,
          height: rowHeight,
          align: 'left',
        });
    });

    rowY += rowHeight;
    doc.font('Helvetica');

    data.forEach(row => {
      headers.forEach((header, i) => {
        const x = doc.page.margins.left + i * columnWidth;
        doc.rect(x, rowY, columnWidth, rowHeight).stroke();

        let cellContent = row[header];

        if (Array.isArray(cellContent)) {
          cellContent = cellContent.map(item =>
            typeof item === 'object'
              ? Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')
              : String(item)
          ).join('\n');
        } else if (typeof cellContent === 'object' && cellContent !== null) {
          cellContent = Object.entries(cellContent).map(([k, v]) => `${k}: ${v}`).join(', ');
        } else {
          cellContent = String(cellContent ?? '');
        }

        doc.fontSize(10).text(cellContent, x + padding, rowY + padding, {
          width: columnWidth - 2 * padding,
          height: rowHeight,
          align: 'left',
          lineBreak: false,
        });
      });

      rowY += rowHeight;

      if (rowY > doc.page.height - doc.page.margins.bottom - rowHeight) {
        doc.addPage();
        rowY = doc.y;
      }
    });
  }
}

module.exports = PdfService;
