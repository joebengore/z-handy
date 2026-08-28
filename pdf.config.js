module.exports = {
  stylesheet: ['pdf.css'],
  pdf_options: {
    format: 'Letter',
    margin: { top: '18mm', bottom: '20mm', left: '18mm', right: '18mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;padding:0 18mm;font-family:Georgia,serif;font-size:7.5pt;color:#6b7280;display:flex;justify-content:space-between;">
      <span>Z-Handyman LLC &middot; (813) 540-9095</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`,
  },
};
