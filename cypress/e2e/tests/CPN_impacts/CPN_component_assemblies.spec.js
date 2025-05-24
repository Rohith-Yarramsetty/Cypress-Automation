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

const submit_a_component = (name = "Test_Cmp", status = "DESIGN", category = "Capacitor") => {
  nav.openComponentsTab();
  components.clickonCreateManually();
  components.chooseCategory(category);
  components.enterComponentName(name);
  components.selectStatus(status);
  components.clickOnCreate();
}

const add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN = 
  (cpn, compData = {name: "CMP", status: "DESIGN", category: "EBOM"}, file = 'cpn/twoAssemblyCmps.xlsx') => {
  submit_a_component(compData.name, compData.status, compData.category);
  assembly.clickOnAssemblyTab();
  assembly.clickOnImportFromFile();
  assembly.uploadFile(file);
  importFromFile.clickOnContinue();
  importFromFile.verifyNoErrorsAfterValidation();
  importFromFile.clickOnContinue();
  assembly.verifyNoOfComponentsInAssemblytable(2);
  components.clickSaveButtonInEditComponent();
  featureHelper.waitForLoadingIconToDisappear();
  components.verifyCpnInViewPage(cpn);
}

const add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN = 
  (cpn, assemblyCmpCpn = "232-00001", compData = {name: "CMP", status: "DESIGN", category: "EBOM"}, category = "Resistor", mpn = "RC0603JR-0710KL") => {
  submit_a_component(compData.name, compData.status, compData.category);
  assembly.clickOnAssemblyTab();
  assembly.clickOnAddFromVendor();
  components.chooseCategoryInImportVendorPage(category);
  components.enterMpn(mpn);
  components.clickOnCreate();
  assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, assemblyCmpCpn);
  components.clickSaveButtonInEditComponent();
  featureHelper.waitForLoadingIconToDisappear();
  components.verifyCpnInViewPage(cpn);
}

const add_assembly_cmp_through_manual_for_component_and_verify_CPN = 
  (cpn, assemblyCmpCpn = "910-00002", compData = {name: "CMP", status: "PROTOTYPE", category: "EBOM"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  assembly.clickOnAssemblyTab();
  assembly.clickonCreateManually();
  assembly.chooseCategory(compData.category);
  components.enterComponentName("childCmp");
  components.selectStatus();
  components.clickOnCreate();
  assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, assemblyCmpCpn)
  components.clickSaveButtonInEditComponent();
  featureHelper.waitForLoadingIconToDisappear();
  components.verifyCpnInViewPage(cpn);
}

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
}

