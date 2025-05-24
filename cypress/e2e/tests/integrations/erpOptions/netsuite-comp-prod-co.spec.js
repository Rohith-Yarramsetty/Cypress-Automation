import { AuthApi } from "../../../api/auth";
import { SignIn } from "../../../pages/signin";
import { UsersApi } from "../../../api/userApi";
import { Navigation } from "../../../pages/navigation";
import constData from "../../../helpers/pageConstants";
import { ComponentApi } from "../../../api/componentApi";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { Products } from "../../../pages/products/products";
import { TableHelpers } from "../../../helpers/tableHelper";
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
const tableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

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

// after(() => {
//   compSettings.deleteCompany(companyId, orgId);
// })

let startDate =  days => featureHelper.addDaysToToday(days);
let endDate =  days => featureHelper.addDaysToToday(days);

describe('Component module', { tags: ['Netsuite', 'ErpOptions'] }, () => {
  let overrideComp = ['CMP_C2_1', 'CMP_C2_2', 'CMP_C2_3', 'CMP_C2_4'],
  nonOverrideComp = [ 'CMP_C2_5', 'CMP_C2_6', 'CMP_C2_7', 'CMP_C2_8'];

  before(() => {
    authApi.signin(email);
    navHelper.navigateToSearch();
    let compData;
    for(let i=0; i<overrideComp.length; i++) {
      compData = {
          name        :  overrideComp[i],
          status      :  constData.status.prototype,
          revision    :  1
      }

      // Create component
      compApi.createComponent(compData);
    };
    for(let i=0; i<nonOverrideComp.length; i++) {
      compData = {
          name        :  nonOverrideComp[i],
          status      :  constData.status.prototype,
          revision    :  2
      }

      // Create component
      compApi.createComponent(compData);
    };
  })

  beforeEach(() => {
    // Navigate to changeOrders
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Enter ECO details
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('Desc related to CO');

    // Add components to CO
    for(let i=0; i<overrideComp.length; i++) {
      changeOrders.searchAndCheckComponentInNewChangeOrder(overrideComp[i]);
    }

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(2), endDate(3));
    erpOptions.setErpItemType(constData.erpItemTypes.standard);

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    for(let i=0; i<overrideComp.length; i++) {
      // Navigate to components view & verify ERP details
      components.navigateToComponentViewPage(overrideComp[i], false);
      components.verifyErpDetailsInViewComponent(startDate(2), endDate(3), constData.erpItemTypes.standard);
    }

    // Navigate to changeOrders
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Enter ECO details
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('Desc related to CO');
  })

  after(() => {
    compSettings.resetCompany(companyId);
  })

  it('Verify the ERP options of a component in view page when set at CO', () => {
    // Add components to CO
    changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideComp[0]);

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(0), endDate(2));
    erpOptions.setErpItemType(constData.erpItemTypes.standard);

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to component view page
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, nonOverrideComp[0]);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, nonOverrideComp[0]);
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the ERP options
    components.verifyErpStartDate(startDate(0));
    components.verifyErpEndDate(endDate(2));
    components.verifyErpType(constData.erpItemTypes.standard);
  })

  it('Verify the ERP options without overriding the components with existing ERP along with new ERP', () => {
    // Add components to CO
    changeOrders.searchAndCheckComponentInNewChangeOrder(overrideComp[0]);
    changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideComp[1]);
    changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideComp[2]);

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(2), endDate(5));
    erpOptions.setErpItemType(constData.erpItemTypes.serialized);

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to components view & verify ERP details
    components.navigateToComponentViewPage(overrideComp[0], false);
    components.verifyErpDetailsInViewComponent(startDate(2), endDate(3), constData.erpItemTypes.standard);

    // Navigate to components view & verify ERP details
    components.navigateToComponentViewPage(nonOverrideComp[1], false);
    components.verifyErpDetailsInViewComponent(startDate(2), endDate(5), constData.erpItemTypes.serialized);

    // Navigate to components view & verify ERP details
    components.navigateToComponentViewPage(nonOverrideComp[2], false);
    components.verifyErpDetailsInViewComponent(startDate(2), endDate(5), constData.erpItemTypes.serialized);
  })

  it('Verify the ERP options by overriding the components with existing ERP along with new ERP', () => {
    // Add components to CO
    for(let i=1; i<overrideComp.length; i++) {
      changeOrders.searchAndCheckComponentInNewChangeOrder(overrideComp[i]);
    };
    for(let i=1; i<nonOverrideComp.length; i++) {
      changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideComp[i]);
    }

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(1), endDate(9));
    erpOptions.setErpItemType(constData.erpItemTypes.nonInventory);

    // Override ERP options for existing components
    erpOptions.checkOverrideEffectivity();
    erpOptions.checkOverrideItemType();

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to components view & verify ERP details
    for(let i=1; i<overrideComp.length; i++) {
      components.navigateToComponentViewPage(overrideComp[i], false);
      components.verifyErpDetailsInViewComponent(startDate(1), endDate(9), constData.erpItemTypes.nonInventory);
    };
    for(let i=1; i<nonOverrideComp.length; i++) {
      components.navigateToComponentViewPage(nonOverrideComp[i], false);
      components.verifyErpDetailsInViewComponent(startDate(1), endDate(9), constData.erpItemTypes.nonInventory);
    };
  })
})

