import { AuthApi }             from "../../api/auth";
import { UsersApi }            from "../../api/userApi";
import { SignIn }              from "../../pages/signin";
import { Navigation }          from "../../pages/navigation";
import { FeatureHelpers }      from "../../helpers/featureHelper";
import { CompanySettingsApi }  from "../../api/companySettingsApi";
import { Products }            from "../../pages/products/products";
import { Assembly }            from "../../pages/components/assembly";
import { Components }          from "../../pages/components/component";
import { ImportFromFile }      from "../../pages/components/importFromFile";
import   CPN_rules             from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries }        from "../../helpers/dataHelpers/customCpn/CPN_libraries";
import   compPayloads          from "../../helpers/dataHelpers/companySettingsPayloads";
import   constData             from "../../helpers/pageConstants";

const signin           = new SignIn();
const authApi          = new AuthApi();
const userApi          = new UsersApi();    
const assembly         = new Assembly();
const products         = new Products();
const nav              = new Navigation();
const components       = new Components();
const cpnLibraries     = new CpnLibraries();
const importFromFile   = new ImportFromFile();
const featureHelper    = new FeatureHelpers();
const compSettings     = new CompanySettingsApi();
const navigation       = new Navigation();

let email, orgId, companyId, companyName;

const submit_a_product = (name = "TestProduct", status = "DESIGN", revision = "1") => {
  nav.openProductTab();
  products.clickNewButton();
  products.enterProductName(name);
  products.selectLifeCycleStatus(status);
  products.enterRevision(revision);
  products.clickCreateButton();
}

const add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN = 
  (prodCpn, file = 'cpn/twoAssemblyCmps.xlsx') => {
  submit_a_product();
  assembly.clickOnAssemblyTab();
  assembly.clickOnImportFromFile();
  assembly.uploadFile(file);
  importFromFile.clickOnContinue();
  importFromFile.verifyNoErrorsAfterValidation();
  importFromFile.clickOnContinue();
  assembly.verifyNoOfComponentsInAssemblytable(2);
  products.clickSaveButtonInEditProduct();
  featureHelper.waitForLoadingIconToDisappear();
  products.verifyCpnInViewPage(prodCpn);
}

const add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN = 
  (prodCpn, assemblyCmpCpn = "232-00001", category = "Resistor", mpn = "RC0603JR-0710KL") => {
  submit_a_product();
  assembly.clickOnAssemblyTab();
  assembly.clickOnAddFromVendor();
  components.chooseCategoryInImportVendorPage(category);
  components.enterMpn(mpn);
  components.clickOnCreate();
  assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, assemblyCmpCpn);
  products.clickSaveButtonInEditProduct();
  featureHelper.waitForLoadingIconToDisappear();
  products.verifyCpnInViewPage(prodCpn);
}

const add_assembly_cmp_through_manual_for_product_and_verify_CPN = 
  (prodCpn, assemblyCmpCpn = "212-00001", assemblyCategory = constData.electricalComponents.capacitor) => {
  submit_a_product();
  assembly.clickOnAssemblyTab();
  assembly.clickonCreateManually();
  components.chooseCategory(assemblyCategory);
  components.enterComponentName("childCmp");
  components.selectStatus();
  components.clickOnCreate();
  assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, assemblyCmpCpn);
  products.clickSaveButtonInEditProduct();
  featureHelper.waitForLoadingIconToDisappear();
  products.verifyCpnInViewPage(prodCpn) ;
}

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
}

