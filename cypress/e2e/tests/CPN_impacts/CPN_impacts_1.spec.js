import { AuthApi }             from "../../api/auth";
import { UsersApi }            from "../../api/userApi";
import { Export }              from "../../pages/export";
import { SignIn }              from "../../pages/signin";
import { Navigation }          from "../../pages/navigation";
import { TableHelpers }        from "../../helpers/tableHelper";
import { FeatureHelpers }      from "../../helpers/featureHelper";
import { CompanySettingsApi }  from "../../api/companySettingsApi";
import { Products }            from "../../pages/products/products";
import { Variants }            from "../../pages/components/variants";
import { Assembly }            from "../../pages/components/assembly";
import { Components }          from "../../pages/components/component";
import { ChangeOrders }        from "../../pages/changeOrders/changeOrder";
import { ImportFromFile }      from "../../pages/components/importFromFile";
import   CPN_rules             from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries }        from "../../helpers/dataHelpers/customCpn/CPN_libraries";
import   compPayloads          from "../../helpers/dataHelpers/companySettingsPayloads";

const signin           = new SignIn();
const exports          = new Export();
const authApi          = new AuthApi();
const userApi          = new UsersApi();
const assembly         = new Assembly();
const products         = new Products();
const variants         = new Variants();
const nav              = new Navigation();
const components       = new Components();
const changeOrder      = new ChangeOrders();
const tableHelpers     = new TableHelpers();
const cpnLibraries     = new CpnLibraries();
const importFromFile   = new ImportFromFile();
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

const duplicate = 
  (cpn, compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  components.clickSaveButtonInEditComponent();

  // Create a duplicate & verify CPN
  components.duplicateComponentFromDetailsPage();
  components.clickSaveButtonInEditComponent();
  components.verifyCpnInViewPage(cpn);
}

const variant = 
  (cpn, compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  components.clickSaveButtonInEditComponent();

  // Create a variant & verify CPN
  components.clickOnVariantIcon();
  components.clickOnNewVariantIcon();
  components.clickSaveButtonInEditComponent();
  components.verifyCpnInViewPage(cpn);

  // Verify CPN at variant tab
  variants.navigateToVariantsTab();
  variants.verifyVariantExistsWithCpn(cpn);
}

const table_impacts = (CpnData, assemblyCmpCategory = "MBOM", compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  components.clickSaveButtonInEditComponent();

  // Verify CPN at component library
  nav.openComponentsTab();
  components.enterSearchTerm(`name: ${compData.name}`);
  tableHelpers.assertTextInCell("id", compData.name, CpnData.componentLibrary);

  // Add component to an assembly
  submit_a_component("Assembly_Cmp", "PROTOTYPE", assemblyCmpCategory);
  assembly.clickOnAssemblyTab();
  assembly.addComponentsToAssemblyTable({CPN: CpnData.assemblyLibrary, Quantity: 2})

  // Verify CPN at assembly library
  featureHelper.getCpnValueFromTable(compData.name, 1).then(value => expect(value).to.eq(CpnData.assemblyLibrary));
  components.clickSaveButtonInEditComponent();
  components.getCpnValueFromEditViewPage().then((parentCpn) => {

    // Add component to changeOrder
    components.clickOnChangeOrderIconInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify CPN in changeOrder assembly table
    let index
    if(CpnData.compIndex) {index = CpnData.compIndex} else index = 2
    changeOrder.enterNameInEcoModal('TEST ECO');
    changeOrder.getCpnValueFromAssemblyLibrary(index).then((cpn) => expect(cpn).to.eq(CpnData.changeOrderCpn));
    changeOrder.clickSaveDraft();
    
    // Verify CPN at view Change Order
    changeOrder.verifyCpnInViewChangeOrder("Assembly_Cmp", parentCpn);

    // Verify CPN at where used modal
    components.navigateToComponentViewPage(compData.name, false);
    components.clickWhereUsedIconInViewComponent();
    components.verifyWhereUsedText("0 Products, 1 Assembly");

    // Verify CPN in export table in export page
    components.clickExportIconInViewComponent();
    tableHelpers.assertTextInCell('cpn', compData.name, CpnData.exportCpn);
  })
}