context("CPN Schemes", { tags: ["CPN_Impacts", "CPN_Impacts_With_Assembly", "CPN_Component_Assemblies"]}, () => {
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
    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("910-00001");
    compSettings.resetCompany(companyId);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("910-00001");
    compSettings.resetCompany(companyId);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("910-00001");
  });

  it('Should verify the CPN functionality for: DEFAULT with EXTRA-TWO-DIGIT-VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("910-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("910-00001-00", "232-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("910-00001-00", "910-00002-00");
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-9-DIGIT', () => {
    let compData;
    // Configure company with CPN rules & CPN schemes
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("200-0001", compData = {name: "CMP", status: "DESIGN", category: "Sub-Assembly"});
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("200-0001", "710-0001", compData = {name: "CMP", status: "DESIGN", category: "Sub-Assembly"});
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("200-0001", "200-0002", compData = {name: "CMP", status: "PROTOTYPE", category: "Sub-Assembly"});
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-10-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("003-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("003-00001-00", "238-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("003-00001-00", "003-00002-00");
  });

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-11-DIGIT', () => {
    let compData;
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("A-SUB-00001-00", compData = {name: "CMP", status: "DESIGN", category: "Sub-Assembly"});
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("A-SUB-00001-00", "E-RES-00001-00", compData = {name: "CMP", status: "DESIGN", category: "Sub-Assembly"});
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("A-SUB-00001-00", "A-SUB-00002-00", compData = {name: "CMP", status: "PROTOTYPE", category: "Sub-Assembly"});
  });

  it('Should verify the CPN functionality for: WITH-7-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("910-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("910-0000001", "232-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("910-0000001", "910-0000002");
  });

  it('Should verify the CPN functionality for: WITH-6-DIGIT-PREFIX-AND-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    let compData = {name: "CMP", status: "DESIGN", category: "Adhesive"};

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("110001-01", compData = {name: "CMP", status: "DESIGN", category: "Sub Assembly"}, "cpn/twoAssemblyCmps2.xlsx");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("110001-01", "210001-01", compData = {name: "CMP", status: "DESIGN", category: "Sub Assembly"}, "Wire");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("110001-01", "110002-01", compData = {name: "CMP", status: "PROTOTYPE", category: "Sub Assembly"});
  });

  it('Should verify the CPN functionality for: FREE-FORM', { tags: ["Sphero"] }, () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();

    let compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}

    // Create and add child components through import from file for component and verify CPN
    submit_a_component("CMP", "DESIGN", "EBOM");
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.uploadFile("cpn/twoAssemblyCmps.xlsx");
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    assembly.verifyNoOfComponentsInAssemblytable(2);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
    resetAccount(CPN_rules.FREE_FORM);

    // Create and add child components through import from vendor for component and verify CPN
    submit_a_component("CMP", "DESIGN", "EBOM");
    assembly.clickOnAssemblyTab();
    assembly.clickOnAddFromVendor();
    components.chooseCategoryInImportVendorPage("Resistor");
    components.enterMpn("RC0603JR-0710KL");
    components.clickOnCreate();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, "Res Thick Film 0603 10K Ohm 5% 1/10W ±100ppm/°C Molded SMD SMD Paper T/R");
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
    resetAccount(CPN_rules.FREE_FORM);

    // Create and add child components through manual for component and verify CPN
    submit_a_component("CMP", "PROTOTYPE", "EBOM");
    assembly.clickOnAssemblyTab();
    assembly.clickonCreateManually();
    components.chooseCategory("EBOM");
    components.enterComponentName("childCmp");
    components.selectStatus();
    components.clickOnCreate();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, "childCmp")
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.getCpnValueFromEditViewPage(compData.name).then((cpnValue) => {
      expect(cpnValue).to.include("TMP");
      cy.wrap(cpnValue).should('have.length', 9);
    });
  });

  it('Should verify the CPN functionality for: PROD-WITH-PREFIX-900', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.PROD_WITH_PREFIX_900);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("PROD-WITH-PREFIX-900"));
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("910-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("910-00001", "232-00001");
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("910-00001", "910-00002");
  });

  it('Should verify the CPN functionality for: WITH-1-OR-3-DIGIT-PREFIX-AND-6-DIGIT-COUNTER', () => {
    let compData;
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("A-000001", compData = {name: "CMP", status: "DESIGN", category: "Assemblies"}, 'cpn/twoAssemblyCmps3.xlsx');
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("A-000001", "E-000001", compData = {name: "CMP", status: "DESIGN", category: "Assemblies"}, "OTS Electrical");
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("A-000001", "A-000002", compData = {name: "CMP", status: "PROTOTYPE", category: "Assemblies"});
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);
  });

  it('Should verify the CPN functionality for: CONDITIONAL-01-VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("910-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("910-00001", "232-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("910-00001", "910-00002");
  });

  it('Should verify the CPN functionality for: HYBRID-WITH-6-DIGIT-CPN', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);

    cy.log("Kodiak user doesn't contain Assembly type components");
  });

  it('Should verify the CPN functionality for: NON-INTELLIGENT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'DEFAULT'));
    navigation.verifyNavigationMenuItems();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("10000");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("10000", "10001");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("10000", "10001");
  });

  it('Should verify the CPN functionality for: NON-INTELLIGENT with variant', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.nonIntelligentCpn("variantStartingIndex", "00"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Create and add child components through import from file for component and verify CPN
    add_assembly_cmp_through_import_from_file_for_component_and_verify_CPN("10000-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Create and add child components through import from vendor for component and verify CPN
    add_assembly_cmp_through_import_from_vendor_for_component_and_verify_CPN("10000-00", "10001-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Create and add child components through manual for component and verify CPN
    add_assembly_cmp_through_manual_for_component_and_verify_CPN("10000-00", "10001-00");
  });
});
