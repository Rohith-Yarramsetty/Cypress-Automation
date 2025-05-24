import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Headers } from "../../pages/headers";
import { Dashboard } from "../../pages/dashboard";
import { Products } from "../../pages/products/products";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const faker = require('faker');
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const headers = new Headers();
const dashboard = new Dashboard();
const products = new Products();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("New Component", () => {
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

  context("Component Unsaved changes Module:", () => {
    let data;
    beforeEach(() => {
      data = {
        componentType: constData.componentType.mechanical,
        category: constData.mechanicalComponents.adhesive,
        compDesc: 'This is related to component description',
        compName: fakerHelper.generateProductName()
      }

      // Navigate to components tab
      nav.openComponentsTab();

      // Create component manually with required details
      components.clickComponentIcon();
      components.clickonCreateManually();
      components.chooseType(data.componentType);
      components.chooseCategory(data.category);
      components.enterComponentName(data.compName);
      components.enterRevision('1');
      components.clickOnCreate();
    })

    it('user should be able to click on avatar icon if user has unsaved changes in the component', () =>{
      // Save the component and re-edit
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
      components.clickEditIcon();

      // Edit component description and click on avatar icon
      components.enterCompDescInDetailsPanel(data.compDesc);
      headers.clickOnAvatarIcon();

      // verify one of the option in Drop down and changes will be lost modal not present
      headers.assertSignOutOptionInDropDownIsShown();
      components.assertChangesWillBeLostModalNotPresent();
    })

    it('Should display unsaved changes warning dialog when navigating to another app route', () =>{
      // Click on another route in app and cancel the modal
      cy.url().then(url => {
        headers.clickOnCompanyName();
        components.assertChangesWillBeLostModalIsPresent();
        components.clickCancelInUnsavedChangesModal();
        cy.url().should('include',url);
      })

      // Click on another route in app and verify the modal is present
      headers.clickOnCompanyName();
      components.assertChangesWillBeLostModalIsPresent();

      // Click OK in the modal
      components.clickOkBtnInUnsavedChangesModal();
      featureHelper.waitForLoadingIconToDisappear();
      dashboard.verifyDashBoardPageAndUrl();
    })
  })

  context("Component status and revision modules", () => {
    beforeEach(function () {
      // Navigate to Componets tab
      nav.openComponentsTab();

      // Creating component manually
      components.clickonCreateManually();
      components.chooseType(constData.componentType.electrical);
      components.chooseCategory(constData.electricalComponents.capacitor);
    })

    it('Status Design should allow numeric and alphabetic values', ()=>{
      components.selectStatus(constData.status.design);

      // Asserting revision with different values
      components.enterRevision(2);
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('A');
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
    })

    it('Status Prototype should only allow numeric Revision values', ()=>{
      components.selectStatus(constData.status.prototype);

      // Asserting revision with different values
      components.enterRevision(2);
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('A');
      components.verifyRevisionTooltipPresent("Should contain only numbers");
      components.verifyCreateBtnDisabled();
      components.enterRevision('$');
      components.verifyRevisionTooltipPresent("Should contain only numbers");
      components.verifyCreateBtnDisabled();
    })

    it('Status of Production and Obsolete should only allow alphabetic revision values', ()=>{
      // Production Status: Assert revision with different values
      components.selectStatus(constData.status.production);
      components.enterRevision(2);
      components.verifyRevisionTooltipPresent("Should not contain numbers");
      components.verifyCreateBtnDisabled();
      components.enterRevision('A');
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('Z');
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('$');
      components.verifyRevisionTooltipPresent("Should contain an upper case letter");
      components.verifyCreateBtnDisabled();
      components.enterRevision('AB');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();

      // Obsolete Status: Assert revision with different values
      components.selectStatus(constData.status.obsolete);
      components.enterRevision(2);
      components.verifyRevisionTooltipPresent("Should not contain numbers");
      components.verifyCreateBtnDisabled();
      components.enterRevision('A');
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('Z');
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('$');
      components.verifyRevisionTooltipPresent("Should contain an upper case letter");
      components.verifyCreateBtnDisabled();
      components.enterRevision('AB');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
    })

    it('Revision should only allow alpha numeric values', ()=>{
      // Design Status: Assert revision with different values
      components.selectStatus(constData.status.design);
      components.enterRevision(1);
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('1A');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision(1.0);
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision(-1);
      components.verifyRevisionTooltipPresent("Value should be greater than 0");
      components.verifyCreateBtnDisabled();
      components.enterRevision(0);
      components.verifyRevisionTooltipPresent("Value should be greater than 0");
      components.verifyCreateBtnDisabled();

      // Prototype Status: Assert revision with different values
      components.selectStatus(constData.status.prototype);
      components.enterRevision(1);
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('1A');
      components.verifyRevisionTooltipPresent("Should contain only numbers");
      components.verifyCreateBtnDisabled();
      components.enterRevision(1.0);
      components.verifyRevisionTooltipPresent("Should contain only numbers");
      components.verifyCreateBtnDisabled();
      components.enterRevision(-1);
      components.verifyRevisionTooltipPresent("Value should be greater than 0");
      components.verifyCreateBtnDisabled();
      components.enterRevision(0);
      components.verifyRevisionTooltipPresent("Value should be greater than 0");
      components.verifyCreateBtnDisabled();

      // Production Status: Assert revision with different values
      components.selectStatus(constData.status.production);
      components.enterRevision('A');
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('A1');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('A.1');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('AA');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('1A');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('AZ');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();

      // Obsolete Status: Assert revision with different values
      components.selectStatus(constData.status.obsolete);
      components.enterRevision('A');
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision('A1');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('A.1');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('AA');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('1A');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
      components.enterRevision('AZ');
      components.verifyRevisionTooltipPresent("Should be less than 2 characters");
      components.verifyCreateBtnDisabled();
    })

    it('Revision can be changed from default value without errors', ()=>{
      // Prototype Status: Assert revision with different values
      components.selectStatus(constData.status.prototype);
      components.enterRevision(1);
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
      components.enterRevision(5);
      components.verifyRevisionTooltipNotPresent();
      components.verifyCreateBtnEnabled();
    })

    it("Status of Production and Obsolete should not allow 'I' and 'O' as Revision value", ()=>{
      // Production Status: Assert revision with 'I' and 'O' values
      components.selectStatus(constData.status.production);
      components.enterRevision('I');
      components.verifyRevisionTooltipPresent("Should not include value `I`");
      components.verifyCreateBtnDisabled();
      components.enterRevision('O');
      components.verifyRevisionTooltipPresent("Should not include value `O`");
      components.verifyCreateBtnDisabled();

      // Obsolete Status: Asserting revision with 'I' and 'O' values
      components.selectStatus(constData.status.obsolete);
      components.enterRevision('I');
      components.verifyRevisionTooltipPresent("Should not include value `I`");
      components.verifyCreateBtnDisabled();
      components.enterRevision('O');
      components.verifyRevisionTooltipPresent("Should not include value `O`");
      components.verifyCreateBtnDisabled();
    })
  })

  context("Component Module", () => {
    let data;
    beforeEach(() => {
      data = {
        componentType: constData.componentType.mechanical,
        category: constData.mechanicalComponents.adhesive,
      }
      // Navigate to Component tab
      nav.openComponentsTab();

      // Creating Component Manually
      components.clickonCreateManually();
      components.chooseType(data.componentType);
      components.chooseCategory(data.category);
    })

    it('Create button should not be active if there are any errors in any field', () => {
      // Entering Component Name
      components.enterComponentName(fakerHelper.getRandomStringOfCharacters(101));
      components.verifyNameTooltip('Should be less than 101 characters');
      components.verifyCreateBtnDisabled();
      components.enterComponentName(fakerHelper.generateProductName());
      components.verifyNameTooltip("");
      components.verifyCreateBtnEnabled();

      // Selecting Status
      components.selectStatus(constData.status.production);

      // Entering Revision
      components.enterRevision(1);
      components.verifyRevisionTooltipPresent('Should not contain numbers');
      components.verifyCreateBtnDisabled();
      components.enterRevision('A');
      components.verifyRevisionTooltipPresent("")
      components.verifyCreateBtnEnabled();

      // Entering EID
      components.enterEid(fakerHelper.getRandomStringOfCharacters(42));
      components.verifyEidTooltipPresent('Should be less than 41 characters')
      components.verifyCreateBtnDisabled();
      components.enterEid('1212-ABC');
      components.verifyEidTooltipPresent("");
      components.verifyCreateBtnEnabled();

      // Entering Description
      components.enterComponentDescription(fakerHelper.getRandomStringOfCharacters(801));
      components.verifyDescTooltip('Should be less than 801 characters');
      components.verifyCreateBtnDisabled();
      components.enterComponentDescription('1212-ABC');
      components.verifyDescTooltip("");
      components.verifyCreateBtnEnabled();
    })

    it('Should not allow duplicate eid for component and product', () => {
      const eid = faker.random.number({min:100, max:9999});

      // Entering Component Name
      components.enterComponentName(fakerHelper.generateProductName());
      components.selectStatus(constData.status.production);
      components.enterEid('testing-eid-' + eid);
      components.enterRevision('A');
      components.clickOnCreate();
      components.clickSaveButtonInEditComponent();

      // Navigate to Component Tab
      nav.openComponentsTab();

      // Creating Component with Same EID
      components.clickonCreateManually();
      components.chooseType(constData.componentType.mechanical);
      components.chooseCategory(constData.mechanicalComponents.bolt);
      components.selectStatus(constData.status.design);
      components.enterRevision('A');
      components.enterEid('testing-eid-' + eid);
      components.verifyEidTooltipPresent('EID already exists in library.');
      components.enterEid('testing-EID-' + eid);
      components.verifyEidTooltipPresent('EID already exists in library.');
      components.verifyCreateBtnDisabled();
      components.clickCancelBtnInCreateComponent();

      // Creating Product with Same EID
      nav.openProductTab();
      products.clickNewButton();
      products.enterEid('testing-eid-' + eid);
      products.verifyEidTooltipPresent('EID already exists in library.');
      products.enterEid('testing-EID-' + eid);
      products.verifyEidTooltipPresent('EID already exists in library.');
    })

    it.skip('Should show uploading status and cancel button when document or thumbnail are uploading', () => {
      const data = {
        cmpName: fakerHelper.generateProductName(),
        status: constData.status.design,
      }

      // Entering Component Name
      components.enterComponentName(data.cmpName);
      components.selectStatus(data.status);
      components.enterRevision(1);

      // Uploading Thumbnail
      components.uploadThumbnail('drone.jpg');
      components.uploadThumbnail('30mb-file.png');
      components.fileSizeError('File exceeds 25mb limit');
      components.removeFailedFile();
      components.uploadAndCancelThumbnail('2mb.jpg');

      // Uploading Document
      components.uploadDocumentAndVerifyUploadToComplete('4mb.pdf');
      components.uploadDocuments('30mb-file.png');
      components.fileSizeError('File exceeds 25mb limit');
      components.removeFailedFile();
      components.uploadAndCancelDocument('drone.jpg');
      components.clickOnCreate();

      // Edit View
      components.uploadDocumentsAndAssertLoadingInEditPage('4mb.pdf');
      components.clickSaveButtonInEditComponent();
      components.verifyComponentNameAndDesignOnComponentCreation(data.cmpName, data.status);
      components.verifyLengthOfDocument(2);
      components.clickEditIcon();
      components.uploadDocumentInEditView('30mb-file.png');
      components.fileSizeErrorInEditView('File exceeds 25mb limit');
      components.uploadDocumentInEditView('10mb.pdf');
      components.cancelDocumentUploadInEditView();
    })

    it('should create component with default procurement value', () => {
      const data = {
        componentName: fakerHelper.generateProductName(),
        status: constData.status.design,
      }

      // Asserting Procurement Value
      components.enterComponentName(data.componentName);
      components.enterRevision(1);
      components.clickOnCreate();
      components.clickSaveButtonInEditComponent();
      components.verifyComponentNameAndDesignOnComponentCreation(data.componentName, data.status);
      components.verifyProcurementValueInView();
    })

    it('Component Add Another feature should work correctly on component list route', () => {
      // Create Component by checking Add Another Checkbox
      components.enterComponentName(fakerHelper.generateProductName());
      components.selectStatus(constData.status.production);
      components.enterRevision('A');
      components.checkAddAnotherOptn();
      components.clickOnCreate();
      components.verifyCreateComponentModelVisible();
    })
  })
})
