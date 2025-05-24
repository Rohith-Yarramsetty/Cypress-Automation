import { ImportFromFile } from "../../pages/components/importFromFile";
import selectors from "../../selectors/components/assembly";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import constData from "../../helpers/pageConstants";
import { Utils } from "../../helpers/utils";


const importFromFile = new ImportFromFile();
const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();

export class Assembly {
  clickOnAssemblyTab() {
    cy.get(selectors.assemblyOptn)
      .click({force:true});
  }

  clickEditIconInTable() {
    cy.get(selectors.editIconInTable)
      .scrollIntoView()
      .click();
    featureHelpers.waitForLoadingIconToDisappear();
  }

  clickAddIconInAssemblyTable() {
    cy.get(selectors.addIconInTable)
      .click({force:true});
  }

  clickAddFromLibrary() {
    cy.xpath(selectors.addFromLibraryOptn, {timeout: 30000})
      .scrollIntoView()
      .click({force:true});
  }

  enterDetailsInAssemblyTable(colName, data, cpnValue) {
    cy.wait(3000);
    cy.xpath(selectors.assemblyTableInputFiled.replace('cpn', cpnValue).replace('quantity', colName))
      .scrollIntoView()
      .dblclick()
      .clear({force:true})
      .type(data, {delay: 0})
      .should('have.value', data)
      .should('not.have.attr', 'class', 'invalid');
  }

  waitForAssemblyErrorReport() {
    cy.get(selectors.assemblyErrorReport, { timeout: 300000 }).should('exist')
  }

  waitForAssemblyErrorReportToClear() {
    cy.get(selectors.assemblyErrorReport, { timeout: 300000 }).should('not.exist')
  }

  setColumnValue(rowNum, columnName, value) {
    const row = rowNum + 1
    const timeout = 300000
    const selector = selectors.tableCellSelector.replace('#rowNum', row).replace('#columnName', columnName)
    if (value === '') {
      return cy.get(selector, { timeout })
        .scrollIntoView({ timeout })
        .dblclick({ timeout })
        .clear({ timeout })
        .should('have.value', value)
    }
    cy.get(selector, { timeout: 300000 })
      .scrollIntoView({ timeout })
      .dblclick({ timeout })
      .clear({ timeout })
      .type(value, { timeout })
      .should('have.value', value);
  }

  clickColumn(rowNum, columnName, tout) {
    const row = rowNum + 1
    const selector = selectors.tableCellSelector.replace('#rowNum', row).replace('#columnName', columnName)
    const timeout = tout || 300000
    cy.get(selector, { timeout })
      .scrollIntoView({ timeout })
      .dblclick({ timeout })
  }

  setQuantityValue(rowNum, value) {
    this.setColumnValue(rowNum, "quantity", value);
  }

  clickQuantityCell(rowNum) {
    this.clickColumn(rowNum, "quantity");
  }
  
  setRefDesValue(rowNum, value) {
    this.setColumnValue(rowNum, "refDes", value);
  }

  clickRefDesCell(rowNum) {
    this.clickColumn(rowNum, "refDes");
  }

  setItemNumberValue(rowNum, value) {
    this.setColumnValue(rowNum, "itemNumber", value);
  }

  clickItemNumberCell(rowNum) {
    this.clickColumn(rowNum, "itemNumber");
  }
  
  setNotesValue(rowNum, value) {
    this.setColumnValue(rowNum, "notes", value);
  }

  clickNotesCell(rowNum) {
    this.clickColumn(rowNum, "notes");
  }

  removeRow (rowNum) {
    const selector = selectors.deleteBtnSelector.replace('#rowNum', rowNum + 1);
    cy.get(selector).click()
  }

  verifyAddCmpOptionsModalInAssemblyTable() {
    cy.get(selectors.addCmpOptionsModalInAssemblyTable)
      .scrollIntoView()
      .should('be.visible')
  }

