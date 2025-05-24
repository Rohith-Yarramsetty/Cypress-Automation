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

describe('Netsuite tests', {defaultCommandTimeout: 120000}, () => {
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

  context('ERP options override module', { tags: ['Netsuite', 'ErpOptions'] }, () => {
    it('Verify the warning modals arosed due to effectivity override, item type override and both ERP options override to default', () => {
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

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.setEffectivity(startDate(2), endDate(3));
      erpOptions.setErpItemType(constData.erpItemTypes.lotTracked);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.checkOverrideEffectivity();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Verify the default effectivity override warning modal
      changeOrders.clickOnSubmitForApproval();
      erpOptions.verifyDefaultEffectivityOverrideWarningModal();
      erpOptions.uncheckOverrideEffectivity();
      erpOptions.uncheckEffectivity();

      // Set ERP options
      erpOptions.checkItemType();
      erpOptions.checkOverrideItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Verify the default item type override warning modal
      changeOrders.clickOnSubmitForApproval();
      erpOptions.verifyDefaultItemTypeOverrideWarningModal();

      // Set ERP options
      erpOptions.checkEffectivity();
      erpOptions.checkOverrideEffectivity();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Verify the default item type override warning modal
      changeOrders.clickOnSubmitForApproval();
      erpOptions.verifyDefaultErpOptionsOverrideWarningModal();
      changeOrders.clickOnCancel();
    })

    it('Effectivity should get overriden to default if warning is accepted', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '25'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'C'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.setEffectivity(startDate(0), endDate(330));
      erpOptions.setErpItemType(constData.erpItemTypes.lotTracked);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.checkOverrideEffectivity();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Override the Effectivity
      changeOrders.clickOnSubmitForApproval();
      erpOptions.clickOnContinue();
      changeOrders.clickApproveBtn();
      changeOrders.confirmAprroval();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyEffectivityNotPresent();
      products.navigateToProductViewPage(prodData.name);
      products.verifyEffectivityNotPresent();
    })

    it('Item type should get overriden to default if warning is accepted', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '33'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'G'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.setEffectivity(startDate(20), endDate(444));
      erpOptions.setErpItemType(constData.erpItemTypes.lotTracked);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkItemType();
      erpOptions.checkOverrideItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Override the item type
      changeOrders.clickOnSubmitForApproval();
      erpOptions.clickOnContinue();
      changeOrders.clickApproveBtn();
      changeOrders.confirmAprroval();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyItemTypeNotPresent();
    })

    it('ERP options should get overriden to default if warning is accepted', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '25'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'C'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(10), endDate(99));
      erpOptions.setErpItemType(constData.erpItemTypes.lotTracked);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.checkOverrideEffectivity();
      erpOptions.checkItemType();
      erpOptions.checkOverrideItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Override the ERP options
      changeOrders.clickOnSubmitForApproval();
      erpOptions.clickOnContinue();
      changeOrders.clickApproveBtn();
      changeOrders.confirmAprroval();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpOptionsNotPresent();
      products.navigateToProductViewPage(prodData.name);
      products.verifyEffectivityNotPresent();
    })

    it('ERP options should not get overriden to default if warning is rejected', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '25'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'C'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(1);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(2);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.setEffectivity(startDate(0), endDate(330));
      erpOptions.setErpItemType(constData.erpItemTypes.serialized);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(1);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(2);

      // Set effectivity
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.checkOverrideEffectivity();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Deny the effectivity Override
      changeOrders.clickOnSubmitForApproval();
      erpOptions.clickOnCancel();
      changeOrders.clickOnCancel();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpStartDate(startDate(0));
      components.verifyErpEndDate(endDate(330));
      products.navigateToProductViewPage(prodData.name);
      products.verifyErpDetailsInViewProduct(startDate(0), endDate(330));

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(1);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(2);

      // Set item type
      erpOptions.expandErpOptions();
      erpOptions.checkItemType();
      erpOptions.checkOverrideItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Deny the item type Override
      changeOrders.clickOnSubmitForApproval();
      erpOptions.clickOnCancel();
      changeOrders.clickOnCancel();

      // Verify the item type after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpType(constData.erpItemTypes.serialized);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(1);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);
      changeOrders.verifyNoOfRowsPresentInChangeOrderTable(2);

      // Set item type
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.checkItemType();
      erpOptions.checkOverrideEffectivity();
      erpOptions.checkOverrideItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Deny the ERP options Override
      changeOrders.clickOnSubmitForApproval();
      erpOptions.clickOnCancel();
      changeOrders.clickOnCancel();

      // Verify the ERP options after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpDetailsInViewComponent(startDate(0), endDate(330), constData.erpItemTypes.serialized);
      products.navigateToProductViewPage(prodData.name);
      products.verifyErpDetailsInViewProduct(startDate(0), endDate(330));
    })

    it('ERP options should not get overriden to default if the options are unchecked', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '77'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'G'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(100), endDate(199));
      erpOptions.setErpItemType(constData.erpItemTypes.lotTracked);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.checkEffectivity();
      erpOptions.checkOverrideEffectivity();
      erpOptions.checkItemType();
      erpOptions.checkOverrideItemType();
      erpOptions.uncheckEffectivity();
      erpOptions.uncheckItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpDetailsInViewComponent(startDate(100), endDate(199), constData.erpItemTypes.lotTracked);
      products.navigateToProductViewPage(prodData.name);
      products.verifyErpDetailsInViewProduct(startDate(100), endDate(199));
    })

    it('ERP options should not get override to new ERP if the options are unchecked & changeOrder is Approved', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '73'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'J'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(1), endDate(366));
      erpOptions.setErpItemType(constData.erpItemTypes.lotTracked);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(12), endDate(34));
      erpOptions.checkOverrideEffectivity();
      erpOptions.setErpItemType(constData.erpItemTypes.serialized);
      erpOptions.checkOverrideItemType();
      erpOptions.uncheckEffectivity();
      erpOptions.uncheckItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpDetailsInViewComponent(startDate(1), endDate(366), constData.erpItemTypes.lotTracked);
      products.navigateToProductViewPage(prodData.name);
      products.verifyErpDetailsInViewProduct(startDate(1), endDate(366));
    })

    it('ERP options should not get override to default if the options are unchecked & changeOrder is rejected or closed', () => {
      let compData = {
        name        :  fakerHelper.generateComponentName(),
        status      :  constData.status.prototype,
        revision    :  '30'
      },
      prodData = {
        name        :  fakerHelper.generateProductName(),
        status      :  constData.status.obsolete,
        revision    :  'L'
      }

      // Create component & product
      compApi.createComponent(compData);
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(1), endDate(366));
      erpOptions.setErpItemType(constData.erpItemTypes.lotTracked);

      // Approve the changeOrder
      changeOrders.approveNewChangeOrder();

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(12), endDate(34));
      erpOptions.checkOverrideEffectivity();
      erpOptions.setErpItemType(constData.erpItemTypes.serialized);
      erpOptions.checkOverrideItemType();
      erpOptions.uncheckEffectivity();
      erpOptions.uncheckItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Reject the changeOrder
      changeOrders.rejectNewChangeOrder();
      changeOrders.clickOnClose();
      changeOrders.confirmClose();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpDetailsInViewComponent(startDate(1), endDate(366), constData.erpItemTypes.lotTracked);
      products.navigateToProductViewPage(prodData.name, false);
      products.verifyErpDetailsInViewProduct(startDate(1), endDate(366));

      // Navigate to changeOrders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Enter ECO details & add components
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodData.name);

      // Set ERP options
      erpOptions.expandErpOptions();
      erpOptions.setEffectivity(startDate(12), endDate(34));
      erpOptions.checkOverrideEffectivity();
      erpOptions.setErpItemType(constData.erpItemTypes.serialized);
      erpOptions.checkOverrideItemType();
      erpOptions.uncheckEffectivity();
      erpOptions.uncheckItemType();
      changeOrders.verifySubmitForApprovalIsEnabled();

      // Close the changeOrder
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickOnClose();
      changeOrders.confirmClose();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the effectivity after override
      components.navigateToComponentViewPage(compData.name, false);
      components.verifyErpDetailsInViewComponent(startDate(1), endDate(366), constData.erpItemTypes.lotTracked);
      products.navigateToProductViewPage(prodData.name, false);
      products.verifyErpDetailsInViewProduct(startDate(1), endDate(366));
    })
  })
})
