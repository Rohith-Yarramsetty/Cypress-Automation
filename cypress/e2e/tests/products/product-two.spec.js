import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants"
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { Dashboard } from "../../pages/dashboard";
import { Headers } from "../../pages/headers";
import { Components } from "../../pages/components/component";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const faker = require('faker');
const signin = new SignIn();
const nav = new Navigation();
const product = new Products();
const fakerhelper = new FakerHelpers();
const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const dashboard = new Dashboard();
const header = new Headers();
const components = new Components();
const compApi = new ComponentApi();
const assembly = new Assembly();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Products Two", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Revision should only allow alpha numeric values', ()=>{
    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());
    product.checkCategoryItem("Electrical");

    // Design Status: Assert revision with different values
    product.selectLifeCycleStatus(constData.status.design);
    product.enterRevision(1);
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('1A');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('1.0');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision(-1);
    product.verifyRevisionTooltipPresent("Value should be greater than 0");
    product.verifyCreateBtnDisabled();
    product.enterRevision(0);
    product.verifyRevisionTooltipPresent("Value should be greater than 0");
    product.verifyCreateBtnDisabled();

    // Prototype Status: Assert revision with different values
    product.selectLifeCycleStatus(constData.status.prototype);
    product.enterRevision(1);
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('1A');
    product.verifyRevisionTooltipPresent("Should contain only numbers");
    product.verifyCreateBtnDisabled();
    product.enterRevision('1.0');
    product.verifyRevisionTooltipPresent("Should contain only numbers");
    product.verifyCreateBtnDisabled();
    product.enterRevision(-1);
    product.verifyRevisionTooltipPresent("Value should be greater than 0");
    product.verifyCreateBtnDisabled();
    product.enterRevision(0);
    product.verifyRevisionTooltipPresent("Value should be greater than 0");
    product.verifyCreateBtnDisabled();

    // Production Status: Assert revision with different values
    product.selectLifeCycleStatus(constData.status.production);
    product.enterRevision('A');
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('A1');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('A.1');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('AA');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('1A');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('AZ');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();

    // Obsolete Status: Assert revision with different values
    product.selectLifeCycleStatus(constData.status.obsolete);
    product.enterRevision('A');
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('A1');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('A.1');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('AA');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('1A');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
    product.enterRevision('AZ');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
  })

  it('Status of Production and Obsolete should only allow alphabetic revision values', ()=>{
    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());
    product.checkCategoryItem("Electrical");

    // Production Status: Assert revision with different values
    product.selectLifeCycleStatus(constData.status.production);
    product.enterRevision(2);
    product.verifyRevisionTooltipPresent("Should not contain numbers");
    product.verifyCreateBtnDisabled();
    product.enterRevision('A');
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('Y');
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('$');
    product.verifyRevisionTooltipPresent("Should contain an upper case letter");
    product.verifyCreateBtnDisabled();
    product.enterRevision('AB');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();

    // Obsolete Status: Assert revision with different values
    product.selectLifeCycleStatus(constData.status.obsolete);
    product.enterRevision(2);
    product.verifyRevisionTooltipPresent("Should not contain numbers");
    product.verifyCreateBtnDisabled();
    product.enterRevision('A');
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('Y');
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('$');
    product.verifyRevisionTooltipPresent("Should contain an upper case letter");
    product.verifyCreateBtnDisabled();
    product.enterRevision('AB');
    product.verifyRevisionTooltipPresent("Should be less than 2 characters");
    product.verifyCreateBtnDisabled();
  })

  it("Status of Production and Obsolete should not allow 'I' and 'O' as Revision value", ()=>{
    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());
    product.checkCategoryItem("Electrical");

    // Production Status: Assert revision with 'I' and 'O' values
    product.selectLifeCycleStatus(constData.status.production);
    product.enterRevision('I');
    product.verifyRevisionTooltipPresent("Should not include value `I`");
    product.verifyCreateBtnDisabled();
    product.enterRevision('O');
    product.verifyRevisionTooltipPresent("Should not include value `O`");
    product.verifyCreateBtnDisabled();

    // Obsolete Status: Asserting revision with 'I' and 'O' values
    product.selectLifeCycleStatus(constData.status.obsolete);
    product.enterRevision('I');
    product.verifyRevisionTooltipPresent("Should not include value `I`");
    product.verifyCreateBtnDisabled();
    product.enterRevision('O');
    product.verifyRevisionTooltipPresent("Should not include value `O`");
    product.verifyCreateBtnDisabled();
  })

  it('Status Prototype should only allow numeric Revision values', ()=>{
    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());
    product.checkCategoryItem("Electrical");

    // Asserting revision with different values
    product.selectLifeCycleStatus(constData.status.prototype);
    product.enterRevision(2);
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.enterRevision('A');
    product.verifyRevisionTooltipPresent("Should contain only numbers");
    product.verifyCreateBtnDisabled();
    product.enterRevision('$');
    product.verifyRevisionTooltipPresent("Should contain only numbers");
    product.verifyCreateBtnDisabled();
  })

  it('should add forecast from add new forecast button', ()=>{
    // Navigate to Product tab
    nav.openProductTab();
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());

    // Verify existing forecast length
    product.verifyForecastLengthInNewProductCreationModal(2);

    // Add new forecast and verify number of forecasts in product creation
    product.clickAddNewForecastInNewProductCreationModal();
    product.verifyForecastLengthInNewProductCreationModal(3);

    // Click create button and verify number of forecasts in edit mode
    product.clickCreateButton();
    featureHelpers.waitForLoadingIconToDisappear();
    product.verifyForecastLengthInBuildScheduleEditMode(3);

    // Add new forecast and verify number of forecasts in edit mode
    product.clickOnAddNewForecastInBuildScheduleEditMode();
    product.verifyForecastLengthInBuildScheduleEditMode(4);
    product.clickOnAddNewForecastInBuildScheduleEditMode();
    product.verifyForecastLengthInBuildScheduleEditMode(5);

    // Save the product and verify number of forecasts in view mode
    product.clickSaveButtonInEditProduct();
    product.verifyForecastLengthInBuildScheduleViewMode(5);
  })

  it('Should not create product with a missing required field', function () {
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }

    // Navigate to Product tab
    nav.openProductTab();
    product.fillNewProductForm(data);
    product.verifyCreateBtnEnabled();

    // Clear Product name and assert create button disabled
    product.enterProductName(" ");
    product.verifyCreateBtnDisabled();

    // Add Product name and assert create button enabled
    product.enterProductName(data.prodName);
    product.verifyCreateBtnEnabled();

    // Change status to Production and Clear Revision
    product.selectLifeCycleStatus(constData.status.production);
    product.enterRevision(" ");

    // Verify create button disabled
    product.verifyCreateBtnDisabled();
  })

  it('Should create product with design status without error', function () {
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }

    // Navigate to Product tab
    nav.openProductTab();

    // Create new product
    product.createNewProduct(data);
    product.clickSaveButtonInEditProduct();
    product.waitForLoadingIconToDisappear();

    // Verify Status and Revision values
    product.verifyProductStatusInViewMode();
    product.verifyRevisionInViewMode();
  })

  it('Should cancel creating product with no trace in library successfully', function () {
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }

    // Navigate to Product tab
    nav.openProductTab();

    // Create new product
    product.createNewProduct(data);
    featureHelpers.waitForLoadingIconToDisappear();

    cy.url().then((urlInEdit)=>{
      product.clickCancelBtn();
      nav.openProductTab();

      // Verify product data in the table
      product.verifyCancelledProductInTable(data.prodName);

      // Navigating to the Copied url and verify New button existence
      cy.visit(urlInEdit);
      product.verifyNewButtonVisibleInProductPage();
    })
  })

  it('should mark product as favorite successfully', function () {
    const prodName = fakerhelper.generateProductName();
    // Navigate to Product tab
    nav.openProductTab();

    // Create new product
    product.clickNewButton();
    product.checkCategoryItem("Firmware");
    product.enterProductName(prodName);
    product.clickCreateButton();
    featureHelpers.waitForLoadingIconToDisappear();
    product.clickSaveButtonInEditProduct();
    featureHelpers.waitForLoadingIconToDisappear();

    // Add product to favourite and verify
    product.clickFavoriteIcon();
    product.assertProductAddedToFavorite();

    // Verify product present in the favourites
    nav.openProductTab();
    header.enterSearchTerm('type:prod is:favorite');
    tableHelper.assertTextInCell(constData.productTableHeaders.name, prodName, prodName);
  })

  it('user should be able to click on avatar button if user has unsaved changes in product', function () {
    // Navigate to Product tab
    nav.openProductTab();

    // Create new product
    product.clickNewButton();
    product.checkCategoryItem("Firmware");
    product.enterProductName(fakerhelper.generateProductName());
    product.clickCreateButton();
    featureHelpers.waitForLoadingIconToDisappear();

    // Verify modal not present
    header.clickOnAvatarIcon();
    header.assertSignOutOptionInDropDownIsShown();
    product.assertChangesWillBeLostModalNotPresent();

    // Save the product
    header.closeTheAvatarDropdown();
    product.clickSaveButtonInEditProduct();
    product.waitForLoadingIconToDisappear();
  })

  it('should display unsaved changes warning dialog when navigating to another app route', function () {
    // Navigate to Product tab
    nav.openProductTab();

    // Create new product
    product.clickNewButton();
    product.checkCategoryItem("Firmware");
    product.enterProductName(fakerhelper.generateProductName());
    product.clickCreateButton();
    featureHelpers.waitForLoadingIconToDisappear();

    // Navigate to different route and verify modal, URL
    cy.url().then(OrgUrl=>{
      header.clickOnCompanyName();
      product.assertChangesWillBeLostModalIsPresent();
      product.clickCancelInUnsavedChangesModal();
      cy.url().should('include', OrgUrl);

      cy.go("back");
      product.assertChangesWillBeLostModalIsPresent();
      product.clickCancelInUnsavedChangesModal();
      cy.url().should('include', OrgUrl);
    })

    // Click OK button in the modal and verify dashboard URL
    header.clickOnCompanyName();
    product.assertChangesWillBeLostModalIsPresent();
    product.clickOkBtnInUnsavedChangesModal();
    dashboard.verifyDashBoardPageAndUrl();
  })

  it('product edit documents must accept valid status and revision value for design', () => {
    // Navigate to Products tab
    nav.openProductTab();

    // Create new Product
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());
    product.selectLifeCycleStatus('DESIGN');
    product.uploadDocuments('sample_document.doc');
    product.clickCreateButton();
    product.clickOnDocumentsTab();
    product.setStatusInDocuments('DESIGN');

    // Verify Documents table with different Revision values
    product.enterRevisionInDocumentsTable('ABC');
    product.verifyRevisionTooltipPresentInDocuments('Should be less than 2 characters');
    product.verifySaveBtnDisabledInEditView();

    product.enterRevisionInDocumentsTable('A');
    product.verifyRevisionTooltipNotPresentInDocuments();
    product.verifySaveBtnEnabledInEditView();

    product.enterRevisionInDocumentsTable('G');
    product.verifyRevisionTooltipNotPresentInDocuments();
    product.verifySaveBtnEnabledInEditView();

    product.enterRevisionInDocumentsTable('I');
    product.verifyRevisionTooltipNotPresentInDocuments();
    product.verifySaveBtnEnabledInEditView();

    product.enterRevisionInDocumentsTableAsEmpty();
    product.verifyRevisionTooltipNotPresentInDocuments();
    product.verifySaveBtnEnabledInEditView();

    product.enterRevisionInDocumentsTable('80');
    product.verifyRevisionTooltipNotPresentInDocuments();
    product.verifySaveBtnEnabledInEditView();

    product.enterRevisionInDocumentsTable('999');
    product.verifyRevisionTooltipPresentInDocuments('Value should be less than 100');
    product.verifySaveBtnDisabledInEditView();

    product.enterRevisionInDocumentsTable('-');
    product.verifyRevisionTooltipPresentInDocuments('Should contain number from 1 to 99 or letter from A to Z');
    product.verifySaveBtnDisabledInEditView();

    product.enterRevisionInDocumentsTable('22');
    product.verifyRevisionTooltipNotPresentInDocuments();
    product.verifySaveBtnEnabledInEditView();

    product.clickSaveButtonInEditProduct();
  })

  it('Should not allow duplicate eid for component and product', ()=>{
    const eid = "testing-eid-" + faker.random.number({min:1000000, max:9999999})

    // Create product with eid
    // Navigate to Product tab
    nav.openProductTab();
    product.clickNewButton();
    product.checkCategoryItem(constData.productType.mechanical);
    product.enterProductName(fakerhelper.generateProductName());
    product.selectLifeCycleStatus(constData.status.production);
    product.enterEid(eid);
    product.enterRevision("A");
    product.verifyCreateBtnEnabled();
    product.clickCreateButton();
    product.clickSaveButtonInEditProduct();
    featureHelpers.waitForLoadingIconToDisappear();

    //Create Product with same eid
    // Navigate to Product tab
    nav.openProductTab();
    product.clickNewButton();
    product.checkCategoryItem(constData.productType.mechanical);
    product.enterProductName(fakerhelper.generateProductName());
    product.selectLifeCycleStatus(constData.status.design);
    product.enterEid(eid);
    product.enterRevision("A");
    product.verifyEidTooltipPresent("EID already exists in library.");
    product.verifyCreateBtnDisabled();

    //Create Component with same eid
    // Navigate to Components tab
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseType(constData.componentType.mechanical);
    components.chooseCategory(constData.mechanicalComponents.adhesive);
    components.enterComponentName(fakerhelper.generateProductName());
    components.enterEid(eid);
    components.verifyEidTooltipPresent("EID already exists in library.");
    components.verifyCreateBtnDisabled();
  })

  it('Not Design Status Module: should NOT allow save as revision for PRODUCTS NOT in design status', () => {
    const prod1 = {
      name: 'prod-1',
      status: constData.status.prototype,
      revision: 1
    }
    const prod2 = {
      name: 'prod-2',
      status: constData.status.production,
      revision: 'A'
    }
    const prod3 = {
      name: 'prod-3',
      status: constData.status.obsolete,
      revision: 'A'
    }
    const prod4 = {
      name: 'prod-4',
      status: constData.status.design,
      revision: 'A'
    }

    // Create Product with status Prototype & verify Save as Revision button
    nav.openProductTab();
    product.clickNewButton();
    product.enterProductName(prod1.name);
    product.selectLifeCycleStatus(prod1.status);
    product.enterRevision(prod1.revision);
    product.clickCreateButton();
    product.clickSaveButtonInEditProduct();
    product.clickEditIcon();
    product.verifySaveAsRevisionBtnNotPresent();
    product.clickCancelInEditPage();
    featureHelpers.waitForLoadingIconToDisappear();

    // Create Product with status Production & verify Save as Revision button
    nav.openProductTab();
    product.clickNewButton();
    product.enterProductName(prod2.name);
    product.selectLifeCycleStatus(prod2.status);
    product.enterRevision(prod2.revision);
    product.clickCreateButton();
    product.clickSaveButtonInEditProduct();
    product.clickEditIcon();
    product.verifySaveAsRevisionBtnNotPresent();
    product.clickCancelInEditPage();
    featureHelpers.waitForLoadingIconToDisappear();

    // Create Product with status Obselete & verify Save as Revision button
    nav.openProductTab();
    product.clickNewButton();
    product.enterProductName(prod3.name);
    product.selectLifeCycleStatus(prod3.status);
    product.enterRevision(prod3.revision);
    product.clickCreateButton();
    product.clickSaveButtonInEditProduct();
    product.clickEditIcon();
    product.verifySaveAsRevisionBtnNotPresent();
    product.clickCancelInEditPage();
    featureHelpers.waitForLoadingIconToDisappear();

    const comp1 = {
      name: 'comp-1',
      status: constData.status.design,
      revision: 'A'
    }
    const comp2 = {
      name: 'comp-2',
      status: constData.status.prototype,
      revision: 1
    }
    const comp3 = {
      name: 'comp-3',
      status: constData.status.production,
      revision: 'A'
    }
    const comp4 = {
      name: 'comp-4',
      status: constData.status.obsolete,
      revision: 'Y'
    }

    // Create Components with all statuses
    compApi.createComponent(comp1);
    compApi.createComponent(comp2);
    compApi.createComponent(comp3);
    compApi.createComponent(comp4);

    // Get CPN values of Components
    nav.openComponentsTab();
    let comp1CpnValue, comp2CpnValue, comp3CpnValue, comp4CpnValue;
    featureHelpers.getCpnValueFromTable(comp1.name, 1).then((value) => comp1CpnValue = value)
    featureHelpers.getCpnValueFromTable(comp2.name, 1).then((value) => comp2CpnValue = value)
    featureHelpers.getCpnValueFromTable(comp3.name, 1).then((value) => comp3CpnValue = value)
    featureHelpers.getCpnValueFromTable(comp4.name, 1).then((value) => {
      comp4CpnValue = value

      // Create Product with status Design & verify Save as Revision button
      nav.openProductTab();
      product.clickNewButton();
      product.enterProductName(prod4.name);
      product.selectLifeCycleStatus(prod4.status);
      product.enterRevision(prod4.revision);
      product.clickCreateButton();
      product.clickSaveButtonInEditProduct();
      product.clickEditIcon();
      product.verifySaveAsRevisionBtnPresent();
      assembly.clickOnAssemblyTab();

      const comp1Data = {
        CPN: comp1CpnValue,
        Quantity: 2,
      }
      const comp2Data = {
        CPN: comp2CpnValue,
        Quantity: 2,
      }
      const comp3Data = {
        CPN: comp3CpnValue,
        Quantity: 2,
      }
      const comp4Data = {
        CPN: comp4CpnValue,
        Quantity: 2,
      }

      // Add previously created components to the product with status Design
      assembly.addComponentsToAssemblyTable(comp1Data);
      assembly.addComponentsToAssemblyTable(comp2Data);
      assembly.addComponentsToAssemblyTable(comp3Data);
      assembly.addComponentsToAssemblyTable(comp4Data);

      // Update revision of Product & verify Revision
      product.clickSaveButtonInEditProduct();
      product.clickEditIcon();
      product.clickOnSaveAsRevisionBtn();
      product.verifyApplyButtonDisabledInChangeStatusModal();
      product.checkIncludeChildComponents();
      product.clickOnContinue();
      product.clickOnHistoryIconInViewPage();
      product.verifyNoOfRevisionsInViewPage(2);

      // Verify revisions of Components
      components.verifyNoOfRevisionsForCmpInCmpLibrary(comp1CpnValue, 2);
      components.verifyNoOfRevisionsForCmpInCmpLibrary(comp2CpnValue, 1);
      components.verifyNoOfRevisionsForCmpInCmpLibrary(comp3CpnValue, 1);
      components.verifyNoOfRevisionsForCmpInCmpLibrary(comp4CpnValue, 1);
    })
  })
})
