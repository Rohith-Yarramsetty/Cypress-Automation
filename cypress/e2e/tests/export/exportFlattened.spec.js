import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { Export } from "../../pages/export";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { Products } from "../../pages/products/products";
import { Assembly } from "../../pages/components/assembly";
import { Sourcing } from "../../pages/components/sourcing";

const signin = new SignIn();
const nav = new Navigation();
const exports = new Export();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const components = new Components();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const products = new Products();
const assembly = new Assembly();
const sourcing = new Sourcing();

let email, companyId, orgId, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  companyName = user.companyName;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })

  // Create components with tree structure
  components.createComponentsWithTreeStructure();

  // Create a product and add cmp3 & cmp4 as childs
  nav.openProductTab();
  products.clickNewButton();
  products.enterProductName("prd-with-flattened");
  products.selectLifeCycleStatus(constData.status.production);
  products.enterRevision('A');
  products.clickCreateButton();

  const cmp3Data = {
    CPN       : '910-00003',
    Quantity  : 1,
  }
  const cmp4Data = {
    CPN       : '910-00004',
    Quantity  : 1,
  }
  assembly.clickOnAssemblyTab();
  assembly.addComponentsToAssemblyTable(cmp3Data);
  assembly.addComponentsToAssemblyTable(cmp4Data);
  products.clickSaveButtonInEditProduct();
  featureHelper.waitForLoadingIconToDisappear();
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Export With Flattened Module", { tags: ["Export", "Export_Flattened"] }, () => {
  beforeEach(() => {
    // Navgate to product and click on export icon
    products.navigateToProductViewPage("prd-with-flattened", false);
    products.clickExportIconInViewProduct();
  })

  it("should export a single product specifications with manufacturers and distributors and quotes headings only using flattened depth", () => {
    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Select Flattened type and required sources
    exports.checkAllLevelsFlattenedRadioBtn();
    exports.uncheckSourcingCheckboxes();
    exports.checkSourcingCheckBox('Include Primary Sources');
    exports.checkSourcingCheckBox('Include Manufacturers');
    exports.checkSourcingCheckBox('Include Distributors');

    // Click export button and verify the exported file
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
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(["Item", "CPN", "Category", "Name", "EID", "Revision", "Status", "Description", "Value", "Specs", "Quantity", "Unit of Measure", "Primary Source Unit Price", "Primary Source MPN", "Primary Source Manufacturer", "Primary Source DPN", "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Mass (g)", "Last Updated", "Workflow State", "Procurement", "Manufacturer", "MPN", "MPN Link", "Datasheet", "Mfr Description", "Distributor", "DPN", "DPN Link", "Dist Description", "Package", "Package Quantity", "Item Type", "Effectivity Start Date", "Effectivity End Date"]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1", "999-00001", "", "prd-with-flattened", "", "A", "PRODUCTION", "", "", "", "", "", "$0.00000", "999-00001", `${companyName}`, "999-00001", `${companyName}`, "", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(["2", "910-00001", "EBOM", "cmp-1", "", "A", "DESIGN", "", "", "", "30", "EACH", "$0.00000", "910-00001", `${companyName}`, "910-00001", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(["3", "910-00002", "EBOM", "cmp-2", "", "1", "PROTOTYPE", "", "", "", "15", "EACH", "$0.00000", "910-00002", `${companyName}`, "910-00002", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(["4", "910-00003", "EBOM", "cmp-3", "", "A", "PRODUCTION", "", "", "", "5", "EACH", "$0.00000", "910-00003", `${companyName}`, "910-00003", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[4]))).to.deep.eq(["5", "910-00004", "EBOM", "cmp-4", "", "A", "OBSOLETE", "", "", "", "1", "EACH", "$0.00000", "910-00004", `${companyName}`, "910-00004", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    });
  })

  it("Should export multiple components/products specifications to a local spreadsheet using flattened depth", () => {
    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Add component 4 to the export list
    exports.addComponentsFromExportPage('cmp-4');
    tableHelper.assertTextInCell(constData.componentTableHeaders.name, '910-00004', 'cmp-4');

    // Select flattened type and export and verify the exported file
    exports.checkAllLevelsFlattenedRadioBtn();
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
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq([ "Item", "CPN", "Category", "Name", "EID", "Revision", "Status", "Description", "Value", "Specs", "Quantity", "Unit of Measure", "Primary Source Unit Price", "Primary Source MPN", "Primary Source Manufacturer", "Primary Source DPN", "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Mass (g)", "Last Updated", "Workflow State", "Procurement", "Manufacturer", "MPN", "MPN Link", "Datasheet", "Mfr Description", "Distributor", "DPN", "DPN Link", "Dist Description", "Package", "Package Quantity", "Quantity Min", "Unit Price", "Lead Time", "Item Type", "Effectivity Start Date", "Effectivity End Date" ]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ "1", "910-00004", "EBOM", "cmp-4", "", "A", "OBSOLETE", "", "", "", "", "EACH", "$0.00000", "910-00004", `${companyName}`, "910-00004", `${companyName}`, "", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq([ "2", "910-00001", "EBOM", "cmp-1", "", "A", "DESIGN", "", "", "", "24", "EACH", "$0.00000", "910-00001", `${companyName}`, "910-00001", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq([ "3", "910-00002", "EBOM", "cmp-2", "", "1", "PROTOTYPE", "", "", "", "12", "EACH", "$0.00000", "910-00002", `${companyName}`, "910-00002", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq([ "4", "910-00003", "EBOM", "cmp-3", "", "A", "PRODUCTION", "", "", "", "4", "EACH", "$0.00000", "910-00003", `${companyName}`, "910-00003", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[4]))).to.deep.eq([ "1", "999-00001", "", "prd-with-flattened", "", "A", "PRODUCTION", "", "", "", "", "", "$0.00000", "999-00001", `${companyName}`, "999-00001", `${companyName}`, "", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[5]))).to.deep.eq([ "2", "910-00001", "EBOM", "cmp-1", "", "A", "DESIGN", "", "", "", "30", "EACH", "$0.00000", "910-00001", `${companyName}`, "910-00001", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[6]))).to.deep.eq([ "3", "910-00002", "EBOM", "cmp-2", "", "1", "PROTOTYPE", "", "", "", "15", "EACH", "$0.00000", "910-00002", `${companyName}`, "910-00002", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[7]))).to.deep.eq([ "4", "910-00003", "EBOM", "cmp-3", "", "A", "PRODUCTION", "", "", "", "5", "EACH", "$0.00000", "910-00003", `${companyName}`, "910-00003", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[8]))).to.deep.eq([ "5", "910-00004", "EBOM", "cmp-4", "", "A", "OBSOLETE", "", "", "", "1", "EACH", "$0.00000", "910-00004", `${companyName}`, "910-00004", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    });
  })
})

