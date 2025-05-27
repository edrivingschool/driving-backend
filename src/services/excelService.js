const ExcelJS = require('exceljs');

class ExcelService {
  static async generateReport(data, reportType) {
    if (!data || data.length === 0) throw new Error("No data provided");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');

    let columns;
    let rows;

    switch (reportType) {
      case 'user-registrations':
        ({ columns, rows } = this.generateUserRegistrations(data));
        break;

      case 'course-enrollments':
        ({ columns, rows } = this.generateCourseEnrollments(data));
        break;

      default:
        ({ columns, rows } = this.generateDefaultReport(data));
        break;
    }

    worksheet.columns = columns;
    rows.forEach(row => worksheet.addRow(row));

    this.applyHeaderStyle(worksheet);

    return workbook.xlsx.writeBuffer();
  }

  static generateUserRegistrations(data) {
    const columns = [
      { header: 'Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Registration Date', key: 'created_at' },
      { header: 'Verification Status', key: 'verification_status' },
      { header: 'Total Enrollments', key: 'total_enrollments' },
    ];

    const rows = data.map(row => ({
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      created_at: row.created_at,
      verification_status: row.verification_status,
      total_enrollments: row.total_enrollments,
    }));

    return { columns, rows };
  }

  static generateCourseEnrollments(data) {
    const columns = [
      { header: 'Course Title', key: 'course_title' },
      { header: 'Accepted', key: 'accepted' },
      { header: 'Pending', key: 'pending' },
      { header: 'Rejected', key: 'rejected' },
      { header: 'Paid Enrollments', key: 'paid_enrollments' },
    ];

    return { columns, rows: data };
  }

  static generateDefaultReport(data) {
    const keys = Object.keys(data[0]);
    const columns = keys.map(key => ({
      header: key.replace(/_/g, ' ').toUpperCase(),
      key,
    }));

    return { columns, rows: data };
  }

  static applyHeaderStyle(worksheet) {
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
    });
  }
}

module.exports = ExcelService;