describe('Product module', { tags: ['Netsuite', 'ErpOptions'] }, () => {
  let overrideProd = ['PROD_C3_1', 'PROD_C3_2', 'PROD_C3_3', 'PROD_C3_4']
  let nonOverrideProd = [ 'PROD_C3_5', 'PROD_C3_6', 'PROD_C3_7', 'PROD_C3_8'];

  before(() => {
    authApi.signin(email);
    navHelper.navigateToSearch();
    let prodData;
    for(let i=0; i<overrideProd.length; i++) {
      prodData = {
        name        :  overrideProd[i],
        status      :  constData.status.production,
        revision    :  'D'
      }

      // Create products
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);
    };
    for(let i=0; i<nonOverrideProd.length; i++) {
      prodData = {
        name        :  nonOverrideProd[i],
        status      :  constData.status.production,
        revision    :  'R'
      }

      // Create products
      products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);
    };
  })

  beforeEach(() => {
    // Navigate to changeOrders
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Enter ECO details
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('Desc related to CO');

    // Add products to CO
    for(let i=0; i<overrideProd.length; i++) {
      changeOrders.searchAndCheckComponentInNewChangeOrder(overrideProd[i]);
    }

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(2), endDate(3));

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to components view & verify ERP details
    for(let i=0; i<overrideProd.length; i++) {
      products.navigateToProductViewPage(overrideProd[i], false);
      products.verifyErpDetailsInViewProduct(startDate(2), endDate(3));
    }

    // Navigate to changeOrders
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Enter ECO details
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('Desc related to CO');
  })

  it('Verify the ERP options of a product in view page when set at CO', () => {
    // Add product to CO
    changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideProd[0]);

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(0), endDate(2));

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to product view page
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, nonOverrideProd[0]);
    tableHelper.clickOnCell(constData.componentTableHeaders.name,nonOverrideProd[0]);
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the ERP options
    products.verifyErpStartDate(startDate(0));
    products.verifyErpEndDate(endDate(2));
  })

  it('Verify the ERP options without overriding the products with existing ERP along with new ERP', () => {
    // Add components to CO
    changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideProd[1]);
    changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideProd[2]);
    changeOrders.searchAndCheckComponentInNewChangeOrder(overrideProd[0]);

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(2), endDate(5));

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to products view & verify ERP details
    products.navigateToProductViewPage(nonOverrideProd[1], false);
    products.verifyErpDetailsInViewProduct(startDate(2), endDate(5));

    // Navigate to products view & verify ERP details
    products.navigateToProductViewPage(nonOverrideProd[2], false);
    products.verifyErpDetailsInViewProduct(startDate(2), endDate(5));

    // Navigate to products view & verify ERP details
    products.navigateToProductViewPage(overrideProd[0], false);
    products.verifyErpDetailsInViewProduct(startDate(2), endDate(3));
  })

  it('Verify the ERP options by overriding the products with existing ERP along with new ERP', () => {
    // Add products to CO
    for(let i=1; i<overrideProd.length; i++) {
      changeOrders.searchAndCheckComponentInNewChangeOrder(overrideProd[i]);
    };
    for(let i=1; i<nonOverrideProd.length; i++) {
      changeOrders.searchAndCheckComponentInNewChangeOrder(nonOverrideProd[i]);
    };

    // Set ERP options
    erpOptions.expandErpOptions();
    erpOptions.checkEffectivity();
    erpOptions.setEffectivity(startDate(1), endDate(9));

    // Override ERP options for existing components
    erpOptions.checkOverrideEffectivity();

    // Approve the changeOrder
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to products view & verify ERP details
    for(let i=1; i<overrideProd.length; i++) {
      products.navigateToProductViewPage(overrideProd[i], false);
      products.verifyErpDetailsInViewProduct(startDate(1), endDate(9));
    };
    for(let i=1; i<nonOverrideProd.length; i++) {
      products.navigateToProductViewPage(nonOverrideProd[i], false);
      products.verifyErpDetailsInViewProduct(startDate(1), endDate(9));
    }
  })
})
