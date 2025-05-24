import { AuthApi } from "../../../api/auth";
import { SignIn } from "../../../pages/signin";
import { UsersApi } from "../../../api/userApi";
import { Navigation } from "../../../pages/navigation";
import constData from "../../../helpers/pageConstants";
import { ComponentApi } from "../../../api/componentApi";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { Products } from "../../../pages/products/products";
import { NavHelpers } from "../../../helpers/navigationHelper";
import { FeatureHelpers } from "../../../helpers/featureHelper";
import { Components } from "../../../pages/components/component";
import { ErpOptions } from "../../../pages/changeOrders/erpOptions";
import { CompanySettingsApi } from "../../../api/companySettingsApi";
import { ChangeOrders } from "../../../pages/changeOrders/changeOrder";
import compPayloads from "../../../helpers/dataHelpers/companySettingsPayloads";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const products = new Products();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const erpOptions = new ErpOptions();
const components = new Components();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

describe('Netsuite tests', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company;
      compSettings.updateCompanySettings(companyId, compPayloads.enableErpItemTypeOptions);
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  let startDate =  days => featureHelper.addDaysToToday(days);
  let endDate =  days => featureHelper.addDaysToToday(days);

  context('ERP options module - changeOrder', { tags: ['Netsuite', 'ErpOptions'] }, () => {
    it('Should show ERP options only when expands & Verify the ERP options that are added in the changeOrder ECO form', () => {
      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Verify ERP title
      erpOptions.verifyErpTitlePresent();

      // Expand ERP options
      erpOptions.expandErpOptions();

      // Verify ERP options
      erpOptions.verifyErpOptionsPresent();
      changeOrders.clickOnCancel();
    })

    it('Verify the activity of ERP for effectivity & item types', () => {
      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Expand ERP options
      erpOptions.expandErpOptions();

      // Verify ERP options
      erpOptions.verifyDisabledErpOptions();

      // Verify effectivity
      erpOptions.checkEffectivity();
      erpOptions.verifyEffectivityEnabled();

      // Verify item type
      erpOptions.checkItemType();
      erpOptions.verifyItemTypeEnabled();
      changeOrders.clickOnCancel();
    })

    it('Effectivity field should be mandatory once a field started filled', () => {
      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Expand ERP options
      erpOptions.expandErpOptions();

      // Verify the end date field mandatory
      erpOptions.checkEffectivity();
      erpOptions.enterErpStartDate(startDate(0));
      erpOptions.verifyErpEndDateTooltip('End date is required');
      changeOrders.verifySubmitForApprovalBtnDisabled();

      // Navigate to ERP options
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      erpOptions.expandErpOptions();

      // Verify the end date field mandatory
      erpOptions.checkEffectivity();
      erpOptions.enterErpEndDate(endDate(0));
      erpOptions.verifyErpStartDateTooltip('Start date is required');
      changeOrders.verifySubmitForApprovalBtnDisabled();

      // Navigate to ERP options
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      erpOptions.expandErpOptions();

      // Verify the effectivity dates logic tooltip
      erpOptions.checkEffectivity();
      erpOptions.enterErpStartDate(startDate(5));
      erpOptions.enterErpEndDate(endDate(3));
      erpOptions.verifyErpStartDateTooltip('Dates must be chronological');
      erpOptions.verifyErpEndDateTooltip('Dates must be chronological');
      changeOrders.verifySubmitForApprovalBtnDisabled();

      // Verify the effectivity dates logic tooltip
      erpOptions.checkEffectivity();
      erpOptions.enterErpStartDate(startDate(3));
      erpOptions.enterErpEndDate(endDate(5));
      erpOptions.verifyErpStartDateTooltip();
      erpOptions.verifyErpEndDateTooltip();
      changeOrders.verifySubmitForApprovalIsEnabled();
      changeOrders.clickOnCancel();
    })

    it('Verify the UI of ERP tile in component and product edit view', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '15'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'N'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Verify the ERP tile
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpOptionsNotPresent();
      products.navigateToProductViewPage(prodData.name, false);
      products.verifyEffectivityNotPresent();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');

      // Add components & products to CO
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(2), endDate(3));
      erpOptions.setErpItemType(constData.erpItemTypes.serialized);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Verify the ERP tile for component
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpTilePresent();
      components.verifyErpMessageInViewComponent();
      components.clickEditIcon();
      components.verifyErpMessageInEditComponent();
      components.clickCancelInEditCmpAfterSavingCmp();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the ERP tile for product
      products.navigateToProductViewPage(prodData.name, false);
      products.verifyErpTilePresent();
      products.verifyErpMessageInViewProduct();
      products.clickEditIcon();
      products.verifyErpMessageInEditProduct();
      products.clickCancelInEditPage();
      featureHelper.waitForLoadingIconToDisappear();
    })
  })
})

describe('Non-Netsuite tests', { tags: ['Netsuite', 'ErpOptions'] }, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    navHelper.navigateToSearch();
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company;
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('ERP options shoud be visible for all companys', () => {
    // Navigate to changeOrders
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify ERP title
    erpOptions.verifyErpTitlePresent();

    // Expand ERP options
    erpOptions.expandErpOptions();

    // Verify ERP options
    erpOptions.verifyErpOptionsPresent();
    changeOrders.clickOnCancel();
  })

  it('ERP item type should not be allowed to set without a request', () => {
   // Navigate to changeOrders
   nav.openChangeOrdersTab();
   changeOrders.clickNewBtn();
   featureHelper.waitForLoadingIconToDisappear();

   // Expand ERP options
   erpOptions.expandErpOptions();

   // Verify ERP options
   erpOptions.verifyDisabledErpOptions();

   // Verify effectivity
   erpOptions.checkEffectivity();
   erpOptions.verifyEffectivityEnabled();

   // Verify item type
   erpOptions.verifyItemTypeDisabled();
   erpOptions.verifyItemTypeDisabilityTooltip();
   changeOrders.clickOnCancel();
  })
})
