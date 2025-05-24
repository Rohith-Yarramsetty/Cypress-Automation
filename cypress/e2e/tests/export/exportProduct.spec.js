import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Assembly } from "../../pages/components/assembly";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Products } from "../../pages/products/products";
import { Export } from "../../pages/export";
import { UsersApi } from "../../api/userApi";
import { Headers } from "../../pages/headers";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const assembly = new Assembly();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const products = new Products();
const exports = new Export();
const userApi = new UsersApi();
const headers = new Headers();

let email, companyId, companyName, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  companyName = user.companyName;
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })

  // Set up baseline assembly
  nav.openComponentsTab();
  importFromFile.clickOnImportFromFile();
  importFromFile.uploadFile('newComponentsForAssembly.xlsx');
  importFromFile.clickOnContinue();
  importFromFile.verifyNoErrorsAfterValidation();
  importFromFile.clickOnContinue();
  importFromFile.verifyImportStatusSucceed(5);

  // Add child components to assembly
  tableHelper.clickOnCell(constData.componentTableHeaders.cpn, "910-00001");
  assembly.clickOnAssemblyTab();
  assembly.clickEditIconInTable();
  assembly.clickOnImportFromFile();
  assembly.checkUpdateFromExistingLibrary();
  assembly.uploadFile('createAssemblyFromComponents.xlsx');
  featureHelper.waitForLoadingIconToDisappear();
  importFromFile.clickOnContinue();

  // Verify import errors
  importFromFile.verifyNoErrorsAfterValidation();
  importFromFile.clickOnContinue();
  assembly.verifyNoOfComponentsInAssemblytable(3);
  components.clickSaveButtonInEditComponent();
  nav.openComponentsTab();
  tableHelper.assertTextInCell(constData.componentTableHeaders.name, '910-00001', 'EBOM Assembly Parent');

  // Create users for each role
  userApi.createUserForEachRole();
});

beforeEach(() => {
  authApi.signin(email);
  navHelper.navigateToSearch();
});

afterEach(() => {
  authApi.signOut();
});

after(() => {
  compSettings.deleteCompany(companyId, orgId);
});