  addComponentsToAssemblyTable(data) {
    this.clickAddIconInAssemblyTable();
    this.verifyAddCmpOptionsModalInAssemblyTable();
    this.clickAddFromLibrary();
    this.checkComponentCheckboxInAddComponents(data.CPN);
    this.clickAddInAddComponents();
    this.closeTheAddComponents();
    if(data.RefDes != undefined){
      this.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.refDes, data.RefDes, data.CPN);
    }
    if(data.ItemNumber != undefined){
      this.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.itemNumber, data.ItemNumber, data.CPN);
    }
    if(data.Quantity != undefined){
      this.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, data.Quantity, data.CPN);
    }
  }

  checkComponentCheckboxInAddComponents(name) {
    featureHelpers.checkCheckbox(selectors.componentCheckboxInAddComponents.replace("CPN", name))
  }

  clickAddInAddComponents() {
    cy.get(selectors.addBtnInAddComponents)
      .scrollIntoView()
      .click();
  }

  closeTheAddComponents() {
    cy.get(selectors.closeIconInAddComponents)
      .scrollIntoView()
      .click();
  }

  verifyStatusInAssemblyTable(searchRowByText, assertText, tableCellSelector = selectors.statusValueInAssemblyTable) { 
    cy.xpath(tableCellSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('text')
      .should('be.eq', assertText.toString())
  }

  clickOnImportFromFile() {
    cy.get(selectors.importFromFileIcon)
      .click()
  }

  uploadFile(fileName) {
    featureHelpers.uploadFile(selectors.fileUpload, fileName)
  }

  checkUpdateFromExistingLibrary() {
    cy.get(selectors.updateFromExistingLibrary)
      .check()
      .should('be.checked')
  }

  verifyColumnPresentInAssemblyTable(columnName) {
    cy.get(selectors.tableHeader.replace('cpn', columnName))
      .should('exist')
  }

  verifyColumnNotPresentInAssemblyTable(columnName) {
    cy.get(selectors.tableHeader.replace('cpn', columnName))
      .should('not.exist')
  }

  verifyQuantityInAssemblyTable(cpnValue = "", Quantity = "") {
    cy.xpath(selectors.quantityInAssemblyTable.replace('CPN', cpnValue).replace('Quantity', Quantity))
      .scrollIntoView()
      .should('exist')
  }

  verifyRefDesInAssemblyTable(cpnValue = "", RefDes = "") {
    cy.xpath(selectors.refDesInAssemblyTable.replace('CPN', cpnValue).replace('RefDes', RefDes))
      .scrollIntoView()
      .should('exist')
  }

  clickonCreateManually(){
    cy.xpath(selectors.createManually)
      .click()
  }

  checkAddAnotherCheckBx() {
    cy.xpath(selectors.addAnotherCheckBx)
      .check()
      .should('be.checked')
  }

  uncheckAddAnotherCheckBx() {
    cy.xpath(selectors.addAnotherCheckBx)
      .uncheck()
      .should('not.be.checked')
  }

  verifySuccessNotificationAppear() {
    cy.get(selectors.successNotificationToast)
      .should('be.visible')
  }

  closeCreateManually() {
    cy.xpath(selectors.closeOptnInCreateManually)
      .click();
  }

  clickOnAddFromVendor() {
    cy.xpath(selectors.addFromVendoroptn)
      .click();
  }

  verifyErrorCountInAssemblyTab(errorCount) {
    cy.xpath(selectors.errorCountInAssemblyTab.replace("errorCount",errorCount))
      .should('have.text', errorCount)
  }

  verifyNoErrorInAssemblyTab() {
    cy.get(selectors.assemblyOptn)
      .should('not.have.class', 'error-text')
  }

  verifyAssemblyChildCount(childCount) {
    cy.xpath(selectors.assemblyChildCount)
      .find('tr')
      .should('have.length', childCount+1)
  }

  cancelCreateManually() {
    cy.get(selectors.cancelBtnInCreateManuallyPage)
      .click();
  }

  checkComponentFromLibraryThroughIndex(index = 1) {
    cy.get(selectors.componentCheckboxWithIndex(index))
      .check()
  }

  clickOnAssemblyChildCmp(cmpName) {
    cy.xpath(selectors.assemblyChildCmp.replace('name', cmpName))
      .click()
  }

  addAssemblyComponentsFromFile(fileName, uploadType = 'New') {
    let labelMap1 = 'CPN', labelMap2 = 'cpn'
    this.clickOnAssemblyTab();
    this.clickOnImportFromFile();
    if(uploadType == 'Existing') this.checkUpdateFromExistingLibrary();
    else labelMap1 = 'Name', labelMap2 = 'name'
    this.uploadFile(fileName);
    importFromFile.verifyNecessaryLabelsMapped(labelMap1, labelMap2);
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
  }

  getCpnValueFromAssemblyLibrary(index = 1) {
    return cy.get(selectors.assemblyLibraryCpn).eq(index-1).invoke('text')
  }

  clickOnAddFromFile() {
    cy.get(selectors.addFromFileIcon).click();
  }

  verifyNoOfComponentsInAssemblytable(noOfComponents) {
    cy.get(selectors.assemblyCmpsCount).should('have.text', `${noOfComponents} Components`);
  }

  verifyErrorInAssemblyTable(cmpName, colName, errorMsg) {
    cy.wait(3000);
    cy.xpath(selectors.assemblyTableInputFiled.replace('cpn', cmpName).replace('quantity', colName))
      .scrollIntoView()
      .should('have.attr', 'data-tip', errorMsg);
  }

  clickOnGridView() {
    cy.get(selectors.gridViewIcon)
      .click({force:true})
  }

  clickOnTreeView() {
    cy.get(selectors.treeViewIcon)
      .click({force:true})
  }

  verifyDataInAssemblyTable(searchRowByText, colName, value) {
    cy.xpath(selectors.tableCellInAssemblyTable.replace('name', searchRowByText).replace('quantity', colName))
      .should('have.text', value)
  }

  verifyDataInAssemblyTableFromEditPage(searchRowByText, colName, value) {
    cy.xpath(selectors.assemblyTableInputFiled.replace('cpn', searchRowByText).replace('quantity', colName))
      .should('have.attr', 'value', value)
  }

  verifyNoOfRowsPresentInAssemblyTable(rowLength) {
    cy.wait(6000);
    cy.get(selectors.assemblyTable).find("tr").then((row) => {
      expect((row.length)-1).to.be.equal(rowLength)
    });
  }

  clickExpandIconInAssemblyTable(dblclick=false) {
    dblclick ? cy.get(selectors.expandIcon).dblclick({force:true}) : cy.get(selectors.expandIcon).click({force:true})
  }

  clickCollapseIconInAssemblyTable() {
    cy.get(selectors.collapseIcon)
      .click()
  }

  verifyTreeViewVisible() {
    cy.get(selectors.treeViewTable).should('be.visible')
  }

  verifyGridViewVisible() {
    cy.get(selectors.gridViewTable).should('be.visible')
  }

  clickExpand() {
    cy.xpath(selectors.expandOptn)
      .scrollIntoView()
      .should('not.be.disabled')
      .click();
  }

  verifyVariantIconPresentInAssemblyTable(cmpName) {
    cy.xpath(selectors.variantIcon.replace('cmpName', cmpName))
      .should('exist')
  }

  verifyRolledUpModifiedIconIsPresent() {
    cy.get(selectors.rolledUpModifiedIcon)
      .should('exist')
  }

  verifyRolledUpModifiedIconIsNotPresent() {
    cy.get(selectors.rolledUpModifiedIcon)
      .should('not.exist')
  }

  clickOnExpandTriangleIcon(cmpName) {
    cy.xpath(selectors.expandTriangleIcon.replace('cmpName', cmpName))
      .click({force:true})
  }

  clickOnExpandTriangleIconInCompareRevisionPage(cmpName) {
    cy.xpath(selectors.expandTriangleIconInCompareRevisionPage.replace('cmpName', cmpName))
      .click({force:true})
  }

  chooseCategory(value = "(213) Charger") {
    cy.get(selectors.chooseCategory).first()
      .select(value)
  }
}