const product_CPN = (prodData) => {
  products.createAndSaveBasicProduct();
  products.verifyCpnInViewPage(prodData.viewPageCpn);

  // Create a duplicate & verify the CPN
  products.clickDuplicateIconInViewPage();
  products.clickSaveButtonInEditProduct();
  products.verifyCpnInViewPage(prodData.duplicateCpn);

  // Create a variant & verify the CPN
  products.navigateToProductViewPage("TestProduct");
  products.clickVariantIconInViewPage();
  products.clickCreateNewVariantBtn();
  products.clickSaveButtonInEditProduct();
  products.verifyCpnInViewPage(prodData.variantCpn);

  // Verify CPN at variant tab
  variants.navigateToVariantsTab();
  variants.verifyAssemblyVariantsExists(1, [prodData.viewPageCpn, prodData.variantCpn]);
}

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
}

context("CPN Schemes", { tags: ["CPN_Impacts", "CPN_Impacts_One", "CPN_Functionality"] }, () => {
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
    // Verify CPN for duplicate
    duplicate("212-00002");
    compSettings.resetCompany(companyId);

    // Verify CPN for variant
    variant("212-00002");
    compSettings.resetCompany(companyId);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "212-00001");
    compSettings.resetCompany(companyId);

    const CpnData = {
      componentLibrary   : "212-00001",
      assemblyLibrary    : "212-00001",
      changeOrderCpn     : "212-00001",
      exportCpn          : "212-00001"
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData);

    const prodData = {
      viewPageCpn    : "999-00001",
      duplicateCpn   : "999-00002",
      variantCpn     : "999-00003"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: DEFAULT with EXTRA-TWO-DIGIT-VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("212-00002-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN for variant
    variant("212-00001-01");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "212-00001-00");
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    const CpnData = {
      componentLibrary   : "212-00001-00",
      assemblyLibrary    : "212-00001-00",
      changeOrderCpn     : "212-00001-00",
      exportCpn          : "212-00001-00"
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData);

    const prodData = {
      viewPageCpn    : "999-00001-00",
      duplicateCpn   : "999-00002-00",
      variantCpn     : "999-00001-01"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-9-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("720-0002");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN for variant
    variant("720-0001-01");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "720-0001");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    const CpnData = {
      componentLibrary   : "720-0001",
      assemblyLibrary    : "720-0001",
      changeOrderCpn     : "720-0001",
      exportCpn          : "720-0001",
      compIndex          : 1
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData, "Sub-Assembly");

    const prodData = {
      viewPageCpn    : "999-0001-00",
      duplicateCpn   : "999-0002-00",
      variantCpn     : "999-0001-01"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-10-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("213-00002-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN for variant
    variant("213-00001-01");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "213-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    const CpnData = {
      componentLibrary   : "213-00001-00",
      assemblyLibrary    : "213-00001-00",
      changeOrderCpn     : "213-00001-00",
      exportCpn          : "213-00001-00",
      compIndex          : 1
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData);

    const prodData = {
      viewPageCpn    : "999-00001-00",
      duplicateCpn   : "999-00002-00",
      variantCpn     : "999-00001-01"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-11-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("E-CAP-00002-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN for variant
    variant("E-CAP-00001-01");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "E-CAP-00001-00");
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT)

    const CpnData = {
      componentLibrary   : "E-CAP-00001-00",
      assemblyLibrary    : "E-CAP-00001-00",
      changeOrderCpn     : "E-CAP-00001-00",
      exportCpn          : "E-CAP-00001-00",
      compIndex          : 1
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData, "Sub-Assembly");

    const prodData = {
      viewPageCpn    : "A-FGS-00001-00",
      duplicateCpn   : "A-FGS-00002-00",
      variantCpn     : "A-FGS-00001-01"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: WITH-7-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("212-0000002");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN for variant
    variant("212-0000002");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "212-0000001");
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    const CpnData = {
      componentLibrary   : "212-0000001",
      assemblyLibrary    : "212-0000001",
      changeOrderCpn     : "212-0000001",
      exportCpn          : "212-0000001"
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData);

    const prodData = {
      viewPageCpn    : "999-0000001",
      duplicateCpn   : "999-0000002",
      variantCpn     : "999-0000003"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: WITH-6-DIGIT-PREFIX-AND-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name: "CMP", status: "DESIGN", category: "Adhesive"};

    // Verify CPN for duplicate
    duplicate("860002-01", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN for variant
    variant("860001-02", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithAdhesiveCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "860001-01");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    const CpnData = {
      componentLibrary   : "860001-01",
      assemblyLibrary    : "860001-01",
      changeOrderCpn     : "860001-01",
      exportCpn          : "860001-01",
      compIndex          : 1,
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData, "Sub Assembly", compData);

    const prodData = {
      viewPageCpn    : "150001-01",
      duplicateCpn   : "150002-01",
      variantCpn     : "150001-02"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: FREE-FORM', { tags: ["Sphero"] }, () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();

    // Import a component
    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    featureHelper.getCpnValueFromTable("Cmp").then((importCpn) => {
      expect(importCpn).to.include("TMP");
      cy.wrap(importCpn).should('have.length', 9);
    })

    // Create a component
    submit_a_component("Test_Cmp", "PROTOTYPE");
    components.clickSaveButtonInEditComponent();
    components.getCpnValueFromEditViewPage().then((cpnValue) => {

      // Verify CPN at component Library
      nav.openComponentsTab();
      components.enterSearchTerm("Test_Cmp");
      tableHelpers.assertTextInCell("cpn", "Test_Cmp", cpnValue);

      // Add to changeOrder
      tableHelpers.clickOnCell("cpn", cpnValue);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify CPN in CO table
      changeOrder.enterNameInEcoModal("Test_ECO");
      changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn1) =>
      changeOrder.getCpnValueFromAssemblyLibrary(2).then((cpn2) => expect([cpn1, cpn2]).to.include(cpnValue)))
      changeOrder.clickSaveDraft();
    })

    // Create a product & verify the CPN at view
    nav.openDashboard();
    products.createAndSaveBasicProduct("TestProduct", "PROTOTYPE");
    products.getCpnValueFromEditViewPage().then((cpnValue) => {
      nav.openProductTab();
      products.enterSearchTerm("TestProduct");
      tableHelpers.assertTextInCell("cpn", "TestProduct", cpnValue);

      // Verify CPN at export page
      products.navigateToProductViewPage("TestProduct", false);
      products.verifyCpnInViewPage(cpnValue);
      products.clickExportIconInViewProduct();
      tableHelpers.assertTextInCell("cpn", "TestProduct", cpnValue);

      // Verify CPN at changeOrder table
      nav.openChangeOrdersTab();
      changeOrder.clickNewBtn();
      changeOrder.searchAndCheckComponentInNewChangeOrder("TestProduct");
      changeOrder.enterNameInEcoModal('TEST ECO');
      changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn1) =>
      changeOrder.getCpnValueFromAssemblyLibrary(2).then((cpn2) =>
      changeOrder.getCpnValueFromAssemblyLibrary(3).then((cpn3) => expect([cpn1, cpn2, cpn3]).to.include(cpnValue))));
      changeOrder.clickSaveDraft();

      // Customize to export CPN alone
      products.navigateToProductViewPage("TestProduct");
      products.clickExportIconInViewProduct();
      exports.clickOnCustomizeFieldsIcon();
      exports.uncheckCustomizeFieldsCheckBoxes();
      exports.checkCustomizeFieldsCheckBoxes('CPN');
      exports.clickOnSaveBtnInCustomizeFieldsModal();
      exports.clickExportBtnInExportSettings();

      // Verify the exported data
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-${cpnValue}.1-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
          expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1", `${cpnValue}`]);
        })
      })
    })
  })

  it('Should verify the CPN functionality for: PROD-WITH-PREFIX-900', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.PROD_WITH_PREFIX_900);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("PROD-WITH-PREFIX-900"));
    authApi.reSignin();

    // Create a product & verify CPN
    products.createAndSaveBasicProduct();
    products.verifyCpnInViewPage("900-00001");

    // Create a duplicate & verify the CPN
    products.clickDuplicateIconInViewPage();
    products.clickSaveButtonInEditProduct();
    products.verifyCpnInViewPage("900-00002");

    // Create a variant & verify the CPN
    products.navigateToProductViewPage("TestProduct");
    products.getCpnValueFromEditViewPage().then(actualcpn => {
      products.clickVariantIconInViewPage();
      products.clickCreateNewVariantBtn();
      products.clickSaveButtonInEditProduct();
      products.verifyCpnInViewPage("900-00003");

      // Verify CPN at variant tab
      variants.navigateToVariantsTab();
      variants.verifyAssemblyVariantsExists(1, [actualcpn, "900-00003"]);
    })
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Create a product & add to changeOrder
    products.createAndSaveBasicProduct("TestProduct2", "PROTOTYPE");
    products.clickOnChangeOrderIconInViewProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify CPN in changeOrder assembly table
    changeOrder.enterNameInEcoModal('TEST ECO');
    changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq("900-00001"));
    changeOrder.clickSaveDraft();

    // Verify the CPN at export library
    products.navigateToProductViewPage("TestProduct2", false);
    products.clickExportIconInViewProduct();
    tableHelpers.assertTextInCell('cpn', "TestProduct2", "900-00001");
  })

  it('Should verify the CPN functionality for: WITH-1-OR-3-DIGIT-PREFIX-AND-6-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name     : "Test-Cmp",
                      status   : "DESIGN",
                      category : "Incoming Quality Control"};

    // Verify CPN for duplicate
    duplicate("IQC-000002", compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN for variant
    variant("IQC-000002", compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWith_IQC_Category.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "IQC-000001");
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    const CpnData = {
      componentLibrary   : "IQC-000001",
      assemblyLibrary    : "IQC-000001",
      changeOrderCpn     : "IQC-000001",
      exportCpn          : "IQC-000001",
      compIndex          : 1
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData, "Assemblies", compData);

    const prodData = {
      viewPageCpn    : "999-000001",
      duplicateCpn   : "999-000002",
      variantCpn     : "999-000003"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: CONDITIONAL-01-VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Verify CPN for comp & variant
    submit_a_component("Test_Cmp");
    components.clickSaveButtonInEditComponent();
    components.verifyCpnInViewPage("212-00001");
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    components.clickSaveButtonInEditComponent();
    components.verifyCpnInViewPage("212-00001-02");
    components.navigateToComponentViewPage("Test_Cmp");
    components.verifyCpnInViewPage("212-00001-01");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN for duplicate
    duplicate("212-00002");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "212-00001");
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    const CpnData = {
      componentLibrary   : "212-00001",
      assemblyLibrary    : "212-00001",
      changeOrderCpn     : "212-00001",
      exportCpn          : "212-00001"
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData);

    const prodData = {
      viewPageCpn    : "999-00001",
      duplicateCpn   : "999-00002",
      variantCpn     : "999-00001-02",
    }
    // Verify the CPN for products
    product_CPN(prodData);
    products.navigateToProductViewPage("TestProduct");
    products.verifyCpnInViewPage("999-00001-01");
  })

  it('Should verify the CPN functionality for: HYBRID-WITH-6-DIGIT-CPN', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("910002");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN for variant
    variant("910002");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "910001");
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    const CpnData = {
      componentLibrary   : "910001",
      assemblyLibrary    : "910001",
      changeOrderCpn     : "910001",
      exportCpn          : "910001"
    }
    // Verify the CPN in various libraries
    submit_a_component("Test_Cmp", "PROTOTYPE");
    components.clickSaveButtonInEditComponent();
    components.clickOnChangeOrderIconInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();

    changeOrder.enterNameInEcoModal("Test_ECO");
    changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq(CpnData.changeOrderCpn));
    changeOrder.clickSaveDraft();

    // Verify CPN in export table in export page
    components.navigateToComponentViewPage("Test_Cmp", false);
    components.clickExportIconInViewComponent();
    tableHelpers.assertTextInCell('cpn', "Test_Cmp", CpnData.exportCpn);

    const prodData = {
      viewPageCpn    : "110001",
      duplicateCpn   : "110002",
      variantCpn     : "110003"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: NON-INTELLIGENT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'DEFAULT'));
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("10001");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN for variant
    variant("10001");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "10000");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    const CpnData = {
      componentLibrary   : "10000",
      assemblyLibrary    : "10000",
      changeOrderCpn     : "10000",
      exportCpn          : "10000"
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    const prodData = {
      viewPageCpn    : "10000",
      duplicateCpn   : "10001",
      variantCpn     : "10002"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })

  it('Should verify the CPN functionality for: NON-INTELLIGENT with variant', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.nonIntelligentCpn("variantStartingIndex", "00"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    // Verify CPN for duplicate
    duplicate("10001-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN for variant
    variant("10000-01");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN when created through import
    importFromFile.importComponentsFromFile("cpn/compWithCapacitorCategory.xlsx");
    tableHelpers.assertTextInCell("cpn", "Cmp", "10000-00");
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    const CpnData = {
      componentLibrary   : "10000-00",
      assemblyLibrary    : "10000-00",
      changeOrderCpn     : "10000-00",
      exportCpn          : "10000-00"
    }
    // Verify the CPN in various libraries
    table_impacts(CpnData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    const prodData = {
      viewPageCpn    : "10000-00",
      duplicateCpn   : "10001-00",
      variantCpn     : "10000-01"
    }
    // Verify the CPN for products
    product_CPN(prodData);
  })
})
