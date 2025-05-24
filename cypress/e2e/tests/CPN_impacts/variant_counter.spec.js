import { AuthApi }             from "../../api/auth";
import { UsersApi }            from "../../api/userApi";
import { Export }              from "../../pages/export";
import { SignIn }              from "../../pages/signin";
import { Navigation }          from "../../pages/navigation";
import { ComponentApi }        from "../../api/componentApi";
import { TableHelpers }        from "../../helpers/tableHelper";
import { FeatureHelpers }      from "../../helpers/featureHelper";
import { CompanySettingsApi }  from "../../api/companySettingsApi";
import { Products }            from "../../pages/products/products";
import { Variants }            from "../../pages/components/variants";
import { Assembly }            from "../../pages/components/assembly";
import { Components }          from "../../pages/components/component";
import { ChangeOrders }        from "../../pages/changeOrders/changeOrder";
import   CPN_rules             from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries }        from "../../helpers/dataHelpers/customCpn/CPN_libraries";
import   compPayloads          from "../../helpers/dataHelpers/companySettingsPayloads";

const signin           = new SignIn();
const authApi          = new AuthApi();
const userApi          = new UsersApi();
const nav              = new Navigation();
const components       = new Components();
const cpnLibraries     = new CpnLibraries();
const featureHelper    = new FeatureHelpers();
const compSettings     = new CompanySettingsApi();
const navigation       = new Navigation();

let email, orgId, companyId, companyName;

const submit_a_component = 
(name = "Test_Cmp", status = "DESIGN", category = "Capacitor") => {
  nav.openComponentsTab();
  components.clickonCreateManually();
  components.chooseCategory(category);
  components.enterComponentName(name);
  components.selectStatus(status);
  components.clickOnCreate();
}

const check_default_CPN_variant = 
(cpnVariant = "00", isVariantExists = true, compData = {name: "Test_Cmp", status: "DESIGN", category: "Capacitor"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  if(isVariantExists) components.verifyCpnVariantInEditComponent(cpnVariant);
  else components.verifyCpnVariantFieldNotExists();
  components.clickSaveButtonInEditComponent();
  featureHelper.waitForLoadingIconToDisappear();
}

const editable_CPN_variant_field = 
(isEditable = true, name = "Test_Cmp", status = "DESIGN", category = "Capacitor") => {
  if(isEditable) {
    submit_a_component(name, status, category);
    components.enterCpnVariantInEditComponent("00");
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
  }
}

const view_page_CPN =
(cpn, compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  components.clickSaveButtonInEditComponent();
  components.verifyCpnInViewPage(cpn);
}

const restrict_CPN_duplication =
(isVariantExists = true, cpnVariant = "00", compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}) => {
  if(isVariantExists) {
    submit_a_component(compData.name, compData.status, compData.category);
    components.clickSaveButtonInEditComponent();
    components.navigateToComponentViewPage(compData.name, false);

    // Create a variant & enter existing variant counter
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    components.enterCpnVariantInEditComponent(cpnVariant);
    components.verifyCpnVariantTooltip("CPN already exists in library.");
    components.enterCpnVariantInEditComponent("99");
    components.clickSaveButtonInEditComponent();
  } else return
}

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
}

