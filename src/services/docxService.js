const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType
} = require('docx');

class DocxService {
  static async generateReport(data, reportType) {
    if (!data || data.length === 0) throw new Error("No data provided");

    const sections = [];

    // Title section
    sections.push({
      children: [
        new Paragraph({
          text: `${reportType.replace('-', ' ').toUpperCase()} REPORT`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      ],
    });

    // Add sections based on report type
    switch (reportType) {
      case 'teacher-assignments':
        sections.push(...this.generateDefaultTableDocx(data));
        break;
      case 'document-verification':
        sections.push(...this.generateDocumentVerificationDocx(data));
        break;
      case 'payment-status':
        sections.push(...this.generatePaymentStatusDocx(data));
        break;
      default:
        sections.push(...this.generateDefaultTableDocx(data));
        break;
    }

    const doc = new Document({
      creator: "Driving Backend",
      title: `${reportType.replace('-', ' ').toUpperCase()} Report`,
      description: "Auto-generated report",
      sections,
    });

    return Packer.toBuffer(doc);
  }

  static generateDefaultTableDocx(data) {
    const headers = Object.keys(data[0]);

    const rows = data.map(item => new TableRow({
      children: headers.map(header => {
        let content = item[header];

        if (Array.isArray(content)) {
          content = content.map(i =>
            typeof i === 'object'
              ? Object.entries(i).map(([k, v]) => `${k}: ${v}`).join(', ')
              : String(i)
          ).join(', ');
        } else if (typeof content === 'object' && content !== null) {
          content = Object.entries(content).map(([k, v]) => `${k}: ${v}`).join(', ');
        }

        return new TableCell({
          children: [new Paragraph(String(content || ''))],
        });
      }),
    }));

    return [
      {
        children: [
          new Table({
            columnWidths: headers.map(() => 2000),
            rows: [
              new TableRow({
                children: headers.map(header =>
                  new TableCell({
                    children: [new Paragraph({
                      text: header.toUpperCase(),
                      bold: true,
                    })],
                  })
                ),
              }),
              ...rows,
            ],
          }),
        ],
      }
    ];
  }

  static generateDocumentVerificationDocx(data) {
    return data.map((record, index) => ({
      children: [
        new Paragraph({
          children: [new TextRun({
            text: `Document ${index + 1}`,
            underline: true,
            bold: true,
          })],
        }),
        new Table({
          columnWidths: [2500, 2500],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph(`User: ${record.first_name} ${record.last_name}`),
                    new Paragraph(`Email: ${record.email}`),
                    new Paragraph(`Submission Date: ${new Date(record.created_at).toLocaleDateString()}`),
                    new Paragraph(`Status: ${record.status}`),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph(`Verified By: ${record.verified_by || 'N/A'}`),
                    new Paragraph(`Verification Date: ${record.verified_at ? new Date(record.verified_at).toLocaleDateString() : 'N/A'}`),
                    new Paragraph(`Remarks: ${record.remarks || 'None'}`),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({
          children: [new TextRun({
            text: 'Document Links:',
            bold: true,
            underline: true,
          })],
        }),
        new Paragraph(`National ID: ${record.national_id_url}`),
        new Paragraph(`Educational Certificate: ${record.educational_certificate_url}`),
        new Paragraph(`Medical Report: ${record.medical_report_url}`),
        new Paragraph(`User Image: ${record.user_image_url}`),
        new Paragraph(' '),
      ]
    }));
  }

  static generatePaymentStatusDocx(data) {
    return data.map((payment, index) => {
      const statusColor = payment.verified ? '00FF00' : 'FF0000';

      return {
        children: [
          new Paragraph({
            children: [new TextRun({
              text: `Payment ${index + 1}`,
              underline: true,
              bold: true,
            })],
          }),
          new Table({
            columnWidths: [2500, 2500],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph(`Payment ID: ${payment.id}`),
                      new Paragraph(`Amount: ${payment.currency || ''} ${payment.amount}`),
                      new Paragraph(`Payment Date: ${new Date(payment.paid_at).toLocaleDateString()}`),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(`Student: ${payment.first_name}`),
                      new Paragraph(`Course: ${payment.course_title}`),
                      new Paragraph(`Enrollment Status: ${payment.enrollment_status}`),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Status: ', bold: true }),
              new TextRun({
                text: payment.verified ? 'VERIFIED' : 'UNVERIFIED',
                color: statusColor,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({
              text: 'Transaction Details:',
              underline: true,
              bold: true,
            })],
          }),
          new Paragraph(`Reference: ${payment.transaction_id || 'N/A'}`),
          new Paragraph(`Payment Proof: ${payment.payment_proof_url ? 'Attached' : 'Not provided'}`),
          payment.notes ? new Paragraph(`Notes: ${payment.notes}`) : new Paragraph(''),
          new Paragraph(' '),
        ],
      };
    });
  }
}

module.exports = DocxService;