describe("Export Multiple Products and Components Module", () => {
  it("should export components in the sorted order in exported file", () => {
    // Create Product
    nav.openProductTab();
    products.clickNewButton();
    products.checkCategoryItem("Electrical");
    products.enterProductName('test product');
    products.selectLifeCycleStatus(constData.status.production);
    products.enterEid('11-11-11');
    products.enterRevision('A')
    products.enterProductDescription('my test description');
    products.clickCreateButton();
    featureHelper.waitForLoadingIconToDisappear();
    products.enterDescriptionInProductEditPage('my test description');
    products.clickSaveButtonInEditProduct();

    // Add components in assembly using Import from file 
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.clickOnImportFromFile();
    assembly.uploadFile('createSimpleAssemblyForExportSorting.xlsx');
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the labels Mapped
    importFromFile.verifyNecessaryLabelsMapped('Quantity', 'quantity');
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.clickOnContinue();

    // Verify import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    products.clickSaveButtonInEditProduct();

    // Export the Product with child components and verify exported file
    products.clickExportIconInViewProduct();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-999-00001.A-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedExcelFileForProductToCheckSortedOrder(`cypress/downloads/${fileName}`, companyName);
    });
  });

  it("should export multiple components specifications to a local spreadsheet", () => {
    // Navigate to assembly type component
    components.navigateToComponentViewPage('EBOM Assembly Parent', false);
    components.clickExportIconInViewComponent();

    // Add components from export page
    exports.addComponentsFromExportPage("212-00001");
    tableHelper.assertTextInCell(constData.componentTableHeaders.cpn, "212-00001", "212-00001")
    exports.addComponentsFromExportPage("216-00001");
    tableHelper.assertTextInCell(constData.componentTableHeaders.cpn, "216-00001", "216-00001")
    exports.addComponentsFromExportPage("232-00001");
    tableHelper.assertTextInCell(constData.componentTableHeaders.cpn, "232-00001", "232-00001")
     
    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Export the components and verify exported file
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-Duro-Export-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', "Item Type", "Effectivity Start Date", "Effectivity End Date" ]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(['1', '0', '212-00001', 'Capacitor', '2.2uF, 10V, 10%, X7R', '', '1', 'DESIGN', 'This is a capacitor of value 2.2uf', '2.2uf', 'CAPACITANCE: 2.2uf, PACKAGE: 0402, VOLTAGE: 10v, TOLERANCE: 10%, TYPE: X7R, OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', '', 'EACH', '$0.02300', 'GRJ1023899JKL', 'Yageo', 'DKGRJ1023', 'Digikey', '', '0 DAYS', '', '', '', '', '', '', '', 'Yageo', 'GRJ1023899JKL', '', 'http://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRM155R71H103KA88-01.pdf', '', 'Digikey', 'DKGRJ1023', '', '', 'TAPE & REEL', '2000', '1', '$0.02300', '0 DAYS', '', '', ''])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(['2', '0', '216-00001', 'Crystal', '16MHz CRYSTAL_SMD', '', 'B', 'OBSOLETE', 'My crystal meth', '16MHz', 'FREQUENCY: 16MHz, STABILITY: , TOLERANCE: , CAPACITANCE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', '', 'EACH', '$1.23000', 'XT16F', 'JET', 'AXT16M', 'Arrow', '', '81 DAYS', '', '', '', '', '', '', '', 'JET', 'XT16F', '', 'http://www.abracon.com/Resonators/abls.pdf', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '81 DAYS', '', '', '']);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(['3', '0', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '', '5.62K', 'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', '', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '', '4 DAYS', '', '', '', '', '', '', '', 'Rohm', 'RJ103K122', '', 'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', '', 'Mouser', 'M103K', '', '', 'TRAY', '1000', '1000', '$0.34000', '4 DAYS', '', '', '']);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(['4', '0', '910-00001', 'EBOM', 'EBOM Assembly Parent', '', '1', 'DESIGN', 'This is an EBOM', '', '', '', 'EACH', '$1.23000', 'XT16M', 'JET', 'AXT16M', 'Arrow', '', '0 DAYS', '', '', '', '0', '', '', '', 'JET', 'XT16M', '', '', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '0 DAYS', '', '', '']);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[4]))).to.deep.eq(['5', '1', '212-00001', 'Capacitor', '2.2uF, 10V, 10%, X7R', '', '1', 'DESIGN', 'This is a capacitor of value 2.2uf', '2.2uf', 'CAPACITANCE: 2.2uf, PACKAGE: 0402, VOLTAGE: 10v, TOLERANCE: 10%, TYPE: X7R, OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', '1', 'EACH', '$0.02300', 'GRJ1023899JKL', 'Yageo', 'DKGRJ1023', 'Digikey', '$0.02300', '0 DAYS', 'C1', '1', '', '', '', '', '', 'Yageo', 'GRJ1023899JKL', '', 'http://search.murata.co.jp/Ceramy/image/img/A01X/G101/ENG/GRM155R71H103KA88-01.pdf', '', 'Digikey', 'DKGRJ1023', '', '', 'TAPE & REEL', '2000', '1', '$0.02300', '0 DAYS', '', '', '']);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[5]))).to.deep.eq(['6', '1', '216-00001', 'Crystal', '16MHz CRYSTAL_SMD', '', 'B', 'OBSOLETE', 'My crystal meth', '16MHz', 'FREQUENCY: 16MHz, STABILITY: , TOLERANCE: , CAPACITANCE: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', '2', 'EACH', '$1.23000', 'XT16F', 'JET', 'AXT16M', 'Arrow', '$2.46000', '81 DAYS', 'Y1,Y2', '3', '', '', '', '', '', 'JET', 'XT16F', '', 'http://www.abracon.com/Resonators/abls.pdf', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '81 DAYS', '', '', '']);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[6]))).to.deep.eq(['7', '1', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '', '5.62K', 'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', '3', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '$1.02000', '4 DAYS', 'R1, R2, R3', '2', '', '', '', '', '', 'Rohm', 'RJ103K122', '', 'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', '', 'Mouser', 'M103K', '', '', 'TRAY', '1000', '1000', '$0.34000', '4 DAYS', '', '', '']);
      })
    });
  });

  it("should export products and components from search route with shallow depth correctly", () => {
    // Create a product and add child
    nav.openProductTab();
    products.clickNewButton();
    products.checkCategoryItem("Firmware")
    products.enterProductName("prd-1");
    products.selectLifeCycleStatus(constData.status.prototype);
    products.enterRevision('1');
    products.clickCreateButton();

    const cmpData = {
      CPN       : '910-00001',
      Quantity  : 1,
    }
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(cmpData);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Click on mixed search and select the components from table and click on export
    headers.clickOnMixedSearchIcon();
    tableHelper.checkTableRow('212-00001');
    tableHelper.checkTableRow('216-00001');
    tableHelper.checkTableRow('232-00001');
    tableHelper.checkTableRow('232-00002');
    tableHelper.checkTableRow('910-00001');
    tableHelper.checkTableRow('999-00001');
    components.clickExportInCmpLibrary();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    // Verify the exported sheet
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-Duro-Export-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(['Item', 'Level', 'CPN', 'Category', 'Name', 'Where Used', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date' ]);
        expect(Object.keys(rows).length).to.deep.eq(6);
      })
    });
  });
});