context("CPN Variant Counter", { tags: ["CPN_Impacts", "Variant_Counter"] }, () => {
  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then(res => {companyId = res.body.data.company})
    nav.openDashboard();
  })

  afterEach(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should verify the CPN variant counter functionality for: Default', () => {
    navigation.verifyNavigationMenuItems();
    // Verify default CPN
    check_default_CPN_variant("00", false);
    compSettings.resetCompany(companyId);

    // Verify variant field
    editable_CPN_variant_field(false);
    compSettings.resetCompany(companyId);

    // Verify CPN in component view page
    view_page_CPN("212-00001");
    compSettings.resetCompany(companyId);

    // CPN should not be duplicated
    restrict_CPN_duplication(false);
  })

  it('Should verify the CPN variant counter functionality for: DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00", true);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify variant field
    editable_CPN_variant_field(true);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN in component view page
    view_page_CPN("212-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // CPN should not be duplicated
    restrict_CPN_duplication(true, "00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
  })

  it('Should verify the CPN variant counter functionality for: CUSTOM_CODE_WITH_9_DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify variant field
    editable_CPN_variant_field(true);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN in component view page
    view_page_CPN("720-0001");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // CPN should not be duplicated
    restrict_CPN_duplication(true);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);
  })

  it('Should verify the CPN variant counter functionality for: CUSTOM_CODE_WITH_10_DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify variant field
    editable_CPN_variant_field(true);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN in component view page
    view_page_CPN("213-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // CPN should not be duplicated
    restrict_CPN_duplication(true);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);
  })

  it('Should verify the CPN variant counter functionality for: CUSTOM_CODE_WITH_11_DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify variant field
    editable_CPN_variant_field(true);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN in component view page
    view_page_CPN("E-CAP-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // CPN should not be duplicated
    restrict_CPN_duplication(true);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);
  })

  it('Should verify the CPN variant counter functionality for: WITH_7_DIGIT_COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00", false);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify variant field
    editable_CPN_variant_field(false);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN in component view page
    view_page_CPN("212-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // CPN should not be duplicated
    restrict_CPN_duplication(false);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);
  })

  it('Should verify the CPN variant counter functionality for: WITH_6_DIGIT_PREFIX_AND_COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name: "CMP", status: "DESIGN", category: "Adhesive"};

    // Verify default CPN
    check_default_CPN_variant("01", true, compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify variant field
    editable_CPN_variant_field(true, "Test_Cmp", "DESIGN", "Adhesive");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN in component view page
    view_page_CPN("860001-01", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // CPN should not be duplicated
    restrict_CPN_duplication(true, "01", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);
  })

  it('Should verify the CPN variant counter functionality for: FREE_FORM', { tags: ["Sphero"] }, () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00", false);
    resetAccount(CPN_rules.FREE_FORM);

    // Verify variant field
    editable_CPN_variant_field(false);
    resetAccount(CPN_rules.FREE_FORM);
  })

  it('Should verify the CPN variant counter functionality for: PROD_WITH_PREFIX_900', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.PROD_WITH_PREFIX_900);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("PROD-WITH-PREFIX-900"));
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00", false);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify variant field
    editable_CPN_variant_field(false);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify CPN in component view page
    view_page_CPN("212-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // CPN should not be duplicated
    restrict_CPN_duplication(false);
  })

  it('Should verify the CPN variant counter functionality for: WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name     : "Test-Cmp",
                      status   : "DESIGN",
                      category : "Incoming Quality Control"};

    // Verify default CPN
    check_default_CPN_variant("00", false, compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify variant field
    editable_CPN_variant_field(false);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN in component view page
    view_page_CPN("IQC-000001", compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // CPN should not be duplicated
    restrict_CPN_duplication(false);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);
  })

  it('Should verify the CPN variant counter functionality for: CONDITIONAL_01_VARIANT', () => {
     // Configure company with CPN rules & CPN schemes
     cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
     compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
     compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
     compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
     authApi.reSignin();

     // Verify default CPN
    check_default_CPN_variant("01", true);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify variant field
    editable_CPN_variant_field(true);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN in component view page
    view_page_CPN("212-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // CPN should not be duplicated
    restrict_CPN_duplication(false);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);
  })

  it('Should verify the CPN variant counter functionality for: HYBRID_WITH_6_DIGIT_CPN', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00", false);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify variant field
    editable_CPN_variant_field(false);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN in component view page
    view_page_CPN("910001");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // CPN should not be duplicated
    restrict_CPN_duplication(false);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);
  })

  it('Should verify the CPN variant counter functionality for: NON_INTELLIGENT_CPN_WITHOUT_VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'DEFAULT'));
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00", false);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify variant field
    editable_CPN_variant_field(false);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN in component view page
    view_page_CPN("10000");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // CPN should not be duplicated
    restrict_CPN_duplication(false);
  })

  it('Should verify the CPN variant counter functionality for: NON_INTELLIGENT_CPN_WITH_VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.nonIntelligentCpn("variantStartingIndex", "00"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Verify default CPN
    check_default_CPN_variant("00", true);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify variant field
    editable_CPN_variant_field(true);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN in component view page
    view_page_CPN("10000-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // CPN should not be duplicated
    restrict_CPN_duplication(true);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
  })
})
