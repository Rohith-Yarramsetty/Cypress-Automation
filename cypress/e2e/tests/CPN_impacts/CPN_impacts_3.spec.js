import { AuthApi }             from "../../api/auth";
import { UsersApi }            from "../../api/userApi";
import { SignIn }              from "../../pages/signin";
import { Navigation }          from "../../pages/navigation";
import { ComponentApi }        from "../../api/componentApi";
import { FeatureHelpers }      from "../../helpers/featureHelper";
import { CompanySettingsApi }  from "../../api/companySettingsApi";
import { Products }            from "../../pages/products/products";
import { Components }          from "../../pages/components/component";
import { ChangeOrders }        from "../../pages/changeOrders/changeOrder";
import   CPN_rules             from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries }        from "../../helpers/dataHelpers/customCpn/CPN_libraries";
import   compPayloads          from "../../helpers/dataHelpers/companySettingsPayloads";

const signin           = new SignIn();
const authApi          = new AuthApi();
const userApi          = new UsersApi();
const products         = new Products();
const nav              = new Navigation();
const components       = new Components();
const compApi          = new ComponentApi();
const cpnLibraries     = new CpnLibraries();
const changeOrder      = new ChangeOrders();
const featureHelper    = new FeatureHelpers();
const compSettings     = new CompanySettingsApi();
const navigation       = new Navigation();

let email, orgId, companyId, companyName;

const submit_a_component = (name = "Test_Cmp", status = "DESIGN", category = "Capacitor") => {
  nav.openComponentsTab();
  components.clickonCreateManually();
  components.chooseCategory(category);
  components.enterComponentName(name);
  components.selectStatus(status);
  components.clickOnCreate();
}

const update_component_and_verify_CPN = 
  (cpn, compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  components.clickSaveButtonInEditComponent();

  // Create a duplicate & verify CPN
  components.clickEditIcon();
  components.selectStatusInEditView("PROTOTYPE");
  components.clickContinueBtnInSaveAsRevisionModal();
  components.enterDescriptionInEditComponent("my test desc");
  components.clickSaveButtonInEditComponent();
  featureHelper.waitForLoadingIconToDisappear();
  components.verifyCpnInViewPage(cpn);
}

const create_and_update_product_and_verify_CPN = (prodCpn) => {
  products.createAndSaveBasicProduct();
  products.verifyCpnInViewPage(prodCpn);
  products.clickEditIcon();
  products.selectStatusInEditView("PROTOTYPE");
  products.clickContinueBtnInSaveAsRevisionModal();
  products.enterDescriptionInProductEditPage("my test desc");
  products.clickSaveButtonInEditProduct();
  featureHelper.waitForLoadingIconToDisappear();
  products.verifyCpnInViewPage(prodCpn);
}

const import_cmp_through_vendor_and_verify_CPN = 
  (cpn, category = "Resistor", mpn = "RC0603JR-0710KL") => {
  nav.openComponentsTab();
  components.clickOnImportFromVendor();
  components.chooseCategoryInImportVendorPage(category);
  components.enterMpn(mpn);
  components.clickOnCreate();
  components.clickSaveButtonInEditComponent();
  featureHelper.waitForLoadingIconToDisappear();
  components.verifyCpnInViewPage(cpn);
}

const verify_prod_and_comp_CPN_at_ECO =
  (cpnData, compData = {name: "Test_Cmp", status: "PROTOTYPE", category: "Capacitor"}, prodData = {name: "TestProduct", status: "PROTOTYPE", revision: "1"}) => {
  compApi.createComponent(compData);
  products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

  // Create a changeOrder
  nav.openChangeOrdersTab();
  changeOrder.clickNewBtn();
  changeOrder.enterNameInEcoModal("Test_ECO");
  changeOrder.searchAndCheckComponentInNewChangeOrder(compData.name);
  changeOrder.searchAndCheckComponentInNewChangeOrder(prodData.name);

  // Approve the changeOrder
  const date = new Date();
  changeOrder.approveNewChangeOrder();

  // Verify the CPNs at exported email
  changeOrder.getChangeOrderNameAfterResendCo().then((ecoName) => {
    let mailSubject = ecoName + " APPROVED from " + companyName;
    featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
      expect(email.html.codes[2].value).to.eq(cpnData.compCpn);
      expect(email.html.codes[3].value).to.eq(cpnData.prodCpn);
    })
  })
}

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
}

