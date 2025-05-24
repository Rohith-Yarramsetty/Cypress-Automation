import { AuthApi }             from "../../api/auth";
import { UsersApi }            from "../../api/userApi";
import { SignIn }              from "../../pages/signin";
import { Navigation }          from "../../pages/navigation";
import { TableHelpers }        from "../../helpers/tableHelper";
import { FeatureHelpers }      from "../../helpers/featureHelper";
import { CompanySettingsApi }  from "../../api/companySettingsApi";
import { Products }            from "../../pages/products/products";
import { Components }          from "../../pages/components/component";
import { CpnLibraries }        from "../../helpers/dataHelpers/customCpn/CPN_libraries";
import CPN_rules               from "../../helpers/dataHelpers/customCpn/CPN_rules";
import compPayloads            from "../../helpers/dataHelpers/companySettingsPayloads";
import prodSelectors           from "../../selectors/products/products";
import selectors               from "../../selectors/components/component";

const signin           = new SignIn();
const authApi          = new AuthApi();
const userApi          = new UsersApi();
const products         = new Products();
const nav              = new Navigation();
const components       = new Components();
const tableHelpers     = new TableHelpers();
const cpnLibraries     = new CpnLibraries();
const featureHelper    = new FeatureHelpers();
const compSettings     = new CompanySettingsApi();
const navigation       = new Navigation();

let email, orgId, companyId, companyName;

const submit_a_product = ({ prodName = "Test_Item", status = "DESIGN", category = "Electrical" } = {}) => {
  nav.openProductTab()
  products.clickNewButton();
  products.checkCategoryItem(category);
  products.enterProductName(prodName);
  products.selectLifeCycleStatus(status);
  products.clickCreateButton();
}

const submit_a_component = ({ name = "Test_Item", status = "DESIGN", category = "Capacitor" } = {}) => {
  nav.openComponentsTab();
  components.clickonCreateManually();
  components.chooseCategory(category);
  components.enterComponentName(name);
  components.selectStatus(status);
  components.clickOnCreate();
};

const duplicateProductInSearchPage = (cpn, data = {name: undefined, status: undefined, category: undefined}) => {
  submit_a_product(data.name, data.status, data.category);
  products.clickSaveButtonInEditProduct(2000);
  nav.openProductTab();
  tableHelpers.checkTableRow(data.name);
  featureHelper.duplicateProdOrCompInSearchPage();
  products.navigateToProductViewPage(cpn, false);
  featureHelper.assertText(prodSelectors.viewProduct.cpnValue, cpn);
};

const duplicateComponentInSearchPage = (cpn, data = {name: undefined, status: undefined, category: undefined}) => {
  submit_a_component(data);
  components.clickSaveButtonInEditComponent(2000);
  nav.openComponentsTab();
  tableHelpers.checkTableRow(data.name);
  featureHelper.duplicateProdOrCompInSearchPage();
  components.navigateToComponentViewPage(cpn, false);
  featureHelper.assertText(selectors.viewComponent.cpnValue, cpn);
};

const deleteProductInViewPage = (cpn, data = {name: undefined, status: undefined, category: undefined}) => {
  submit_a_product(data);
  products.clickSaveButtonInEditProduct();
  products.deleteProduct();
  nav.openProductTab(data.name);
  components.enterSearchTerm(cpn);
  tableHelpers.assertRowNotPresentInTable('cpn', cpn);
};

const deleteComponentInViewPage = (cpn, data = {name: undefined, status: undefined, category: undefined}) => {
  submit_a_component(data);
  components.clickSaveButtonInEditComponent();
  components.deleteComponentFromDetailsPage();
  nav.openComponentsTab(data.name);
  components.enterSearchTerm(cpn);
  tableHelpers.assertRowNotPresentInTable('cpn', cpn);
};

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
};