describe("Export With Flattened Module with zero qty", () => {
  beforeEach(() => {
    products.navigateToProductViewPage('prd-with-flattened', false);
  });

  it("should export flattened depth correctly with parent having qty value zero", () => {
    // Go to edit tab and change the quantity value and save
    products.clickEditIcon();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 0, 'cmp-3');
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Click on export icon
    products.clickExportIconInViewProduct();

    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Select Flattened type and required sources
    exports.checkAllLevelsFlattenedRadioBtn();
    exports.uncheckSourcingCheckboxes();
    exports.checkSourcingCheckBox('Include Primary Sources');
    exports.checkSourcingCheckBox('Include Manufacturers');
    exports.checkSourcingCheckBox('Include Distributors');

    // Click export button and verify the exported file
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
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq([ 'Item', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1", "999-00001", "", "prd-with-flattened", "", "A*", "PRODUCTION", "", "", "", "", "", "$0.00000", "999-00001", `${companyName}`, "999-00001", `${companyName}`, "", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(["2", "910-00001", "EBOM", "cmp-1", "", "A", "DESIGN", "", "", "", "24", "EACH", "$0.00000", "910-00001", `${companyName}`, "910-00001", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(["3", "910-00002", "EBOM", "cmp-2", "", "1", "PROTOTYPE", "", "", "", "12", "EACH", "$0.00000", "910-00002", `${companyName}`, "910-00002", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(["4", "910-00003", "EBOM", "cmp-3", "", "A", "PRODUCTION", "", "", "", "4", "EACH", "$0.00000", "910-00003", `${companyName}`, "910-00003", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[4]))).to.deep.eq(["5", "910-00004", "EBOM", "cmp-4", "", "A", "OBSOLETE", "", "", "", "1", "EACH", "$0.00000", "910-00004", `${companyName}`, "910-00004", `${companyName}`, "$0.00000", "0 DAYS", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    });
  })
});

describe("Export With Flattened Module with correct quantity, unit price and total price values", () => {
  it("should export with single child", () => {
    // Navigate to cmp-1 and add sourcing data
    components.navigateToComponentViewPage('cmp-1', false);
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData = {
      mpn: "mpn1",
      manufacturer: "man1",
      description: "desc1",
    },
    distributorData = {
      dpn: "dpn1",
      distributor: "dist1",
      description: "desc1",
    },
    quoteData = {
      leadTime: "2",
      minQuantity: "1",
      unitPrice: "2.5000",
    };

    sourcing.enterManufacturerData(1, manufacturerData);
    sourcing.enterDistributorData(1, 1, distributorData);
    sourcing.enterQuoteData(1, 1, 1, quoteData);
    sourcing.checkQuoteCheckboxInDistributors();
    sourcing.clickOnSetPrimary();
    cy.wait(2000);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to cmp-2 and export
    components.navigateToComponentViewPage('cmp-2', false);
    components.clickExportIconInViewComponent();

    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Select Flattened type and required sources
    exports.checkAllLevelsFlattenedRadioBtn();
    exports.uncheckSourcingCheckboxes();
    exports.checkSourcingCheckBox('Include Primary Sources');
    exports.checkSourcingCheckBox('Include Manufacturers');

    // Click export button and verify the exported file
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00002.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(["Item", "CPN", "Category", "Name", "EID", "Revision", "Status", "Description", "Value", "Specs", "Quantity", "Unit of Measure", "Primary Source Unit Price", "Primary Source MPN", "Primary Source Manufacturer", "Primary Source DPN", "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Mass (g)", "Last Updated", "Workflow State", "Procurement", "Manufacturer", "MPN", "MPN Link", "Datasheet", "Mfr Description", "Item Type", "Effectivity Start Date", "Effectivity End Date"]);
        expect(Object.keys(rows).length).to.deep.eq(2);

        const quantityIndex = (Object.keys(rows[0])).indexOf('Quantity');
        const unitPriceIndex = (Object.keys(rows[0])).indexOf('Primary Source Unit Price')
        const totalPriceIndex = (Object.keys(rows[0])).indexOf('Total Price')

        expect(Object.values(rows[0])[quantityIndex]).to.deep.eq("");
        expect(Object.values(rows[0])[unitPriceIndex]).to.deep.eq("$5.00000");
        expect(Object.values(rows[0])[totalPriceIndex]).to.deep.eq("");

        expect(Object.values(rows[1])[quantityIndex]).to.deep.eq(2);
        expect(Object.values(rows[1])[unitPriceIndex]).to.deep.eq("$2.50000");
        expect(Object.values(rows[1])[totalPriceIndex]).to.deep.eq("$5.00000");
      })
    });
  })

  it.skip("should export with nested childs", () => {
    // Navigate to cmp-2 and add sourcing data
    components.navigateToComponentViewPage('cmp-2', false);
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData1 = {
      mpn: "mpn2",
      manufacturer: "man2",
      description: "desc2",
    },
    distributorData1 = {
      dpn: "dpn2",
      distributor: "dist2",
      description: "desc2",
    },
    quoteData1 = {
      leadTime: "2",
      minQuantity: "2",
      unitPrice: "0.50000",
    };

    sourcing.enterManufacturerData(1, manufacturerData1);
    sourcing.enterDistributorData(1, 1, distributorData1);
    sourcing.enterQuoteData(1, 1, 1, quoteData1);
    sourcing.checkQuoteCheckboxInDistributors();
    sourcing.clickOnSetPrimary();
    cy.wait(2000);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to cmp-3 and add sourcing data
    components.navigateToComponentViewPage('cmp-3', false);
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData2 = {
      mpn: "mpn3",
      manufacturer: "man3",
      description: "desc3",
    },
    distributorData2 = {
      dpn: "dpn3",
      distributor: "dist3",
      description: "desc3",
    },
    quoteData2 = {
      leadTime: "2",
      minQuantity: "1",
      unitPrice: "1.45000",
    };

    sourcing.enterManufacturerData(1, manufacturerData2);
    sourcing.enterDistributorData(1, 1, distributorData2);
    sourcing.enterQuoteData(1, 1, 1, quoteData2);
    sourcing.checkQuoteCheckboxInDistributors();
    sourcing.clickOnSetPrimary();
    cy.wait(2000);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to cmp-4 and add sourcing data
    components.navigateToComponentViewPage('cmp-4', false);
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData3 = {
      mpn: "mpn4",
      manufacturer: "man4",
      description: "desc4",
    },
    distributorData3 = {
      dpn: "dpn4",
      distributor: "dist4",
      description: "desc4",
    },
    quoteData3 = {
      leadTime: "2",
      minQuantity: "3",
      unitPrice: "3.542000",
    };

    sourcing.enterManufacturerData(1, manufacturerData3);
    sourcing.enterDistributorData(1, 1, distributorData3);
    sourcing.enterQuoteData(1, 1, 1, quoteData3);
    sourcing.checkQuoteCheckboxInDistributors();
    sourcing.clickOnSetPrimary();
    cy.wait(2000);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to product and Click on export icon
    products.navigateToProductViewPage('prd-with-flattened', false);
    products.clickExportIconInViewProduct();

    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Select Flattened type and required sources
    exports.checkAllLevelsFlattenedRadioBtn();
    exports.uncheckSourcingCheckboxes();
    exports.checkSourcingCheckBox('Include Primary Sources');
    exports.checkSourcingCheckBox('Include Manufacturers');

    // Click export button and verify the exported file
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
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(["Item", "CPN", "Category", "Name", "EID", "Revision", "Status", "Description", "Value", "Specs", "Quantity", "Unit of Measure", "Primary Source Unit Price", "Primary Source MPN", "Primary Source Manufacturer", "Primary Source DPN", "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Mass (g)", "Last Updated", "Workflow State", "Procurement", "Manufacturer", "MPN", "MPN Link", "Datasheet", "Mfr Description", "Item Type", "Effectivity Start Date", "Effectivity End Date"]);

        const quantityIndex = (Object.keys(rows[0])).indexOf('Quantity');
        const unitPriceIndex = (Object.keys(rows[0])).indexOf('Primary Source Unit Price');
        const totalPriceIndex = (Object.keys(rows[0])).indexOf('Total Price');

        expect(Object.values(rows[0])[quantityIndex]).to.deep.eq("");
        expect(Object.values(rows[0])[unitPriceIndex]).to.deep.eq("$4.99200");
        expect(Object.values(rows[0])[totalPriceIndex]).to.deep.eq("");

        expect(Object.values(rows[1])[quantityIndex]).to.deep.eq(30);
        expect(Object.values(rows[1])[unitPriceIndex]).to.deep.eq("$0.00000");
        expect(Object.values(rows[1])[totalPriceIndex]).to.deep.eq("$0.00000");

        expect(Object.values(rows[2])[quantityIndex]).to.deep.eq(15);
        expect(Object.values(rows[2])[unitPriceIndex]).to.deep.eq("$0.50000");
        expect(Object.values(rows[2])[totalPriceIndex]).to.deep.eq("$7.50000");

        expect(Object.values(rows[3])[quantityIndex]).to.deep.eq(5);
        expect(Object.values(rows[3])[unitPriceIndex]).to.deep.eq("$1.45000");
        expect(Object.values(rows[3])[totalPriceIndex]).to.deep.eq("$7.25000");

        expect(Object.values(rows[4])[quantityIndex]).to.deep.eq(1);
        expect(Object.values(rows[4])[unitPriceIndex]).to.deep.eq("$3.54200");
        expect(Object.values(rows[4])[totalPriceIndex]).to.deep.eq("$3.54200");
      });
    });
  });
});
