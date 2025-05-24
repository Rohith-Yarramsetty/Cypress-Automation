import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Components } from "../../pages/components/component";
import { Sourcing } from "../../pages/components/sourcing";
import { SignIn } from "../../pages/signin";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import productSelectors from "../../selectors/products/products";
import { Products } from "../../pages/products/products";
import { Navigation } from "../../pages/navigation";
import { Assembly } from "../../pages/components/assembly";
import { Export } from "../../pages/export";

const signin = new SignIn();
const userApi = new UsersApi();
const components = new Components();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const compSettings = new CompanySettingsApi();
const compApi = new ComponentApi();
const sourcing = new Sourcing();
const products = new Products();
const nav = new Navigation();
const assembly = new Assembly();
const exports = new Export();

let email, companyId, orgId, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  companyName = user.companyName;
  user.orgData.then(res => {orgId = res.body.org_id})
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
    compSettings.updateAirbnbSettings(companyId);
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

describe("Airbnb custom fields", { tags: ["Airbnb"] }, () => {
  it("Warranty field should be present in component's view", () => {
    let cmpData = {
      componentType : "Electrical",
      category     : "Wire",
      componentName: "Wire cmp-1",
      status       : "DESIGN",
    };
    components.createComponentManually(cmpData);
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData = {
      mpn: "mpn1",
      manufacturer: "man1",
      description: "desc1",
      warranty: "2",
    },
    distributorData = {
      dpn: "dpn1",
      distributor: "dist1",
      description: "desc1",
    },
    quoteData = {
      leadTime: "2",
      minQuantity: "1",
      unitPrice: "0.250",
    };

    // Add sourcing data 
    sourcing.navigateToSourcingTab();
    sourcing.enterManufacturerData(1, manufacturerData);
    sourcing.enterDistributorData(1, 1, distributorData);
    sourcing.enterQuoteData(1, 1, 1, quoteData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    tableHelper.assertRowPresentInTable(constData.sourcingTableHeaders.mfrWarranty, '2MONTHS', productSelectors.tableHeader, productSelectors.tableCellContains);
  })

  it("should have missing extended cost icon for product and components", () => {
    let cmpData = {
      componentType : "Assembly",
      category     : "EBOM",
      componentName: "EBOM cmp-1",
      status       : "DESIGN",
    }
    components.createComponentManually(cmpData);
    sourcing.navigateToSourcingTab();
    sourcing.deselectPrimaryComponent();
    components.getExtendedCost("!");

    const prodData = {
      productName:  "EBOM prd-2",
      status: constData.status.design,
    }
    // Navigate to Product Tab
    nav.openProductTab();
    products.clickNewButton();

    // Creating New Product
    products.enterProductName(prodData.productName);
    products.checkCategoryItem(constData.productType.mechanical);
    products.selectLifeCycleStatus(prodData.status);
    products.clickCreateButton();
    products.clickSaveButtonInEditProduct();

    sourcing.navigateToSourcingTab();
    sourcing.deselectPrimaryComponent();
    components.getExtendedCost("!")
  })

  it('Unit of Measures', () => {
    const unitsList = [ "EACH", "INCHES", "FEET", "YARDS", "MILLIMETERS", "CENTIMETERS", "METERS", "KILOMETERS", "OUNCES", "MILLIGRAMS",
                        "GRAMS", "KILOGRAMS", "POUNDS", "DAYS", "GALLONS", "LITERS", "HOURS", "PACKAGE", "IN²", "m²", "mm²", "FT²" ];

    compApi.createComponent({
      name      : 'Wire cmp-1',
      status    : 'DESIGN',
      category  : 'Wire'
    })

    components.navigateToComponentEditPage('Wire cmp-1');
    unitsList.forEach((unit) => {
      components.verifyUnitOfMeasure(unit);
    })
  })

  it("waste, extended quantity, extended cost and extended rolled up cost should be in exported sheet", () => {
    // Create a component
    const cmpOneData = {
      categoryType : "Electrical",
      category     : "Wire",
      name         : "Wire cmp-123",
      status       : "DESIGN",
    }
    compApi.createComponent(cmpOneData);

    // create a product and add child cmp
    const child2Data = {
      cpn     : '241-00001',
      quantity: 1,
      waste   : '0.3'
    }
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName("Prd-tree export");
    products.clickCreateButton();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents(child2Data.cpn);
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, child2Data.quantity, child2Data.cpn);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.waste, child2Data.waste, child2Data.cpn)
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Click on export icon
    products.clickExportIconInViewProduct();

    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Click export button and verify the exported file
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-999-00001-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(["Item", "Level", "CPN", "Category", "Name", "EID", "Revision", "Status", "Description", "Value", "Specs", "Quantity", "Waste %", "Extended Quantity", "Extended Cost", "Unit of Measure", "Primary Source Unit Price", "Primary Source Extended Cost", "Primary Source MPN", "Primary Source Manufacturer", "Primary Source DPN", "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Ref Des", "Item Number", "Notes", "Mass (g)", "Last Updated", "Workflow State", "Procurement", "Manufacturer", "MPN", "MPN Link", "Datasheet", "Mfr Description", "Warranty", "Distributor", "DPN", "DPN Link", "Dist Description", "Package", "Package Quantity", "Quantity Min", "Unit Price", "Lead Time", "Item Type", "Effectivity Start Date", "Effectivity End Date"]);
        expect(Object.keys(rows).length).to.deep.eq(2);

        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1", "0", "999-00001", "", "Prd-tree export", "", "", "DESIGN", "", "", "", "", "", "", "", "", "$0.00000","$0.00000", "999-00001", `${companyName}`, "999-00001", `${companyName}`, "", "0 DAYS", "", "", "", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "","","",""])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(["2", "1", "241-00001", "Wire", "Wire cmp-123", "", "", "DESIGN", "", "", "LENGTH: , GAUGE: , STRANDS: , COLOR: , CURRENT: , VOLTAGE: , INSULATION: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ", "1", "0.30", "1.00", "", "INCHES", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "","","",""]);
      })
    });
  })

  it("Warranty field should be in exported sheet", () => {
    // Create a component
    const cmpOneData = {
      category     : "Wire",
      name         : "Wire cmp-123",
      status       : "DESIGN",
    }
    compApi.createComponent(cmpOneData);

    // Navigate to wire component and sourcing data
    let manufacturerData1 = { mpn: "mpn1", manufacturer: "man1", description: "desc1", warranty: "3"},
    distributorData1 = { dpn: "dpn1", distributor: "dist1", description: "desc1"},
    quoteData1 = { leadTime: "2", minQuantity: "1", unitPrice: "0.25"};

    components.navigateToComponentEditPage(cmpOneData.name, false);
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();
    sourcing.enterManufacturerData(1, manufacturerData1);
    sourcing.enterDistributorData(1, 1, distributorData1);
    sourcing.enterQuoteData(1, 1, 1, quoteData1);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // create a product and add child cmp
    const childData = {
      cpn     : '241-00001',
      quantity: 1,
      waste   : 0
    }
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName("Prd-tree export");
    products.clickCreateButton();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents(childData.cpn);
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, childData.quantity, childData.cpn);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.waste, childData.waste, childData.cpn);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Click on export icon
    products.clickExportIconInViewProduct();

    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Click export button and verify the exported file
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-999-00001-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(["Item", "Level", "CPN", "Category", "Name", "EID", "Revision", "Status", "Description", "Value", "Specs", "Quantity", "Waste %", "Extended Quantity", "Extended Cost", "Unit of Measure", "Primary Source Unit Price","Primary Source Extended Cost", "Primary Source MPN", "Primary Source Manufacturer", "Primary Source DPN", "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Ref Des", "Item Number", "Notes", "Mass (g)", "Last Updated", "Workflow State", "Procurement", "Manufacturer", "MPN", "MPN Link", "Datasheet", "Mfr Description", "Warranty", "Distributor", "DPN", "DPN Link", "Dist Description", "Package", "Package Quantity", "Quantity Min", "Unit Price", "Lead Time", "Item Type", "Effectivity Start Date", "Effectivity End Date"]);
        expect(Object.keys(rows).length).to.deep.eq(2);

        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1", "0", "999-00001", "", "Prd-tree export", "", "", "DESIGN", "", "", "", "", "", "", "", "", "$0.25000", "$0.25000", "999-00001", `${companyName}`, "999-00001", `${companyName}`,"", "2 DAYS", "", "", "", "0", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(["2", "1", "241-00001", "Wire", "Wire cmp-123", "", "", "DESIGN", "", "", "LENGTH: , GAUGE: , STRANDS: , COLOR: , CURRENT: , VOLTAGE: , INSULATION: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ", "1", "0.00", "1.00", "$0.25", "INCHES", "$0.25000", "", "mpn1", "man1", "dpn1", "dist1", "$0.25000", "2 DAYS", "", "", "", "", "", "", "", "man1", "mpn1", "", "", "desc1", "3 MONTHS", "dist1", "dpn1", "", "desc1", "", "1", "1", "$0.25000", "2 DAYS", "", "", ""]);
      })
    });
  })

  it("waste, extended quantity and extended cost should be present in component's view", () => {
    // Create 2 components
    const cmpData1 = { category : "EBOM", name : "EBOM cpm-1", status : "DESIGN", };
    const cmpData2 = { category : "Wire", name : "Wire cmp-1", status : "DESIGN", };
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);

    // Navigate to Assembly component and add wire cmp as child
    const child1Data = {
      cpn     : '241-00001',
      quantity: 1,
      waste   : 23
    }
    components.navigateToComponentEditPage(cmpData1.name, false);
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents(child1Data.cpn);
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, child1Data.quantity, child1Data.cpn);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.waste, child1Data.waste, child1Data.cpn)
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to wire component and sourcing data
    let manufacturerData1 = { mpn: "mpn1", manufacturer: "man1", description: "desc1"},
    distributorData1 = { dpn: "dpn1", distributor: "dist1", description: "desc1"},
    quoteData1 = { leadTime: "2", minQuantity: "1", unitPrice: "0.25"};

    components.navigateToComponentEditPage(cmpData2.name, false);
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();
    sourcing.enterManufacturerData(1, manufacturerData1);
    sourcing.enterDistributorData(1, 1, distributorData1);
    sourcing.enterQuoteData(1, 1, 1, quoteData1);
    sourcing.checkQuoteCheckboxInDistributors();
    sourcing.clickOnSetPrimary();
    cy.wait(2000);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    components.navigateToComponentEditPage(cmpData1.name, false);
    assembly.clickOnAssemblyTab();
    tableHelper.assertRowPresentInTable(constData.assemblyTableHeaders.waste, '23', productSelectors.tableHeader, productSelectors.tableCellContains);
    tableHelper.assertRowPresentInTable(constData.assemblyTableHeaders.extendedCost, '1.23', productSelectors.tableHeader, productSelectors.tableCellContains);
    tableHelper.assertRowPresentInTable(constData.assemblyTableHeaders.extendedQuantity, '$0.31', productSelectors.tableHeader, productSelectors.tableCellContains);
  })
})

