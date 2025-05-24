import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { Products } from "../../pages/products/products";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const product = new Products();

let email, companyId, orgId;

describe("Revisions History table test cases", () => {
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

  beforeEach(() => {
    authApi.signin(email)
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
 })

  context('Products module', () => {
    it('Should not fetch sub revisions directly after clicking on History icon', () => {
      const productName = fakerHelper.generateProductName();

      // Create a Product
      nav.openProductTab();
      product.createBasicProduct(productName);

      // Click on edit and click on Save as revision and save the product
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, productName);
      product.clickEditIcon();
      product.clickSaveAsRevisionBtn();
      product.enterRevisionInSaveAsRevisionModal(1);
      product.clickContinueBtnInSaveAsRevisionModal();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Prototype and verify
      product.clickEditIcon();
      product.selectStatusInEditView(constData.status.prototype);
      product.clickContinueBtnInSaveAsRevisionModal();
      product.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Production and verify
      product.clickEditIcon();
      product.selectStatusInEditView(constData.status.production);
      product.clickContinueBtnInSaveAsRevisionModal();
      product.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Click on history icon and verify sub-revisions not fetched
      product.clickOnHistoryIconInViewPage();
      product.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Should not fetch sub revisions
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionsFetched();
      product.clickOnHistoryIconInViewPage(); // To close history table
      product.clickOnHistoryIconInViewPage(); // To open history table
      product.verifySubRevisionsNotFetched();

      // Click on Previous revision and go to revisions page
      product.clickOnPreviousRevision(3);
      featureHelper.waitForLoadingIconToDisappear();

      // Click on history icon and verify sub revisions not fetched
      product.clickOnHistoryIconInViewPage();
      product.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Should not fetch sub revisions
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionsFetched();
      product.clickOnHistoryIconInViewPage(); // To close history table
      product.clickOnHistoryIconInViewPage(); // To open history table
      product.verifySubRevisionsNotFetched();

      // Go to compare revisions page and Verify
      product.clickOnCompareRevision();
      featureHelper.waitForLoadingIconToDisappear();

      // Click on history icon and verify sub revisions not fetched
      product.clickOnHistoryIconInCompareRevisionPage();
      product.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Should not fetch sub revisions
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionsFetched();
      product.clickOnHistoryIconInCompareRevisionPage(); // To close history table
      product.clickOnHistoryIconInCompareRevisionPage(); // To open history table
      product.verifySubRevisionsNotFetched();
    })

    it('Should have Lazy loading when we are fetching sub revisions at product view page/revision page/compare revision page', () => {
      const productName = fakerHelper.generateProductName();

      // Create a Product
      nav.openProductTab();
      product.createBasicProduct(productName);

      // Click on edit and click on Save as revision and save the product
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, productName);
      product.clickEditIcon();
      product.clickSaveAsRevisionBtn();
      product.enterRevisionInSaveAsRevisionModal(1);
      product.clickContinueBtnInSaveAsRevisionModal();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Prototype and verify
      product.clickEditIcon();
      product.selectStatusInEditView(constData.status.prototype);
      product.clickContinueBtnInSaveAsRevisionModal();
      product.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Production and verify
      product.clickEditIcon();
      product.selectStatusInEditView(constData.status.production);
      product.clickContinueBtnInSaveAsRevisionModal();
      product.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify History table loading and Sub-Revisions lazy loading present
      product.clickOnHistoryIconInViewPage();
      product.verifyHistoryTableLoadingIconPresent();
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingPresent();
      product.clickOnHistoryIconInViewPage();

      // Verify History table loading and Sub-Revisions lazy loading not present
      product.clickOnHistoryIconInViewPage();
      product.verifyHistoryTableLoadingIconNotPresent();
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingNotPresent();

      // Go to revisions page
      product.clickOnPreviousRevision(3);
      featureHelper.waitForLoadingIconToDisappear();

      // Verify History table loading and Sub-Revisions lazy loading present
      product.clickOnHistoryIconInViewPage();
      product.verifyHistoryTableLoadingIconPresent();
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingPresent();
      product.clickOnHistoryIconInViewPage();

      // Verify History table loading and Sub-Revisions lazy loading not present
      product.clickOnHistoryIconInViewPage();
      product.verifyHistoryTableLoadingIconNotPresent();
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingNotPresent();

      // Go to compare revisions page
      product.clickOnCompareRevision();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify History table loading and Sub-Revisions lazy loading present
      product.clickOnHistoryIconInCompareRevisionPage();
      product.verifyHistoryTableLoadingIconPresent();
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingPresent();
      product.clickOnHistoryIconInCompareRevisionPage();

      // Verify History table loading and Sub-Revisions lazy loading not present
      product.clickOnHistoryIconInCompareRevisionPage();
      product.verifyHistoryTableLoadingIconNotPresent();
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingNotPresent();
    })

    it('Should automatically fetch the sub revisions when we open the product from sub revision', () => {
      const productName = fakerHelper.generateProductName();

      // Create a Product
      nav.openProductTab();
      product.createBasicProduct(productName);

      // Click on edit and click on Save as revision and save the product
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, productName);
      product.clickEditIcon();
      product.clickSaveAsRevisionBtn();
      product.enterRevisionInSaveAsRevisionModal(1);
      product.clickContinueBtnInSaveAsRevisionModal();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Prototype and verify
      product.clickEditIcon();
      product.selectStatusInEditView(constData.status.prototype);
      product.clickContinueBtnInSaveAsRevisionModal();
      product.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Production and verify
      product.clickEditIcon();
      product.selectStatusInEditView(constData.status.production);
      product.clickContinueBtnInSaveAsRevisionModal();
      product.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Sub revision fetched when we open the product from sub revision
      product.clickOnHistoryIconInViewPage();
      product.verifyHistoryTableLoadingIconPresent()
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingPresent();
      product.clickOnPreviousRevision(2);
      featureHelper.waitForLoadingIconToDisappear();
      product.clickOnHistoryIconInViewPage();
      product.verifySubRevisionsFetched();

      // Go to compare revisions page
      product.clickOnCompareRevision();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Sub revision fetched when we open the product from sub revision
      product.clickOnHistoryIconInCompareRevisionPage();
      product.verifyHistoryTableLoadingIconPresent()
      product.clickOnRevisionExpandIcon();
      product.verifySubRevisionLazyLoadingPresent();
      product.clickOnPreviousRevision(2);
      featureHelper.waitForLoadingIconToDisappear();
      product.clickOnHistoryIconInViewPage();
      product.verifySubRevisionsFetched();
    })
  })

  context('Components module', () => {
    let cmpData;

    beforeEach(() => {
      cmpData = {
        name: fakerHelper.generateProductName(),
        category: 'Capacitor',
        status: constData.status.design,
      }

      // Create a Component
      compApi.createComponent(cmpData);

      // Click on edit and click on Save as revision and save the component
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickEditIcon();
      components.clickSaveAsRevisionBtn();
      components.enterRevisionInSaveAsRevisionModal(1);
      components.clickContinueBtnInSaveAsRevisionModal();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Prototype and verify
      components.clickEditIcon();
      components.selectStatusInEditView(constData.status.prototype);
      components.clickContinueBtnInSaveAsRevisionModal();
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyStatusInViewComponent(constData.status.prototype);

      // Change the status to Production and verify
      components.clickEditIcon();
      components.selectStatusInEditView(constData.status.production);
      components.clickContinueBtnInSaveAsRevisionModal();
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyStatusInViewComponent(constData.status.production);
    })

    it('Should not fetch sub revisions directly after clicking on History icon', () => {
      // Click on history icon and verify sub-revisions not fetched
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickOnHistoryIcon();
      components.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Should not fetch sub revisions
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionsFetched();
      components.clickOnHistoryIcon(); // To close history table
      components.clickOnHistoryIcon(); // To open history table
      components.verifySubRevisionsNotFetched();

      // Click on Previous revision and go to revisions page
      components.clickOnPreviousRevision(3);
      featureHelper.waitForLoadingIconToDisappear();

      // Click on history icon and verify sub revisions not fetched
      components.clickOnHistoryIcon();
      components.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Should not fetch sub revisions
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionsFetched();
      components.clickOnHistoryIcon(); // To close history table
      components.clickOnHistoryIcon(); // To open history table
      components.verifySubRevisionsNotFetched();

      // Go to compare revisions page and Verify
      components.clickOnCompareRevision();
      featureHelper.waitForLoadingIconToDisappear();

      // Click on history icon and verify sub revisions not fetched
      components.clickOnHistoryIconInCompareRevisionPage();
      components.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Should not fetch sub revisions
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionsFetched();
      components.clickOnHistoryIconInCompareRevisionPage(); // To close history table
      components.clickOnHistoryIconInCompareRevisionPage(); // To open history table
      components.verifySubRevisionsNotFetched();
    })

    it('Should have Lazy loading when we are fetching sub revisions at component view page/revision page/compare revision page', () => {
      // Verify History table loading and Sub-Revisions lazy loading present
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickOnHistoryIcon();
      components.verifyHistoryTableLoadingIconPresent();
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.clickOnHistoryIcon();

      // Verify History table loading and Sub-Revisions lazy loading not present
      components.clickOnHistoryIcon();
      components.verifyHistoryTableLoadingIconNotPresent();
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingNotPresent();

      // Go to revisions page
      components.clickOnPreviousRevision(3);
      featureHelper.waitForLoadingIconToDisappear();

      // Verify History table loading and Sub-Revisions lazy loading present
      components.clickOnHistoryIcon();
      components.verifyHistoryTableLoadingIconPresent();
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.clickOnHistoryIcon();

      // Verify History table loading and Sub-Revisions lazy loading not present
      components.clickOnHistoryIcon();
      components.verifyHistoryTableLoadingIconNotPresent();
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingNotPresent();

      // Go to compare revisions page
      components.clickOnCompareRevision();
      featureHelper.waitForLoadingIconToDisappear();
  
      // Verify History table loading and Sub-Revisions lazy loading present
      components.clickOnHistoryIconInCompareRevisionPage();
      components.verifyHistoryTableLoadingIconPresent();
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.clickOnHistoryIconInCompareRevisionPage();
  
      // Verify History table loading and Sub-Revisions lazy loading not present
      components.clickOnHistoryIconInCompareRevisionPage();
      components.verifyHistoryTableLoadingIconNotPresent();
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingNotPresent();
    })
  
    it('Should automatically fetch the sub revisions when we open the component from sub revision', () => {
      // Verify Sub revision fetched when we open the component from sub revision
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickOnHistoryIcon();
      components.verifyHistoryTableLoadingIconPresent()
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.clickOnPreviousRevision(2);
      featureHelper.waitForLoadingIconToDisappear();
      components.clickOnHistoryIcon();
      components.verifySubRevisionsFetched();

      // Go to compare revisions page
      components.clickOnCompareRevision();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Sub revision fetched when we open the component from sub revision
      components.clickOnHistoryIconInCompareRevisionPage();
      components.verifyHistoryTableLoadingIconPresent()
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.clickOnPreviousRevision(2);
      featureHelper.waitForLoadingIconToDisappear();
      components.clickOnHistoryIcon();
      components.verifySubRevisionsFetched();
    })
  })

  context('Components- Roles module', () => {
    let cmpData;

    beforeEach(() => {
      cmpData = {
        name: fakerHelper.generateProductName(),
        category: 'Capacitor',
        status: constData.status.design,
      }

      // Create a Component
      compApi.createComponent(cmpData);

      // Click on edit and click on Save as revision and save the component
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickEditIcon();
      components.clickSaveAsRevisionBtn();
      components.enterRevisionInSaveAsRevisionModal(1);
      components.clickContinueBtnInSaveAsRevisionModal();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status to Prototype and verify
      components.clickEditIcon();
      components.selectStatusInEditView(constData.status.prototype);
      components.clickContinueBtnInSaveAsRevisionModal();
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyStatusInViewComponent(constData.status.prototype);

      // Change the status to Production and verify
      components.clickEditIcon();
      components.selectStatusInEditView(constData.status.production);
      components.clickContinueBtnInSaveAsRevisionModal();
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyStatusInViewComponent(constData.status.production);
    })

    afterEach(() => {
      // Click on history icon and verify History table loading icon and sub-revisions not fetched
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickOnHistoryIcon();
      components.verifyHistoryTableLoadingIconPresent();
      components.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Verify sub revisions lazy loading and Should not fetch sub revisions
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.verifySubRevisionsFetched();
      components.clickOnHistoryIcon(); // To close history table
      components.clickOnHistoryIcon(); // To open history table
      components.verifyHistoryTableLoadingIconNotPresent();
      components.verifySubRevisionsNotFetched();

      // Click on Previous revision and go to revisions page
      components.clickOnPreviousRevision(3);
      featureHelper.waitForLoadingIconToDisappear();

      // Click on history icon and verify History table loading icon and sub revisions not fetched
      components.clickOnHistoryIcon();
      components.verifyHistoryTableLoadingIconPresent();
      components.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Verify sub revisions lazy loading and Should not fetch sub revisions
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.verifySubRevisionsFetched();
      components.clickOnHistoryIcon(); // To close history table
      components.clickOnHistoryIcon(); // To open history table
      components.verifyHistoryTableLoadingIconNotPresent();
      components.verifySubRevisionsNotFetched();

      // Go to compare revisions page and Verify
      components.clickOnCompareRevision();
      featureHelper.waitForLoadingIconToDisappear();

      // Click on history icon and verify history table loading icon and sub revisions not fetched
      components.clickOnHistoryIconInCompareRevisionPage();
      components.verifyHistoryTableLoadingIconPresent();
      components.verifySubRevisionsNotFetched();

      // Fetch sub-revisions and close history table and click on history icon
      // Verify sub revisions lazy loading and Should not fetch sub revisions
      components.clickOnRevisionExpandIcon();
      components.verifySubRevisionLazyLoadingPresent();
      components.verifySubRevisionsFetched();
      components.clickOnHistoryIconInCompareRevisionPage(); // To close history table
      components.clickOnHistoryIconInCompareRevisionPage(); // To open history table
      components.verifyHistoryTableLoadingIconNotPresent();
      components.verifySubRevisionsNotFetched();
    })

    it('Components-User Role: Should not fetch sub revisions directly and Should have lazy loading for sub revisions', () => {
      // Create user with user role
      const userEmail = userApi.createUserUsingApi().email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created user with user role
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);
    })

    it('Components-Approver Role: Should not fetch sub revisions directly and Should have lazy loading for sub revisions', () => {
      // Create user with approver role
      const userEmail = userApi.createUserUsingApi('APPROVER').email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created user with approver role
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);
    })
  
    it('Components-Reviewer Role: Should not fetch sub revisions directly and Should have lazy loading for sub revisions', () => {
      // Create user with reviewer role
      const userEmail = userApi.createUserUsingApi('REVIEWER').email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created user with reviewer role
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);
    })

    it('Components-Supplier Role: Should not fetch sub revisions directly and Should have lazy loading for sub revisions', () => {
      // Create user with supplier role
      const userEmail = userApi.createUserUsingApi('SUPPLIER').email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created user with supplier role
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);
    })

    it('Components-Vendor Role: Should not fetch sub revisions directly and Should have lazy loading for sub revisions', () => {
      // Create user with vendor role
      const userEmail = userApi.createUserUsingApi('VENDOR').email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created user with vendor role
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);
    })
  })
})
