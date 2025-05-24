import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Components } from "../../pages/components/component";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder"
import { Products } from "../../pages/products/products";
import { Export } from "../../pages/export";
import { UsersApi } from "../../api/userApi";
import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const userApi = new UsersApi();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const assembly = new Assembly();
const importFromFile = new ImportFromFile();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const products = new Products();
const authApi = new AuthApi();
const exports = new Export();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId, companyName;

describe("Merlin Labs Custom Categories Tests", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    companyName = user.companyName;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateMerlinlabsSettings(companyId);
    })
  })
  
  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })
  
  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should verify the custom categories of Merlinlabs', () => {
    const categories = ['EBOM', 'MBOM', 'Packaging Assembly', 'Printed Circuit Board Assembly', 'Spare Kit', 'Sub Assembly', 'Test System', 'Tool Kit', 'Top Level Assembly', 'Document List',
        'Parts List', 'Software Assembly', 'Certification', 'Form', 'Instructions', 'Procedure', 'Product Literature', 'Quote', 'Schematic', 'Specification', 'Test Plan', 'Test Report',
        'Template', 'Request For Proposal(RFP)', 'Policy', 'Memo', 'Project Document', 'Firmware', 'Executable Object Code', 'SW Config Item Files(SCIF)', 'SW Loadable Part(SLP)', 'Test SOFTWARE']

    // Verify the categories present in Dropdown
    nav.openComponentsTab();
    components.clickonCreateManually();
    for(let i=0; i<categories.length; i++) {
      components.verifyCategoryPresentInDropdown(categories[i]);
    }
  })

  it('Should import components with each specific category', () =>{
    // Create Components through import
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('updatedMerlinCategories.xlsx');

    // Verify the labels mapped
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');

    // Verify no errors present
    importFromFile.clickOnContinue();
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();

    // Verify the import status succeed
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(32);
  })

  it('Should verify the status & category when added to CO with status prototype, production & obselete', () => {
    const cmpData1 = {
      name: fakerHelper.generateProductName(),
      category: 'Request For Proposal(RFP)',
      status: constData.status.prototype,
    }
    const cmpData2 = {
      name: fakerHelper.generateProductName(),
      category: 'Spare Kit',
      status: constData.status.production,
    }
    const cmpData3 = {
      name: fakerHelper.generateProductName(),
      category: 'Printed Circuit Board Assembly',
      status: constData.status.obsolete,
    }

    // Create a Component
    compApi.createComponent(cmpData1);

    // Add component to Change Order
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);

    // Create & Approve Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the Status & Category in view page
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData1.name);
    components.verifyStatusInViewComponent(cmpData1.status);
    components.verifyCategoryInViewComponent(cmpData1.category);

    // Create a Component
    compApi.createComponent(cmpData2);

    // Add component to Change Order
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);

    // Create & Approve Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the Status & Category in view page
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData2.name);
    components.verifyStatusInViewComponent(cmpData2.status);
    components.verifyCategoryInViewComponent(cmpData2.category);

    // Create a Component
    compApi.createComponent(cmpData3);

    // Add component to Change Order
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData3.name);

    // Create & Approve Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the Status & Category in view page
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData3.name);
    components.verifyStatusInViewComponent(cmpData3.status);
    components.verifyCategoryInViewComponent(cmpData3.category);
  })

  it('Verify the category of a component added as assembly to a product', () => {
    const cmpData = {
      name: fakerHelper.generateProductName(),
      category: 'Test System',
      status: constData.status.prototype,
    }
    let cpnValue;

    // Create a Component & get CPN
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(cmpData.name, 1).then((cpn) => {
      cpnValue = cpn
      const assemblyData = {
        CPN: cpnValue,
        Quantity: 1
      }

      // Create a Product
      nav.openProductTab();
      products.clickNewButton();
      products.enterProductName(fakerHelper.generateProductName());
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add component to Product Assembly
      products.clickEditIcon();
      assembly.clickOnAssemblyTab();
      assembly.addComponentsToAssemblyTable(assemblyData);
      products.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();
      assembly.clickOnAssemblyTab();

      // Verify the category & status of component
      tableHelper.assertRowPresentInTable(constData.productTableHeaders.cpn, cpnValue);
      tableHelper.clickOnCell(constData.productTableHeaders.cpn, cpnValue);
      components.verifyStatusInViewComponent(cmpData.status);
      components.verifyCategoryInViewComponent(cmpData.category);
    })
  })

  it('Should verify merlin labs doc types in export settings select document types', () => {
    const cmpData = {
      name: fakerHelper.generateProductName(),
      category: 'Capacitor',
      status: constData.status.design,
    }

    // Create a Component
    compApi.createComponent(cmpData);

    // Add component to Change Order
    nav.openComponentsTab();
    components.enterSearchTerm(cmpData.name);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);

    // Go to export setting and check include documents
    components.clickExportIconInViewComponent();
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();

    // Verify Merlin doc types
    exports.verifyDocTypesInExportSettings();
  })

  it.skip('Should export selected/checked doc types in export settings', () => {
    const ccEmail = fakerHelper.generateMailosaurEmail();
    const cmpData = {
      name: fakerHelper.generateProductName(),
      category: 'Capacitor',
      status: constData.status.design,
    }

    // Create a Component
    compApi.createComponent(cmpData);

    // Add component to Change Order
    nav.openComponentsTab();
    components.enterSearchTerm(cmpData.name);
    featureHelper.getCpnValueFromTable(cmpData.name, 1).then((cpn) => {
      const cpnValue = cpn
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickEditIcon();

      // Upload documents and select document types which are specific to the Merlin
      components.uploadAndSelectDocTypeInEditView('exportedZipFolderStructure.json', 'STEP');
      components.uploadAndSelectDocTypeInEditView('hundredCmpWithMpnsAndDatasheet.xlsx', 'SCHEMATIC');
      components.uploadAndSelectDocTypeInEditView('importComponentData2.xlsx', 'TEST REPORT');
      components.uploadAndSelectDocTypeInEditView('importComponentData03.xlsx', 'TEMPLATE');
      components.uploadAndSelectDocTypeInEditView('importComponentDataForOrbitFab.xlsx', 'REQUEST FOR PROPOSAL (RFP)');
      components.uploadAndSelectDocTypeInEditView('importHundredComponents.xlsx', 'POLICY');
      components.uploadAndSelectDocTypeInEditView('importTwoHundredComponents.xlsx', 'MEMO');
      components.uploadAndSelectDocTypeInEditView('updatedMerlinCategories.xlsx', 'PROJECT DOCUMENT');
      components.uploadAndSelectDocTypeInEditView('newCmpForAlreadyTakenEid.xlsx', 'FILE - SOURCE');
      components.uploadAndSelectDocTypeInEditView('sample_document.doc', 'FILE - REDLINE');
      components.uploadAndSelectDocTypeInEditView('table_index.json', 'FILE - VIEW ONLY');
      components.uploadAndSelectDocTypeInEditView('tenCmpWithMpnsAndDatasheet.xlsx', 'ACCEPTANCE DATA');
      components.uploadAndSelectDocTypeInEditView('6.baseline-assembly-component.xlsx', 'BUILD RECORD');
      components.uploadAndSelectDocTypeInEditView('customCmpFile.xlsx', 'CHECKLIST');
      components.uploadAndSelectDocTypeInEditView('createComponent.json', 'IMAGE');
      components.uploadAndSelectDocTypeInEditView('6a.new_component-bare_minimum.xlsx', 'DIAGRAM');
      components.uploadAndSelectDocTypeInEditView('descModifiedFile.xlsx', 'SOFTWARE');
      components.uploadAndSelectDocTypeInEditView('7a1.create-self-reference-component.xlsx', 'REQUIREMENTS');

      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to export setting and check include documents
      components.clickExportIconInViewComponent();
      exports.checkIncludeDocumentsCheckbox();
      exports.clickOnSelectDocumentTypesIcon();

      // Select Doc types which were added to the component
      exports.uncheckSelectDocumentTypesCheckBoxes();

      const docTypes = ['STEP', 'SCHEMATIC', 'TEST REPORT', 'TEMPLATE', 'REQUEST FOR PROPOSAL (RFP)', 'POLICY', 'MEMO', 'PROJECT DOCUMENT', 'FILE - SOURCE', 
                        'FILE - REDLINE', 'FILE - VIEW ONLY', 'ACCEPTANCE DATA', 'BUILD RECORD', 'CHECKLIST', 'IMAGE', 'DIAGRAM', 'SOFTWARE', 'REQUIREMENTS']

      for(let i=0; i<docTypes.length; i++){
        exports.checkSelectDocumentTypesCheckBoxes(docTypes[i]);
      }

      exports.clickOnSaveBtnInSelectDocumentModal();

      // Enter CC Email
      exports.enterCcEmail(ccEmail);
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported file (Documents should exist)
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, ccEmail);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: ${cpnValue}.1-${exportEmailDate}`);
        const download_file_link = email.html.links[2].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        let path = "cypress/downloads/";
        let file = fileName;
        cy.task('unzipping', { path, file })

        let folder = fileName.replace('.zip', '');
        let folderPath = `cypress/downloads/unzip/${folder}/${cpnValue}.1/Docs-${cpnValue}.1`;
        cy.task("convetFolderSrtuctureToJson", folderPath).then((res) => {
          cy.fixture('merlinDocTypes.json').then((jsonData) => {
            expect(JSON.stringify(res.children)).to.include(JSON.stringify(jsonData))
          })
        })
      })
    })
  })

  it.skip('Should not export unselected/unchecked doc types in export settings', () => {
    const ccEmail = fakerHelper.generateMailosaurEmail();
    const cmpData = {
      name: fakerHelper.generateProductName(),
      category: 'Capacitor',
      status: constData.status.design,
    }

    // Create & add component to Change Order
    nav.openComponentsTab();
    compApi.createComponent(cmpData);
    components.enterSearchTerm(cmpData.name);
    featureHelper.getCpnValueFromTable(cmpData.name, 1).then((cpn) => {
      const cpnValue = cpn
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickEditIcon();

      // Upload documents and select document types which are specific to the Merlin
      components.uploadAndSelectDocTypeInEditView('exportedZipFolderStructure.json', 'STEP');
      components.uploadAndSelectDocTypeInEditView('hundredCmpWithMpnsAndDatasheet.xlsx', 'SCHEMATIC');
      components.uploadAndSelectDocTypeInEditView('importComponentData2.xlsx', 'TEST REPORT');
      components.uploadAndSelectDocTypeInEditView('importComponentData03.xlsx', 'TEMPLATE');
      components.uploadAndSelectDocTypeInEditView('importComponentDataForOrbitFab.xlsx', 'REQUEST FOR PROPOSAL (RFP)');
      components.uploadAndSelectDocTypeInEditView('importHundredComponents.xlsx', 'POLICY');
      components.uploadAndSelectDocTypeInEditView('importTwoHundredComponents.xlsx', 'MEMO');
      components.uploadAndSelectDocTypeInEditView('updatedMerlinCategories.xlsx', 'PROJECT DOCUMENT');
      components.uploadAndSelectDocTypeInEditView('newCmpForAlreadyTakenEid.xlsx', 'FILE - SOURCE');
      components.uploadAndSelectDocTypeInEditView('sample_document.doc', 'FILE - REDLINE');
      components.uploadAndSelectDocTypeInEditView('table_index.json', 'FILE - VIEW ONLY');
      components.uploadAndSelectDocTypeInEditView('tenCmpWithMpnsAndDatasheet.xlsx', 'ACCEPTANCE DATA');
      components.uploadAndSelectDocTypeInEditView('6.baseline-assembly-component.xlsx', 'BUILD RECORD');
      components.uploadAndSelectDocTypeInEditView('customCmpFile.xlsx', 'CHECKLIST');
      components.uploadAndSelectDocTypeInEditView('createComponent.json', 'IMAGE');
      components.uploadAndSelectDocTypeInEditView('6a.new_component-bare_minimum.xlsx', 'DIAGRAM');
      components.uploadAndSelectDocTypeInEditView('descModifiedFile.xlsx', 'SOFTWARE');
      components.uploadAndSelectDocTypeInEditView('7a1.create-self-reference-component.xlsx', 'REQUIREMENTS');

      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to export setting and check include documents
      components.clickExportIconInViewComponent();
      exports.checkIncludeDocumentsCheckbox();
      exports.clickOnSelectDocumentTypesIcon();

      // Select Doc types which were not added to the component
      exports.uncheckSelectDocumentTypesCheckBoxes();

      const docTypes = ['ARTWORK', 'CAD', 'ASSEMBLY DRAWING', 'BOARD FILE', 'CERTIFICATION', 'DATASHEET', 'DRAWING', 
      'FORM', 'GERBER', 'INSTRUCTIONS', 'PROCEDURE', 'PRODUCT LITERATURE', 'QUOTE']

      for(let i=0; i<docTypes.length; i++){
        exports.checkSelectDocumentTypesCheckBoxes(docTypes[i]);
      }

      exports.clickOnSaveBtnInSelectDocumentModal();

      // Enter CC Email
      exports.enterCcEmail(ccEmail);
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported file (Documents folder should not exist)
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, ccEmail);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: ${cpnValue}.1-${exportEmailDate}`);
        const download_file_link = email.html.links[2].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        let path = "cypress/downloads/";
        let file = fileName;
        cy.task('unzipping', { path, file })

        let folder = fileName.replace('.zip', '');
        let folderPath = `cypress/downloads/unzip/${folder}/${cpnValue}.1/Docs-${cpnValue}.1`;
        cy.readFile(folderPath).should('not.exist');
      })
    })
  })
})