describe("Extended Rolled Up Cost of product and components with Children", () => {
  beforeEach(function () {
    // Create 2 components
    const cmpData1 = { category : "EBOM", name : "EBOM cpm-1", status : "DESIGN", };
    const cmpData2 = { category : "Wire", name : "Wire cmp-1", status : "DESIGN", };
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);

    // Navigate to wire component and sourcing data
    let manufacturerData1 = { mpn: "mpn1", manufacturer: "man1", description: "desc1"},
    distributorData1 = { dpn: "dpn1", distributor: "dist1", description: "desc1"},
    quoteData1 = { leadTime: "2", minQuantity: "1", unitPrice: "0.25"};

    components.navigateToComponentEditPage(cmpData2.name, false);
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();
    sourcing.enterManufacturerData(1, manufacturerData1);
    sourcing.enterDistributorData(1, 1, distributorData1);
    sourcing.enterQuoteData(1, 1, 1, quoteData1);
    sourcing.checkQuoteCheckboxInDistributors();
    sourcing.clickOnSetPrimary();
    cy.wait(2000);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to Assembly component and add wire cmp as child
    const child1Data = {
      cpn     : '241-00001',
      quantity: 1,
      waste   : 23
    }
    components.navigateToComponentEditPage(cmpData1.name, false);
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents(child1Data.cpn);
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, child1Data.quantity, child1Data.cpn);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.waste, child1Data.waste, child1Data.cpn)
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify extended cost
    components.getExtendedCost("$0.3100");

    // Create a product and add assembly component as child
    const child2Data = {
      cpn     : '910-00001',
      quantity: 1,
      waste   : 55
    }
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName("EBOM prd-2");
    products.clickCreateButton();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents(child2Data.cpn);
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, child2Data.quantity, child2Data.cpn);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.waste, child2Data.waste, child2Data.cpn)
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Create 3rd component
    const cmpData3 = { category : "Wire", name : "Wire cmp-2", status : "DESIGN"};
    compApi.createComponent(cmpData3);

    // Add 3rd component to product as child
    const child3Data = {
      cpn     : '241-00001',
      quantity: 4,
      waste   : 75
    }
    products.navigateToProductViewPage("EBOM prd-2", false);
    products.clickEditIcon();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents(child3Data.cpn);
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, child3Data.quantity, child3Data.cpn);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.waste, child3Data.waste, child3Data.cpn)
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Add sourcing data
    let manufacturerData2 = { mpn: "mpn2", manufacturer: "man2", description: "desc2"},
    distributorData2 = { dpn: "dpn2", distributor: "dist2", description: "desc2"},
    quoteData2 = { leadTime: "2", minQuantity: "1", unitPrice: "0.00"};

    products.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();
    sourcing.enterManufacturerData(1, manufacturerData2);
    sourcing.enterDistributorData(1, 1, distributorData2);
    sourcing.enterQuoteData(1, 1, 1, quoteData2);
    sourcing.checkQuoteCheckboxInDistributors();
    sourcing.clickOnSetPrimary();
    cy.wait(2000);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to product and add child component
    const child4Data = {
      cpn     : '241-00002',
      quantity: 4,
      waste   : 10
    }
    products.navigateToProductViewPage("EBOM prd-2", false);
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents(child4Data.cpn);
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, child4Data.quantity, child4Data.cpn);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.waste, child4Data.waste, child4Data.cpn)
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();
  });

  it("should export extended rolled up cost correctly", () => {
    products.navigateToProductViewPage("EBOM prd-2", false);

    // Click on export icon
    products.clickExportIconInViewProduct();

    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Click export button and verify the exported file
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-999-00001-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(["Item","Level","CPN","Category","Name","EID","Revision","Status","Description","Value","Specs","Quantity","Waste %","Extended Quantity","Extended Cost","Unit of Measure","Primary Source Unit Price","Primary Source Extended Cost","Primary Source MPN","Primary Source Manufacturer", "Primary Source DPN", "Primary Source Distributor","Total Price","Primary Source Lead Time","Ref Des","Item Number","Notes","Mass (g)","Last Updated","Workflow State","Procurement","Manufacturer","MPN","MPN Link","Datasheet","Mfr Description","Warranty","Distributor","DPN","DPN Link","Dist Description","Package","Package Quantity","Quantity Min","Unit Price","Lead Time","Item Type","Effectivity Start Date","Effectivity End Date"]);
        expect(Object.keys(rows).length).to.deep.eq(4);

        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1","0","999-00001","","EBOM prd-2","","","DESIGN","","","","","","","","","$0.00000","","mpn2","man2","dpn2","dist2","","2 DAYS","","","","0","","","","man2","mpn2","","","desc2","0 MONTHS","dist2","dpn2","","desc2","","1","1","$0.00000","2 DAYS","","",""])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(["2","1","241-00001","Wire","Wire cmp-1","","","DESIGN","","","LENGTH: , GAUGE: , STRANDS: , COLOR: , CURRENT: , VOLTAGE: , INSULATION: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ","4","75.00","7.00","$1.75","INCHES","$0.25000","","mpn1","man1","dpn1","dist1","$1.00000","2 DAYS","","","","","","","","man1","mpn1","","","desc1","0 MONTHS","dist1","dpn1","","desc1","","1","1","$0.25000","2 DAYS","","",""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[2]))).to.deep.eq(["3","1","241-00002","Wire","Wire cmp-2","","","DESIGN","","","LENGTH: , GAUGE: , STRANDS: , COLOR: , CURRENT: , VOLTAGE: , INSULATION: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ","4","10.00","4.40","","INCHES","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[3]))).to.deep.eq(["4","1","910-00001","EBOM","EBOM cpm-1","","","DESIGN","","","","1","55.00","1.55","$0.39","EACH","$0.25000","$0.30750","910-00001",`${companyName}`,"910-00001",`${companyName}`,"$0.25000","2 DAYS","","","","0","","","","","","","","","","","","","","","","","","","","",""]);
      });
    });
  });
});
