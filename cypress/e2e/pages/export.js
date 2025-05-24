import selectors from "../selectors/export";
import constData from "../helpers/pageConstants";
import { FeatureHelpers } from "../helpers/featureHelper";

const featureHelper = new FeatureHelpers();

export class Export {
  checkFirstLevelCheckbox() {
    cy.get(selectors.firstLevelOnlyInExportSettings)
      .then(($ele) => {
        if ($ele.is(':checked')) {
          cy.wrap($ele).should('be.checked');
        } else {
          cy.wrap($ele).check().should('be.checked');
        }
      })
  }

  clickExportBtnInExportSettings() {
    cy.get(selectors.exportBtnInExportSettings)
      .click({force:true});
  }

  verifyMailSentModal() {
    cy.get(selectors.emailSentConfirmationModal)
      .should('exist').wait(2000);
    // cy.get(selectors.exportLoadingSpinner).should('not.exist');
  }

  checkAllLevelsIndentedRadioBtn() {
    cy.get(selectors.indentedRadioBtn).check({force: true});
  }

  downloadExportFileInExportEmail(download_file_link, fileName) {
    cy.downloadFile(download_file_link, 'cypress/downloads', fileName);
    cy.readFile(`cypress/downloads/${fileName}`).should("exist");
  }

  assertExportedDownloadedExcelFile(filePath) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity',
        'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN',
        'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)',
        'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor',
        'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', '0', '910-00001', 'EBOM', 'EBOM Assembly Parent', '', '1', 'DESIGN', 'This is an EBOM', '', '', '',
        'EACH', '$1.23000', 'XT16M', 'JET', 'AXT16M', 'Arrow', '', '0 DAYS', '', '', '', '0', '', '', '', 'JET', 'XT16M', '',
        '', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '0 DAYS', '', '', '' ]

      const row2 = [ '2', '1', '212-00001', 'Capacitor', '2.2uF, 10V, 10%, X7R', '', '1', 'DESIGN', 'This is a capacitor of value 2.2uf', '2.2uf',
        'CAPACITANCE: 2.2uf, PACKAGE: 0402, VOLTAGE: 10v, TOLERANCE: 10%, TYPE: X7R, OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '1', 'EACH', '$0.02300', 'GRJ1023899JKL', 'Yageo', 'DKGRJ1023', 'Digikey', '$0.02300', '0 DAYS', 'C1', '1', '', '', '', '', '', 'Yageo', 'GRJ1023899JKL',
        '', 'http://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRM155R71H103KA88-01.pdf', '', 'Digikey', 'DKGRJ1023', '', '', 'TAPE & REEL', '2000', '1',
        '$0.02300', '0 DAYS', '', '', '' ]

      const row3 = [ '3', '1', '216-00001', 'Crystal', '16MHz CRYSTAL_SMD', '', 'B', 'OBSOLETE', 'My crystal meth', '16MHz',
        'FREQUENCY: 16MHz, STABILITY: , TOLERANCE: , CAPACITANCE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '2', 'EACH', '$1.23000', 'XT16F', 'JET', 'AXT16M', 'Arrow', '$2.46000', '81 DAYS', 'Y1, Y2', '3', '', '', '', '', '', 'JET', 'XT16F', '', 'http://www.abracon.com/Resonators/abls.pdf',
        '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '81 DAYS', '', '', '' ]

      const row4 = [ '4', '1', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '',
        '5.62K', 'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '3', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '$1.02000', '4 DAYS', 'R1, R2, R3', '2', '', '', '', '', '', 'Rohm', 'RJ103K122', '',
        'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', '', 'Mouser', 'M103K', '', '', 'TRAY', '1000', '1000', '$0.34000', '4 DAYS', '', '', '' ]

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(row2);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(row3);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(row4);
    })
  }

  uncheckSourcingCheckboxes() {
    cy.get(selectors.sourcingCheckBoxes)
      .uncheck({force: true})
  }

  checkSourcingCheckBox(text = "") {
    cy.xpath(selectors.includeManufacturersCheckBox.replace('Include Manufacturers', text))
      .check({force: true})
  }

  assertFileShouldContainManufacturersAndDistributorsHeadingsOnly(filePath) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ["Item", "Level", "CPN", "Category", "Name", "EID", "Revision", "Status", "Description", "Value", 
        "Specs", "Quantity", "Unit of Measure", "Primary Source Unit Price", "Primary Source MPN", "Primary Source Manufacturer",
        "Primary Source DPN", "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Ref Des", "Item Number", 
        "Notes", "Mass (g)", "Last Updated", "Workflow State", "Procurement", "Manufacturer", "MPN", "MPN Link", "Datasheet", 
        "Mfr Description", "Distributor", "DPN", "DPN Link", "Dist Description", "Package", "Package Quantity", 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', '0', '910-00001', 'EBOM', 'EBOM Assembly Parent', '', '1', 'DESIGN', 'This is an EBOM', '', 
        '', '', 'EACH', '$1.23000', 'XT16M', 'JET', 'AXT16M', 'Arrow', '', '0 DAYS', '', '', '', '0', '', '', '', 'JET', 
        'XT16M', '', '', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '', '', '' ]

      const row2 = [ '2', '1', '212-00001', 'Capacitor', '2.2uF, 10V, 10%, X7R', '', '1', 'DESIGN', 'This is a capacitor of value 2.2uf', 
        '2.2uf', 'CAPACITANCE: 2.2uf, PACKAGE: 0402, VOLTAGE: 10v, TOLERANCE: 10%, TYPE: X7R, OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '$0.02300', 'GRJ1023899JKL', 'Yageo', 'DKGRJ1023', 'Digikey', '$0.02300', '0 DAYS', 'C1', '1', '', '', '', '', '', 'Yageo', 'GRJ1023899JKL', '', 'http://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRM155R71H103KA88-01.pdf',
        '', 'Digikey', 'DKGRJ1023', '', '', 'TAPE & REEL', '2000', '', '', '' ]

      const row3 = [ '3', '1', '216-00001', 'Crystal', '16MHz CRYSTAL_SMD', '', 'B', 'OBSOLETE', 'My crystal meth', '16MHz', 'FREQUENCY: 16MHz, STABILITY: , TOLERANCE: , CAPACITANCE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '2', 'EACH', '$1.23000', 'XT16F', 'JET', 'AXT16M', 'Arrow', '$2.46000', '81 DAYS', 'Y1,Y2', '3', '', '', '', '', '', 'JET', 'XT16F', '', 'http://www.abracon.com/Resonators/abls.pdf', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '', '', '' ]

        const row4 = [ '4', '1', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '', '5.62K', 'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '3', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '$1.02000', '4 DAYS', 'R1, R2, R3', '2', '', '', '', '', '', 'Rohm', 'RJ103K122', '', 'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', '', 'Mouser', 'M103K', '', '', 'TRAY', '1000', '', '', '' ]

     expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
     expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
     expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(row2);
     expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(row3);
     expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(row4);
    })
  }

  uncheckSourcingCheckboxes() {
    cy.get(selectors.sourcingCheckBoxes)
      .uncheck({force: true});
  }

  checkSourcingCheckBox(text = "") {
    cy.xpath(selectors.includeManufacturersCheckBox.replace('Include Manufacturers', text))
      .then(($ele) => {
        if ($ele.is(':checked')) {
          cy.wrap($ele).should('be.checked');
        } else {
          cy.wrap($ele).check({force: true}).should('be.checked');
        }
      })
  }

  checkIncludeDocumentsCheckbox() {
    cy.get(selectors.includeDocuments)
      .scrollIntoView()
      .check({force: true})
      .should('be.checked');
  }

  assertExportedDownloadedFileWhenManufacturersAndPrimarySourcesChecked(fileName) {
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {

      const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity',
        'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN',
        'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 
        'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date' ]

      const row1 = [ '1', '0', '910-00001', 'EBOM', 'EBOM Assembly Parent', '', '1', 'DESIGN', 'This is an EBOM', '', '', '',
        'EACH', '$1.23000', 'XT16M', 'JET', 'AXT16M', 'Arrow', '', '0 DAYS', '', '', '', '0', '', '', '', 'JET', 'XT16M', '',
        '', '', '', '', '' ]

      const row2 = [ '2', '1', '212-00001', 'Capacitor', '2.2uF, 10V, 10%, X7R', '', '1', 'DESIGN', 'This is a capacitor of value 2.2uf', '2.2uf',
        'CAPACITANCE: 2.2uf, PACKAGE: 0402, VOLTAGE: 10v, TOLERANCE: 10%, TYPE: X7R, OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '1', 'EACH', '$0.02300', 'GRJ1023899JKL', 'Yageo', 'DKGRJ1023', 'Digikey', '$0.02300', '0 DAYS', 'C1', '1', '', '', '', '', '', 'Yageo', 'GRJ1023899JKL',
        '', 'http://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRM155R71H103KA88-01.pdf', '', '', '', '' ]


      const row3 = [ '3', '1', '216-00001', 'Crystal', '16MHz CRYSTAL_SMD', '', 'B', 'OBSOLETE', 'My crystal meth', '16MHz',
       'FREQUENCY: 16MHz, STABILITY: , TOLERANCE: , CAPACITANCE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '2', 'EACH', '$1.23000', 'XT16F', 'JET', 'AXT16M', 'Arrow', '$2.46000', '81 DAYS', 'Y1, Y2', '3', '', '', '', '', '', 'JET', 'XT16F', '', 'http://www.abracon.com/Resonators/abls.pdf',
         '', '', '', '' ]

      const row4 = [ '4', '1', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '',
       '5.62K', 'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '3', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '$1.02000', '4 DAYS', 'R1, R2, R3', '2', '', '', '', '', '', 'Rohm', 'RJ103K122', '',
         'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', '', '', '', '' ]

        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(row2);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(row3);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(row4);
    })
  }

  clickOnCustomizeFieldsIcon() {
    cy.get(selectors.customizeFieldsIcon)
      .click({force: true})
  }

  uncheckCustomizeFieldsCheckBoxes() {
    cy.get(selectors.checkAllCheckBoxes)
      .uncheck()
      .should('not.be.checked')
  }

  checkCustomizeFieldsCheckBoxes(label = "") {
    cy.get(selectors.levelFieldCheckBx.replace('Level', label))
      .check()
      .should('be.checked')
  }

  clickOnSaveBtnInCustomizeFieldsModal() {
    cy.xpath(selectors.saveBtnInCustomizeFieldsModal)
      .click()
      .should('not.exist')
  }

  clickOnSelectDocumentTypesIcon() {
    cy.get(selectors.selectDocumentTypesIcon)
      .click({force: true})
  }

  uncheckSelectDocumentTypesCheckBoxes() {
    cy.get(selectors.checkAllCheckBoxes)
      .uncheck()
      .should('not.be.checked')
  }

  checkSelectDocumentTypesCheckBoxes(documentType = "") {
    cy.get(selectors.genericFieldCheckbx.replace('GENERIC', documentType))
      .check()
      .should('be.checked')
  }

  clickOnSaveBtnInSelectDocumentModal() {
    cy.xpath(selectors.saveBtnInSelectDocument)
      .click()
      .should('not.exist')
  }

  enterCcEmail(email) {
    cy.get(selectors.ccEmail)
      .scrollIntoView()
      .clear({force: true})
      .type(email, {force: true})
  }

  clickOnSaveTemplateIcon() {
    cy.get(selectors.saveTemplateIcon)
      .click({force: true});
    this.verifySaveOrUpdateTemplateModal();
  }

  enterTemplateNameInSaveAsNewTemplate(templateName) {
    cy.get(selectors.TemplateNameInSaveAsNewTemplate)
      .clear()
      .type(templateName)
  }

  clickOnSaveBtnInSaveOrUpdateTemplateModal() {
    cy.get(selectors.saveBtnInSaveOrUpdateTemplateModal)
      .click()
    cy.get(selectors.saveBtnInSaveOrUpdateTemplateModal)
      .should('not.exist')
  }

  clickOnDropdownIndicator() {
    cy.get(selectors.dropdownIndicator)
      .click({force: true})
  }

  clickOnDefaultSettings() {
    cy.xpath(selectors.defaultSettings)
      .click({force: true});
  }

  verifyCountOfCheckBxsCheckedInCustomizedField(count) {
    cy.get(selectors.customizeFieldsCheckBoxes.replace('type="checkbox"', 'checked'))
      .its('length')
      .should('eq', count)
  }

  verifyCountOfCheckBxsCheckedInSelectDocumentTypes(count) {
    cy.get(selectors.selectDocumentTypesCheckBoxes.replace('type="checkbox"', 'checked'))
      .its('length')
      .should('eq', count)
  }

  clickOnCancelInCustomizeFieldModal() {
    cy.xpath(selectors.cancelBtn)
      .click({force: true})
      .should('not.exist')
  }

  clickOnCancelInSelectDocumentTypeModal() {
    cy.xpath(selectors.cancelBtn)
      .click({force: true})
      .should('not.exist')
  }

  selectTemplateFromDropdown(templateName, category = constData.changeOrderTemplateType.private) {
    cy.xpath(selectors.templateDropdown.replace('templateName', templateName).replace('category', category))
      .click({force: true})
  }

  verifyTextInCcEmail(text = "") {
    cy.get(selectors.ccEmail)
      .scrollIntoView()
      .should('have.text', text)
  }

  checkDownloadInExportType() {
    cy.get(selectors.downloadRadioBtn)
      .check({force: true})
  }

  checkAccessibleToAll() {
    cy.get(selectors.accessibleToAllCheckBx)
      .check()
      .should('be.checked')
  }

  verifyTemplatePresentInDropdown(templateName, category = 'PRIVATE') {
    cy.xpath(selectors.templateDropdown.replace('templateName', templateName).replace('category', category))
      .should('have.text', templateName)
      .should('exist')
  }

  verifyTemplateNotPresentInDropdown(templateName, category = 'PRIVATE') {
    cy.xpath(selectors.templateDropdown.replace('templateName', templateName).replace('category', category))
      .should('not.exist')
  }

  assertExportedDownloadedFileBasedOnErpType(fileName, cpn, erpType, startDate, endDate) {
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {

      const headers = ['Item', 'CPN', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', cpn, erpType, startDate, endDate]

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
    })
  }

  assertResendCoExportedDownloadedExcelFile(filePath, cmpName, cmpCpnValue) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {
      const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Specs', 'Quantity',
        'Ref Des', 'Item Number', 'Notes', 'Mass g', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date', 'Last Updated',
        'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor',
        'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time',]

      const row1 = [ '1', '0', `${cmpCpnValue}`, 'Capacitor', `${cmpName}`, '', '2', 'PROTOTYPE', '', 
        'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '', '','', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
    })
  }

  clickOnDropdownIndicatorInSaveOrUpdateModal() {
    cy.xpath(selectors.dropdownIndicatorInSaveOrUpdateModal)
      .click();
  }

  verifyLabelNotPresentCustomizedFields(label = "") {
    cy.get(selectors.levelFieldCheckBx.replace('Level', label))
      .should('not.exist')
  }

  assertExportedDownloadedFileForOxideSpecs(fileName, cmpName, cmpCpnValue) {
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {

      const headers = ['Item','Level','CPN','Category', 'Name','EID','Revision','Status','Description','Value','Specs','Quantity',
      'Unit of Measure','Primary Source Unit Price','Total Price','Primary Source Lead Time'
      ,'Ref Des','Item Number','Notes','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 
      'MPN','MPN Link','Datasheet','Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
      'Unit Price','Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', '0', `${cmpCpnValue}`, 'Resistor', `${cmpName}`, '', '1', 'DESIGN', 'Desc related to Comp', '',
      'RESISTANCE: 10, TOLERANCE: 10, PACKAGE: 0201, POWER: 10, FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: , MOUNT STYLE: SMT, TECHNOLOGY: Thin Film, TEMPERATURE COEFFICIENT: 10, VOLTAGE RATING: 10', 
      '', 'EACH','', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','','','','', '', '', '' ]

      for(let i=0; i<row1.length; i++) {
        expect(headers[i]).to.deep.eq(Object.keys(rows[0])[i])
        expect(row1[i]).to.deep.eq(Object.values(rows[0])[i].toString())
      }
    })
  }

  verifySaveOrUpdateTemplateModal() {
    cy.get(selectors.saveOrUpdateTemplateModal)
      .should('have.text', ' Save or Update Template')
  }

  assertExportedDownloadedFileForOrbitFabSpecs(fileName, cmpName, cmpCpnValue) {
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {

      const headers = ['Item','Level','CPN','Category', 'Name','EID','Revision','Status','Description','Value','Specs','Quantity',
      'Unit of Measure','Primary Source Unit Price','Total Price','Primary Source Lead Time'
      ,'Ref Des','Item Number','Notes','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 
      'MPN','MPN Link','Datasheet','Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
      'Unit Price','Lead Time','Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', '0', `${cmpCpnValue}`, 'Adhesive', `${cmpName}`, '', '', 'DESIGN', '', '', 'TYPE: , THICKNESS: , COLOR: , USAGE: , MATERIAL: , FINISH: , APPLICABILITY: Flight', 
      '', 'EACH','', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','','','','', '', '', '' ]

      for(let i=0; i<row1.length; i++) {
        expect(headers[i]).to.deep.eq(Object.keys(rows[0])[i])
        expect(row1[i]).to.deep.eq(Object.values(rows[0])[i].toString())
      }
    })
  }

  verifyLengthofExportTable(length) {
    cy.get(selectors.exportTable)
      .find("tbody >tr")
      .then((row) => {
        expect(row.length-1).to.be.equal(length);  // Removing Table Header (th)
      })
  }

  verifyCcEmailTooltipPresent(text = '') {
    cy.get(selectors.ccEmail)
      .should('have.attr', 'class', 'invalid')
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyCcEmailTooltipNotPresent(text = '') {
    cy.get(selectors.ccEmail)
      .should('not.have.attr', 'class', 'invalid')
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyExportBtnEnabled() {
    cy.get(selectors.exportBtnInExportSettings)
      .should('not.have.class', 'disabled')
  }

  verifyExportBtnDisabled() {
    cy.get(selectors.exportBtnInExportSettings)
      .should('have.class', 'disabled')
  }

  assertExportedDownloadedExcelFileForProductToCheckSortedOrder(filePath, companyName) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN',
        'Primary Source Manufacturer', 'Primary Source DPN', 'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 
        'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', 'Item Type', 'Effectivity Start Date', 
        'Effectivity End Date']

      const row1 = ['1', '0', '999-00001', '', 'test product', '11-11-11', 'A*', 'PRODUCTION', 'my test description', '', '', '', '', '$0.00000', '999-00001', `${companyName}`, '999-00001', `${companyName}`, '', '0 DAYS', '', '', 
        '', '0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row2 = ['2', '1', '211-00001', 'Battery', 'RETAINER COIN CELL 24MM SMD', '', '', 'DESIGN', '', '', 'CHEMISTRY: , VOLTAGE: , CAPACITY: , PEAK CURRENT: , SIZE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row3 = ['3', '1', '212-00002', 'Capacitor', 'CAP CER 1.0UF 16V 10% X5R 0603', '', '', 'DESIGN', '', '', 'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row4 = ['4', '1', '212-00003', 'Capacitor', 'CAP CER 10000PF 16V 10% X7R 0402', '', '', 'DESIGN', '', '', 'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row5 = ['5', '1', '212-00004', 'Capacitor', 'CAP CER .1UF 10V 10% X5R 0402', '', '', 'DESIGN', '', '', 'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row6 = [ '6', '1', '212-00005', 'Capacitor', 'CAP CER 1000PF 50V 10% X7R 0402', '', '', 'DESIGN', '', '', 'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row7 = ['7', '1', '212-00006', 'Capacitor', 'CAP CER 18PF 50V 5% C0G 0402', '', '', 'DESIGN', '', '', 'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row8 = ['8', '1', '212-00007', 'Capacitor', 'CAP ELECT 220UF 4V KS RADIAL', '', '', 'DESIGN', '', '', 'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '3', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row9 = ['9', '1', '215-00001', 'Connector', 'CONN HEADER 10POS DUAL .05", Keying Shroud, SMD', '', '', 'DESIGN', '', '', 'CONDUCTORS: , PITCH: , CONTACT TYPE: , MOUNT: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row10 = [ '10', '1', '215-00002', 'Connector', 'CONN HEADER SH 4POS TOP 1MM TIN', '', '', 'DESIGN', '', '', 'CONDUCTORS: , PITCH: , CONTACT TYPE: , MOUNT: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row11 = ['11', '1', '218-00001', 'Filter', 'FILTER CHIP 1000 OHM 250MA 0402', '', '', 'DESIGN', '', '', 'FREQUENCY: , BANDWIDTH: , TYPE: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row12 = ['12', '1', '221-00001', 'IC', 'IC SRL FLASH MEM 4M (2048 pages x 256 bytes) 2.3V 8-SOIC', '', '', 'DESIGN', '', '', 'TYPE: , PINS: , PACKAGE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row13 = ['13', '1', '224-00001', 'LED', 'LED CHIPLED 570NM GREEN 0603 SMD', '', '', 'DESIGN', '', '', 'TYPE: , COLOR: , CURRENT: , FORWARD VOLTAGE: , PACKAGE: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row14 = ['14', '1', '224-00002', 'LED', 'LED MULTI TOPLED RED/YELL 4-PLCC', '', '', 'DESIGN', '', '', 'TYPE: , COLOR: , CURRENT: , FORWARD VOLTAGE: , PACKAGE: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row15 = ['15', '1', '232-00003', 'Resistor', 'RES 820 OHM 1/16W 5% 0402 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row16 = ['16', '1', '232-00004', 'Resistor', 'RES 240 OHM 1/16W 5% 0402 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row17 = ['17', '1', '232-00005', 'Resistor', 'RES 1.00K OHM 1/16W 1% 0402 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row18 = ['18', '1', '232-00006', 'Resistor', 'RES 10.0K OHM 1/16W 1% 0402 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '3', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row19 = ['19', '1', '232-00007', 'Resistor', 'RES 5.90K OHM 1/16W 1% 0402 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row20 = ['20', '1', '232-00008', 'Resistor', 'RES 0.0 OHM 1/10W 5% 0603 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row21 = ['21', '1', '232-00009', 'Resistor', 'RES 1.0M OHM 1/16W 5% 0402 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row22 = ['22', '1', '232-00010', 'Resistor', 'RES 100 OHM 1/16W 1% 0402 SMD', '', '', 'DESIGN', '', '', 'RESISTANCE: , TOLERANCE: , PACKAGE: , POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row23 = ['23', '1', '233-00001', 'RF', 'MODULE ZIGBEE EM357 W/CHIP ANT', '', '', 'DESIGN', '', '', 'TYPE: , PACKAGE: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(row2);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(row3);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(row4);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[4]))).to.deep.eq(row5);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[5]))).to.deep.eq(row6);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[6]))).to.deep.eq(row7);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[7]))).to.deep.eq(row8);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[8]))).to.deep.eq(row9);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[9]))).to.deep.eq(row10);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[10]))).to.deep.eq(row11);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[11]))).to.deep.eq(row12);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[12]))).to.deep.eq(row13);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[13]))).to.deep.eq(row14);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[14]))).to.deep.eq(row15);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[15]))).to.deep.eq(row16);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[16]))).to.deep.eq(row17);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[17]))).to.deep.eq(row18);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[18]))).to.deep.eq(row19);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[19]))).to.deep.eq(row20);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[20]))).to.deep.eq(row21);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[21]))).to.deep.eq(row22);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[22]))).to.deep.eq(row23);
    })
  }

  verifyDocTypesInExportSettings() {
    const merlinDocTypes = ['ARTWORK', 'ASSEMBLY DRAWING', 'BOARD FILE', 'CAD', 'CERTIFICATION', 'DATASHEET', 'DRAWING', 'FORM', 'GERBER', 'INSTRUCTIONS', 
    'PROCEDURE', 'PRODUCT LITERATURE', 'QUOTE', 'STEP', 'SCHEMATIC', 'SPECIFICATION', 'TEST PLAN', 'TEST REPORT', 'TEMPLATE', 'REQUEST FOR PROPOSAL (RFP)', 
    'POLICY', 'MEMO', 'PROJECT DOCUMENT', 'FILE - SOURCE', 'FILE - REDLINE', 'FILE - VIEW ONLY', 'ACCEPTANCE DATA', 'BUILD RECORD', 'CHECKLIST', 'IMAGE', 
    'DIAGRAM', 'SOFTWARE', 'REQUIREMENTS', 'GENERIC']
    for(let i=0; i<merlinDocTypes.length; i++){
      cy.get(selectors.docType.replace('docType', merlinDocTypes[i]))
        .scrollIntoView()
        .should('be.visible')
    }
  }

  assertExportedDownloadedFileForCanaSpecs(fileName, cmpName, cmpCpnValue) {
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" })
      .then((rows) => {

        const headers = ['Item','Level','CPN','Category', 'Name','EID','Revision','Status','Description','Value','Specs','Quantity',
        'Unit of Measure','Primary Source Unit Price','Total Price','Primary Source Lead Time'
        ,'Ref Des','Item Number','Notes','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 
        'MPN','MPN Link','Datasheet','Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
        'Unit Price','Lead Time']

        const row1 = [ '1', '0', `${cmpCpnValue}`, 'Fluid Tank', `${cmpName}`, '', '1', 'DESIGN', '', '',
        '', '', 'mg/L','', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','','','','' ]

        for(let i=0; i<row1.length; i++) {
          expect(headers[i]).to.deep.eq(Object.keys(rows[0])[i])
          expect(row1[i]).to.deep.eq(Object.values(rows[0])[i].toString())
        }
      })
    }

  assertExportedDownloadedFileForForm(fileName, cmpName, cmpCpnValue, companyName) {
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {

      const headers = ['Item','Level','CPN','Category', 'Name','EID','Revision','Status','Description','Value','Specs','Quantity',
      'Unit of Measure','Primary Source Unit Price','Primary Source MPN','Primary Source Manufacturer', 'Primary Source DPN','Primary Source Distributor','Total Price','Primary Source Lead Time',
      'Ref Des','Item Number','Notes','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 
      'MPN','MPN Link','Datasheet','Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
      'Unit Price','Lead Time','Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', '0', `${cmpCpnValue}`, 'Battery', `${cmpName}`, '', 'A', 'DESIGN', '', '', 'CHEMISTRY: , VOLTAGE: , CAPACITY: , PEAK CURRENT: , SIZE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
                     '', 'EACH','$0.00000', '835-00001', `${companyName}`, '835-00001', `${companyName}`, '', '0 DAYS', '', '', '', '0', '', '', '', '', '', '', '', '', '','','','','', '', '', '' ]

      for(let i=0; i<row1.length; i++) {
        expect(headers[i]).to.deep.eq(Object.keys(rows[0])[i])
        expect(row1[i]).to.deep.eq(Object.values(rows[0])[i].toString())
      }
    })
  }

  checkAllLevelsFlattenedRadioBtn() {
    cy.get(selectors.flattenedRadioBtn).check({force: true});
  }

  assertExportedDownloadedFileForWhereUsed(filePath, exportedData) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item','CPN','Category','Name','Where Used','EID','Revision','Status','Description','Value','Specs','Quantity',
      'Unit of Measure','Primary Source Unit Price', 'Total Price','Primary Source Lead Time','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 
      'MPN','MPN Link','Datasheet','Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
      'Unit Price','Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', `${exportedData.cmpCpn}`, 'Capacitor', `${exportedData.cmpName}`,`${exportedData.parentCpn}`, '', '', 'DESIGN', '', '',
      'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
      '', 'EACH','', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','','','','', '', '', '', '' ]

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
    })
  }

  assertExportedDownloadedFileForWhereUsedForGrandParentExport(filePath, exportedData) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item','CPN','Category','Name','Where Used','EID','Revision','Status','Description','Value','Specs','Quantity',
      'Unit of Measure','Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 'Primary Source Distributor', 
      'Total Price','Primary Source Lead Time','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 'MPN','MPN Link','Datasheet',
      'Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
      'Unit Price','Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', `${exportedData.grandParentCpn}`, 'EBOM', `${exportedData.grandParentCmpName}`, '', '', '', 'DESIGN', '', '', '', '', 'EACH', '$0.00000', `${exportedData.grandParentCpn}`, `${exportedData.companyName}`, 
      `${exportedData.grandParentCpn}`, `${exportedData.companyName}`, '', '0 DAYS', '0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ]

      const row2 = [ '2', `${exportedData.childCmpCpn}`, 'Capacitor', `${exportedData.childCmpName}`, `${exportedData.parent1Cpn}, ${exportedData.parent2Cpn}`, '', '', 'DESIGN', '', '', 
      'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
      '2', 'EACH', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row3 = [ '3', `${exportedData.parent1Cpn}`, 'EBOM', `${exportedData.parent1CmpName}`, `${exportedData.grandParentCpn}`, '', '', 'DESIGN', '', '', '', '1', 'EACH', '$0.00000', `${exportedData.parent1Cpn}`, `${exportedData.companyName}`, 
      `${exportedData.parent1Cpn}`, `${exportedData.companyName}`, '$0.00000', '0 DAYS', '0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row4 = [ '4', `${exportedData.parent2Cpn}`, 'EBOM', `${exportedData.parent2CmpName}`, `${exportedData.grandParentCpn}`, '', '', 'DESIGN', '', '', '', '1', 'EACH', '$0.00000', `${exportedData.parent2Cpn}`, `${exportedData.companyName}`, 
      `${exportedData.parent2Cpn}`, `${exportedData.companyName}`, '$0.00000', '0 DAYS', '0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    })
  }

  unCheckSpecificCustomizeFieldsCheckBoxes(label = "") {
    cy.get(selectors.levelFieldCheckBx.replace('Level', label))
      .uncheck()
      .should('not.be.checked')
  }

  assertExportedDownloadedExcelFileForProdRevisionExport(filePath, companyName) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 
        'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 
        'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 
        'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 
        'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = ['1', '0', '999-00001', '', 'prd-1', '', '1', 'DESIGN', '', '', '', '', '', '$1.23000', '999-00001', `${companyName}`, '999-00001', 
        `${companyName}`, '', '0 DAYS', '', '', '', '0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      const row2 = ['2', '1', '910-00001', 'EBOM', 'EBOM Assembly Parent', '', '1', 'DESIGN', 'This is an EBOM', '', '', '1', 'EACH', '$1.23000', 'XT16M', 'JET', 
        'AXT16M', 'Arrow', '$1.23000', '0 DAYS', '', '', '', '', '', '', '', 'JET', 'XT16M', '', '', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '0 DAYS', '', '', '']

      const row3 = ['3', '2', '212-00001', 'Capacitor', '2.2uF, 10V, 10%, X7R', '', '1', 'DESIGN', 'This is a capacitor of value 2.2uf', '2.2uf', 
        'CAPACITANCE: 2.2uf, PACKAGE: 0402, VOLTAGE: 10v, TOLERANCE: 10%, TYPE: X7R, OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ',
        '1', 'EACH', '$0.02300', 'GRJ1023899JKL', 'Yageo', 'DKGRJ1023', 'Digikey', '$0.02300', '0 DAYS', 'C1', '1', '', '', '', '', '', 'Yageo', 'GRJ1023899JKL', '', 
        'http://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRM155R71H103KA88-01.pdf', '', 'Digikey', 'DKGRJ1023', '', '', 'TAPE & REEL', '2000', '1', '$0.02300', '0 DAYS', '', '', '']

      const row4 = ['4', '2', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '', '5.62K', 
        'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '3', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '$1.02000', '4 DAYS', 'R1, R2, R3', '2', '', '', '', '', '', 'Rohm', 'RJ103K122', '', 
        'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', '', 'Mouser', 'M103K', '', '', 'TRAY', '1000', '1000', '$0.34000', '4 DAYS', '', '', '']

      const row5 = [ '5', '2', '216-00001', 'Crystal', '16MHz CRYSTAL_SMD', '', 'B', 'OBSOLETE', 'My crystal meth', '16MHz', 
        'FREQUENCY: 16MHz, STABILITY: , TOLERANCE: , CAPACITANCE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '2', 'EACH', '$1.23000', 'XT16F', 'JET', 'AXT16M', 'Arrow', '$2.46000', '81 DAYS', 'Y1,Y2', '3', '', '', '', '', '', 'JET', 'XT16F', '', 'http://www.abracon.com/Resonators/abls.pdf', 
        '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '81 DAYS', '', '', '']

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(row2);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(row3);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(row4);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[4]))).to.deep.eq(row5);
    })
  }

  assertExportedDownloadedExcelFileForCmpRevisionExport(filePath) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 
        'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 
        'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 
        'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 
        'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', '0', '910-00001', 'EBOM', 'EBOM Assembly Parent', '', '1', 'DESIGN', 'This is an EBOM', '', '', '', 'EACH', '$1.23000', 'XT16M', 'JET', 
        'AXT16M', 'Arrow', '', '0 DAYS', '', '', '', '', '', '', '', 'JET', 'XT16M', '', '', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '0 DAYS', '', '', '' ]

      const row2 = ['2', '1', '212-00001', 'Capacitor', '2.2uF, 10V, 10%, X7R', '', '1', 'DESIGN', 'This is a capacitor of value 2.2uf', '2.2uf', 
        'CAPACITANCE: 2.2uf, PACKAGE: 0402, VOLTAGE: 10v, TOLERANCE: 10%, TYPE: X7R, OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '1', 'EACH', '$0.02300', 'GRJ1023899JKL', 'Yageo', 'DKGRJ1023', 'Digikey', '$0.02300', '0 DAYS', 'C1', '1', '', '', '', '', '', 'Yageo', 
        'GRJ1023899JKL', '', 'http://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRM155R71H103KA88-01.pdf', '', 'Digikey', 'DKGRJ1023', '', '', 'TAPE & REEL', '2000', '1', '$0.02300', '0 DAYS', '', '', '' ]

      const row3 = ['3', '1', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '', '5.62K', 'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '3', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '$1.02000', '4 DAYS', 'R1, R2, R3', '2', '', '', '', '', '', 'Rohm', 'RJ103K122', '', 'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', 
        '', 'Mouser', 'M103K', '', '', 'TRAY', '1000', '1000', '$0.34000', '4 DAYS', '', '', '' ]

      const row4 = ['4', '1', '216-00001', 'Crystal', '16MHz CRYSTAL_SMD', '', 'B', 'OBSOLETE', 'My crystal meth', '16MHz', 'FREQUENCY: 16MHz, STABILITY: , TOLERANCE: , CAPACITANCE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
        '2', 'EACH', '$1.23000', 'XT16F', 'JET', 'AXT16M', 'Arrow', '$2.46000', '81 DAYS', 'Y1,Y2', '3', '', '', '', '', '', 'JET', 'XT16F', '', 'http://www.abracon.com/Resonators/abls.pdf', 
        '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '81 DAYS', '', '', '' ]

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(row2);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(row3);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(row4);
    })
  }

  assertExportedDownloadedFileWithOutWhereUsed(filePath, exportedData) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item','CPN','Category','Name','EID','Revision','Status','Description','Value','Specs','Quantity',
      'Unit of Measure','Primary Source Unit Price', 'Total Price','Primary Source Lead Time','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 
      'MPN','MPN Link','Datasheet','Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
      'Unit Price','Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1', `${exportedData.cmpCpn}`, 'Capacitor', `${exportedData.cmpName}`, '', '', 'DESIGN', '', '',
      'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
      '', 'EACH','', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','','','','', '', '', '', '' ]
    })
  }

  assertExportedDownloadedExcelFileForEcadGeneralSpecs(filePath) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 
        'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 
        'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 
        'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 
        'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = ['1', '0', '211-00001', 'Battery', 'ECAD Component 1', '', '', 'DESIGN', '', '', 
        `CHEMISTRY: , VOLTAGE: , CAPACITY: , PEAK CURRENT: , SIZE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: 25C, FOOTPRINT PATH: "C://My Documents/data/footprint/my footprints/’, PACKAGE LABEL: 'package dummy label', SYMBOL PATH: C://My Documents/data/symbol/my symbol, SYMBOL LABEL: dummy symbol label`,
        '','EACH','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','']

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
    })
  }

  assertExportedDownloadedFileWhenExportFromLibrary(filePath, exportedData) {
    cy.task('readXlsx', { file: filePath, sheet: "export" }).then((rows) => {

      const headers = ['Item','Level','CPN','Category','Name','Where Used','EID','Revision','Status','Description','Value','Specs','Quantity',
      'Unit of Measure','Primary Source Unit Price','Total Price','Primary Source Lead Time','Ref Des','Item Number','Notes','Mass (g)','Last Updated','Workflow State','Procurement','Manufacturer', 
      'MPN','MPN Link','Datasheet','Mfr Description','Distributor','DPN','DPN Link','Dist Description','Package','Package Quantity','Quantity Min',
      'Unit Price','Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']

      const row1 = [ '1','0', `${exportedData.cmpCpn}`, 'Capacitor', `${exportedData.cmpName}`,`${exportedData.parentCpn}`, '', '', 'DESIGN', '', '',
      'CAPACITANCE: , PACKAGE: , VOLTAGE: , TOLERANCE: , TYPE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', 
      '', 'EACH','', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']

      expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
    })
  }


  verifyWhereUsedFieldPresent() {
    cy.get(selectors.levelFieldCheckBx.replace('Level', 'Where Used'))
      .should('exist')
  }

  checkComponentCheckboxInAddComponents(name) {
    cy.xpath(selectors.componentCheckboxInAddComponents.replace("name", name))
      .check({force: true})
  }

  clickAddBtnInExportPage() {
    cy.get(selectors.addBtnInExportPage)
      .click()
  }

  addComponentsFromExportPage(cmpName) {
    this.checkComponentCheckboxInAddComponents(cmpName);
    this.clickAddBtnInExportPage();
  }
}
