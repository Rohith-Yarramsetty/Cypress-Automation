export default {
  variantTab: '.tabs-headings [name="variants"]',
  variantsAssemblyTable: '.variant-list td.indexes',
  cellSelector: '//*[text()="compData"]//ancestor::tr',
  columnSelector: '//*[text()="colName"]//ancestor::th',
  assertText: '#assemblyTable tr:nth-child(rowIndex) td:nth-child(colIndex) div',
  variantTableHeader: (header = 'cpn') => `.simple-table th[name="${header}"]`,
  assemblyTable: {
    tableHeader: '#assemblyTable tr:nth-child(1)',
    noOfVariants: '#assemblyTable tr:nth-child(1) th',
    variantCpn: (cpn) => `#specsTable [name="cpn-${cpn}"]`
  }
}