context("CPN Schemes", { tags: ['CPN_Impacts', 'CPN_Impacts_Four'] }, () => {
  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    companyName = user.companyName;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then(res => {companyId = res.body.data.company})
    nav.openDashboard();
  })

  afterEach(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should verify the CPN functionality for: Default', () => {
    navigation.verifyNavigationMenuItems();
    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("999-00002", prodData);
    compSettings.resetCompany(companyId);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("212-00002", compData);
    compSettings.resetCompany(companyId);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-00001", prodData);
    compSettings.resetCompany(companyId);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("212-00001", compData);
    compSettings.resetCompany(companyId);
  })

  it('Should verify the CPN functionality for: DEFAULT with EXTRA-TWO-DIGIT-VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("999-00002-00", prodData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("212-00002-00", compData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("212-00001-00", compData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-00001-00", prodData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-9-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("999-0002-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("720-0002", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("720-0001", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-0002-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-10-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("999-00002-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("213-00002-00", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("213-00002-00", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-00001-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-11-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Cable Assembly"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("A-FGS-00002-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("A-CAB-00002-00", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("A-CAB-00001-00", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("A-FGS-00001-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);
  })

  it('Should verify the CPN functionality for: WITH-7-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("999-0000002", prodData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("212-0000002",compData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("212-0000001",compData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-0000001", prodData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);
  })

  it('Should verify the CPN functionality for: WITH-6-DIGIT-PREFIX-AND-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name: "Test_Item", status: "DESIGN", category: "Wire"};
    const ProdData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("150002-01", ProdData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("210002-01", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("210001-01", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("150001-01", ProdData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);
  })

  it('Should verify the CPN functionality for: FREE-FORM', { tags: ["Sphero"] }, () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN not present for deleted component
    submit_a_component(compData);
    components.clickSaveButtonInEditComponent();
    components.getCpnValueFromEditViewPage().then((cpnValue) => {
      components.deleteComponentFromDetailsPage();
      nav.openComponentsTab(compData.name);
      components.enterSearchTerm(cpnValue);
      tableHelpers.assertRowNotPresentInTable('cpn', cpnValue);
    })
    resetAccount(CPN_rules.FREE_FORM);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-00001", prodData);
    submit_a_product(prodData);
    products.clickSaveButtonInEditProduct();
    products.getCpnValueFromEditViewPage().then((cpnValue) => {
      products.deleteProduct();
      nav.openProductTab(prodData.name);
      components.enterSearchTerm(cpnValue);
      tableHelpers.assertRowNotPresentInTable('cpn', cpnValue);
    })
  })

  it('Should verify the CPN functionality for: PROD-WITH-PREFIX-900', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.PROD_WITH_PREFIX_900);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("PROD-WITH-PREFIX-900"));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("900-00002", prodData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("212-00002", compData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("212-00001", compData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("900-00001", prodData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);
  })

  it('Should verify the CPN functionality for: WITH-1-OR-3-DIGIT-PREFIX-AND-6-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Incoming Quality Control"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("999-000002", prodData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("IQC-000002", compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("IQC-000001", compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-000001", prodData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);
  })

  it('Should verify the CPN functionality for: CONDITIONAL-01-VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("999-00002", prodData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("212-00002", compData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("212-00001", compData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("999-00001", prodData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);
  })

  it('Should verify the CPN functionality for: HYBRID-WITH-6-DIGIT-CPN', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("110001", prodData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("910001", compData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("910000", compData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("110000", prodData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);
  })

  it('Should verify the CPN functionality for: NON-INTELLIGENT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'DEFAULT'));
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("10001", prodData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("10001", compData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("10000", compData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("10000", prodData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
  })

  it('Should verify the CPN functionality for: NON-INTELLIGENT with variant', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.nonIntelligentCpn("variantStartingIndex", "00"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN for duplicate product
    duplicateProductInSearchPage("10001-00", prodData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN for duplicate component
    duplicateComponentInSearchPage("10001-00", compData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInViewPage("10000-00", compData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInViewPage("10000-00", prodData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
  })
})