context("CPN Schemes", { tags: ["CPN_Impacts", "CPN_Impacts_With_Assembly", "CPN_Product_Assemblies"]}, () => {
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
    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("999-00001");
    compSettings.resetCompany(companyId);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("999-00001");
    compSettings.resetCompany(companyId);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("999-00001");
    compSettings.resetCompany(companyId);
  });

  it('Should verify the CPN functionality for: DEFAULT with EXTRA-TWO-DIGIT-VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("999-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("999-00001-00", "232-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("999-00001-00", "212-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-9-DIGIT', () => {
    let compData;
    // Configure company with CPN rules & CPN schemes
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("999-0001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("999-0001-00", "710-0001");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("999-0001-00", "200-0001", "Sub-Assembly");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-10-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("999-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("999-00001-00", "238-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("999-00001-00", "213-00001-00", "(213) Capacitor");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-11-DIGIT', () => {
    let compData;
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("A-FGS-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("A-FGS-00001-00", "E-RES-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("A-FGS-00001-00", "E-CAP-00001-00", "(E-CAP) Capacitor");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);
  });

  it('Should verify the CPN functionality for: WITH-7-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("999-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("999-0000001", "232-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("999-0000001", "212-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);
  });

  it('Should verify the CPN functionality for: WITH-6-DIGIT-PREFIX-AND-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("150001-01", "cpn/twoAssemblyCmps2.xlsx");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("150001-01", "210001-01", "Wire");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("150001-01", "860001-01", "Adhesive");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);
  });

  it('Should verify the CPN functionality for: FREE-FORM', { tags: ["Sphero"] }, () => {
    nav.verifyNavigationMenuItems();
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();

    let compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}
    // Create and add child components through import from file for product and verify CPN
    submit_a_product("TestProduct", "DESIGN", "1");
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.uploadFile("cpn/twoAssemblyCmps.xlsx");
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    assembly.verifyNoOfComponentsInAssemblytable(2);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();
    products.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
    resetAccount(CPN_rules.FREE_FORM);

    // Create and add child components through import from vendor for product and verify CPN
    submit_a_product("TestProduct", "DESIGN", "1");
    assembly.clickOnAssemblyTab();
    assembly.clickOnAddFromVendor();
    components.chooseCategoryInImportVendorPage("Resistor");
    components.enterMpn("RC0603JR-0710KL");
    components.clickOnCreate();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, "Res Thick Film 0603 10K Ohm 5% 1/10W ±100ppm/°C Molded SMD SMD Paper T/R");
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();
    products.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
    resetAccount(CPN_rules.FREE_FORM);

    // Create and add child components through manual for product and verify CPN
    submit_a_product("TestProduct", "DESIGN", "1");
    assembly.clickOnAssemblyTab();
    assembly.clickonCreateManually();
    components.chooseCategory("EBOM");
    components.enterComponentName("childCmp");
    components.selectStatus();
    components.clickOnCreate();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, "childCmp")
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();
    products.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
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

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("900-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("900-00001", "232-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("900-00001", "212-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);
  });

  it('Should verify the CPN functionality for: WITH-1-OR-3-DIGIT-PREFIX-AND-6-DIGIT-COUNTER', () => {
    let compData;
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("999-000001", 'cpn/twoAssemblyCmps3.xlsx');
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("999-000001", "E-000001", "OTS Electrical");
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("999-000001", "E-000001", "OTS Electrical");
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);
  });

  it('Should verify the CPN functionality for: CONDITIONAL-01-VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("999-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("999-00001", "232-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("999-00001", "212-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);
  });

  it('Should verify the CPN functionality for: HYBRID-WITH-6-DIGIT-CPN', () => {
    nav.verifyNavigationMenuItems();
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);
    navigation.verifyNavigationMenuItems();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("110001");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("110001", "910001", "Capacitor");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);
  });

  it('Should verify the CPN functionality for: NON-INTELLIGENT', () => {
    nav.verifyNavigationMenuItems();
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'DEFAULT'));
    navigation.verifyNavigationMenuItems();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("10000");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("10000", "10001");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("10000", "10001", "Capacitor");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
  });

  it('Should verify the CPN functionality for: NON-INTELLIGENT with variant', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.nonIntelligentCpn("variantStartingIndex", "00"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and add child components through import from file for product and verify CPN
    add_assembly_cmp_through_import_from_file_for_product_and_verify_CPN("10000-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Create and add child components through import from vendor for product and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_product_and_verify_CPN("10000-00", "10001-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Create and add child components through manual for product and verify CPN
    add_assembly_cmp_through_manual_for_product_and_verify_CPN("10000-00", "10001-00", "Capacitor");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
  });
});