context("CPN Schemes", { tags: ["CPN_Impacts", "CPN_Impacts_Three"]}, () => {
  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    companyName = user.companyName;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then(res => {companyId = res.body.data.company})
    nav.openDashboard();
  });

  afterEach(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should verify the CPN functionality for: Default', () => {
    navigation.verifyNavigationMenuItems();
    // Create and update the component and verify CPN
    update_component_and_verify_CPN("212-00001");
    compSettings.resetCompany(companyId);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("999-00001");
    compSettings.resetCompany(companyId);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("232-00001");
    compSettings.resetCompany(companyId);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "212-00001", prodCpn: "999-00001"});
  });

  it('Should verify the CPN functionality for: DEFAULT with EXTRA-TWO-DIGIT-VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("212-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("999-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("232-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "212-00001-00", prodCpn: "999-00001-00"});
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-9-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("720-0001");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("999-0001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("710-0001");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "720-0001", prodCpn: "999-0001-00"});
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-10-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("213-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("999-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("238-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "213-00001-00", prodCpn: "999-00001-00"});
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-11-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("E-CAP-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("A-FGS-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("E-RES-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "E-CAP-00001-00", prodCpn: "A-FGS-00001-00"});
  });

  it('Should verify the CPN functionality for: WITH-7-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("212-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("999-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("232-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "212-0000001", prodCpn: "999-0000001"});
  });

  it('Should verify the CPN functionality for: WITH-6-DIGIT-PREFIX-AND-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    let compData = {name: "CMP", status: "DESIGN", category: "Adhesive"};

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("860001-01", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("150001-01");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("210001-01", "Wire");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "860001-01", prodCpn: "150001-01"},
                                    {name: "CMP", status: "PROTOTYPE", category: "Adhesive"});
  });

  it('Should verify the CPN functionality for: FREE-FORM', { tags: ["Sphero"] }, () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();

    let compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}

    // Create and update the component and verify CPN
    compApi.createComponent(compData);
    components.navigateToComponentEditPage(compData.name, false);
    components.selectStatusInEditView("PROTOTYPE");
    components.clickContinueBtnInSaveAsRevisionModal();
    components.enterDescriptionInEditComponent("my test desc");
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
    resetAccount(CPN_rules.FREE_FORM);

    // Create and update the product and verify CPN
    products.createAndSaveBasicProduct();
    products.clickEditIcon();
    products.selectStatusInEditView("PROTOTYPE");
    products.clickContinueBtnInSaveAsRevisionModal();
    products.enterDescriptionInProductEditPage("my test desc");
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();
    products.getCpnValueFromEditViewPage().then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
    resetAccount(CPN_rules.FREE_FORM);

    // Import the component through vendor and verify CPN
    nav.openComponentsTab();
    components.clickOnImportFromVendor();
    components.chooseCategoryInImportVendorPage("Resistor");
    components.enterMpn("RC0603JR-0710KL");
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
    resetAccount(CPN_rules.FREE_FORM);
  });

  it('Should verify the CPN functionality for: PROD-WITH-PREFIX-900', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.PROD_WITH_PREFIX_900);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("PROD-WITH-PREFIX-900"));
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("212-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("900-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("232-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "212-00001", prodCpn: "900-00001"});
  });

  it('Should verify the CPN functionality for: WITH-1-OR-3-DIGIT-PREFIX-AND-6-DIGIT-COUNTER', () => {
    let compData;
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("IQC-000001", compData = {name: "CMP", status: "DESIGN", category: "Incoming Quality Control"});
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("999-000001");
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("E-000001", "OTS Electrical");
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "IQC-000001", prodCpn: "999-000001"},
                                    {name: "CMP", status: "PROTOTYPE", category: "Incoming Quality Control"});
  });

  it('Should verify the CPN functionality for: CONDITIONAL-01-VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("212-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("999-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("232-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "212-00001", prodCpn: "999-00001"});
  });

  it('Should verify the CPN functionality for: HYBRID-WITH-6-DIGIT-CPN', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);
    navigation.verifyNavigationMenuItems();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("910001");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("110001");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "910001", prodCpn: "110001"});
  });

  it('Should verify the CPN functionality for: NON-INTELLIGENT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'DEFAULT'));
    navigation.verifyNavigationMenuItems();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("10000");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("10000");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("10000");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "10000", prodCpn: "10001"});
  });

  it('Should verify the CPN functionality for: NON-INTELLIGENT with variant', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.nonIntelligentCpn("variantStartingIndex", "00"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and update the component and verify CPN
    update_component_and_verify_CPN("10000-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Create and update the product and verify CPN
    create_and_update_product_and_verify_CPN("10000-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Import the component through vendor and verify CPN
    import_cmp_through_vendor_and_verify_CPN("10000-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN at ECO approver email
    verify_prod_and_comp_CPN_at_ECO({compCpn: "10000-00", prodCpn: "10001-00"});
  });
});
