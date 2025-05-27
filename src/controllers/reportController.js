const ReportService = require('../services/reportServices');
const ExcelService = require('../services/excelService');
const PdfService = require('../services/pdfService');
const DocxService = require('../services/docxService');

exports.generateReport = async (req, res) => {
  try {
    const { format, reportType, filters } = req.body;
    
    // Get report data
    const data = await ReportService.generateReport(reportType, filters);
    console.log(`Generated data for report type: ${reportType}:\n${JSON.stringify(data, null, 2)}`);

     console.log(format, reportType, filters);
    // Generate file
    let fileBuffer;
    switch(format) {
       
      case 'excel':
        fileBuffer = await ExcelService.generateReport(data, reportType);

        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        break;
      case 'pdf':
        fileBuffer = await PdfService.generateReport(data, reportType);
        console.log('PDF generated successfully');
        res.set('Content-Type', 'application/pdf');
        break;
      case 'docx':
        fileBuffer = await DocxService.generateReport(data, reportType);
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        break;
      default:
        throw new Error('Unsupported format');
    }

    res.set('Content-Disposition', `attachment; filename=${reportType}_report.${format}`);
    res.send(fileBuffer);
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
};