describe("Export Products Module", () => {
  before(() => {
    authApi.signin(email);
    navHelper.navigateToSearch();

    // Navigate to product
    products.navigateToProductViewPage('test product', false)

    // Add components in assembly using Import from file 
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.clickOnImportFromFile();
    importFromFile.checkExistingComponentsForAssemblyImport();
    assembly.uploadFile('11c.create-assembly-from-components.xlsx');
    featureHelper.waitForLoadingIconToDisappear();
    importFromFile.clickOnContinue();

    // Verify import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    products.clickSaveButtonInEditProduct();
  })

  it("Should export a single product specifications with shallow depth to local spreadsheet", () => {
    // Navigate to product and click on export
    products.navigateToProductViewPage('test product', false);
    products.clickExportIconInViewProduct();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    // Download and verify the exported sheet
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-999-00001.A-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', "Item Type", "Effectivity Start Date", "Effectivity End Date" ]);

        expect(Object.keys(rows).length).to.deep.eq(3);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(['1', '0', '999-00001', '', 'test product', '11-11-11', 'A*', 'PRODUCTION', 'my test description', '', '', '', '', '$2.25000', '999-00001', `${companyName}`, '999-00001', `${companyName}`, '', '4 DAYS', '', '', '', '0', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(['2', '1', '232-00001', 'Resistor', '5.62K,1% Resistor', '', 'A', 'PRODUCTION', '', '5.62K', 'RESISTANCE: 5.62K, TOLERANCE: 1%, PACKAGE: 0402, POWER: , OPERATING TEMPERATURE MIN: , OPERATING TEMPERATURE MAX: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ', '3', 'EACH', '$0.34000', 'RJ103K122', 'Rohm', 'M103K', 'Mouser', '$1.02000', '4 DAYS', '', '2', '', '', '', '', '', 'Rohm', 'RJ103K122', '', 'http://www.yageo.com.tw/exep/pages/download/literatures/PYu-R_INT-thick_7.pdf', '', 'Mouser', 'M103K', '', '', 'TRAY', '1000', '1000', '$0.34000', '4 DAYS', '', '', '']);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(['3', '1', '910-00001', 'EBOM', 'EBOM Assembly Parent', '', '1', 'DESIGN', 'This is an EBOM', '', '', '1', 'EACH', '$1.23000', 'XT16M', 'JET', 'AXT16M', 'Arrow', '$1.23000', '0 DAYS', '', '1', '', '0', '', '', '', 'JET', 'XT16M', '', '', '', 'Arrow', 'AXT16M', '', '', 'BULK', '10', '10', '$1.23000', '0 DAYS', '', '', '']);
      });
    });
  });
});
