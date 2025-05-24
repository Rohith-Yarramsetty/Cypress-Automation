import { AuthApi }             from "../../api/auth";
import { UsersApi }            from "../../api/userApi";
import { SignIn }              from "../../pages/signin";
import { Export }              from "../../pages/export";
import { Navigation }          from "../../pages/navigation";
import { TableHelpers }        from "../../helpers/tableHelper";
import { FeatureHelpers }      from "../../helpers/featureHelper";
import { CompanySettingsApi }  from "../../api/companySettingsApi";
import { Products }            from "../../pages/products/products";
import { Components }          from "../../pages/components/component";
import { CpnLibraries }        from "../../helpers/dataHelpers/customCpn/CPN_libraries";
import CPN_rules               from "../../helpers/dataHelpers/customCpn/CPN_rules";
import compPayloads            from "../../helpers/dataHelpers/companySettingsPayloads";

const signin           = new SignIn();
const exports          = new Export();
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

const export_CPN = (exported_CPN, compData = {name: "CMP", status: "DESIGN", category: "Capacitor"}, verifyEmailSubject = true) => {
  submit_a_component(compData.name, compData.status, compData.category);
  components.clickSaveButtonInEditComponent();

  // Navigate to export page
  components.clickExportIconInViewComponent();
  exports.checkAllLevelsIndentedRadioBtn();

  // Customize to export CPN alone
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
    if(verifyEmailSubject) expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-${exported_CPN}-${exportEmailDate}`);
    const download_file_link = email.html.links[0].href.toString();
    const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
    exports.downloadExportFileInExportEmail(download_file_link, fileName);
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1", `${exported_CPN}`]);
    })
  })
}

const change_category = (category = "Audio") => {
  components.changeCategoryInEditComponent(category);
  components.verifyCategoryChangeModal();
  components.clickContinueInChangeCategoryModal();
}

const submit_a_product = (prodName = "Test_Item", status = "DESIGN", category = "Electrical") => {
  nav.openProductTab()
  products.clickNewButton();
  products.checkCategoryItem(category);
  products.enterProductName(prodName);
  products.selectLifeCycleStatus(status);
  products.clickCreateButton();
}

const submit_a_component = (name = "Test_Item", status = "DESIGN", category = "Capacitor") => {
  nav.openComponentsTab();
  components.clickonCreateManually();
  components.chooseCategory(category);
  components.enterComponentName(name);
  components.selectStatus(status);
  components.clickOnCreate();
};

const deleteProductInSearchPage = (cpn, data = {name: undefined, status: undefined, category: undefined}) => {
  submit_a_product(data.name, data.status, data.category);
  products.clickSaveButtonInEditProduct();
  nav.openProductTab();
  tableHelpers.checkTableRow(data.name);
  products.deleteProductFromTable();
  components.enterSearchTerm(cpn);
  tableHelpers.assertRowNotPresentInTable('cpn', cpn);
};

const deleteComponentInSearchPage = (cpn, data = {name: undefined, status: undefined, category: undefined}) => {
  submit_a_component(data.name, data.status, data.category);
  components.clickSaveButtonInEditComponent();
  nav.openComponentsTab();
  tableHelpers.checkTableRow(data.name);
  components.deleteComponentFromTable();
  components.enterSearchTerm(cpn);
  tableHelpers.assertRowNotPresentInTable('cpn', cpn);
};

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
};

context("CPN Schemes", { tags: ['CPN_Impacts', 'CPN_Impacts_Five'] }, () => {
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

    // Verify CPN in Exported spreadsheet
    export_CPN("212-00001");
    nav.openDashboard();
    compSettings.resetCompany(companyId);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("999-00001", prodData);
    compSettings.resetCompany(companyId);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("212-00001", compData);
    compSettings.resetCompany(companyId);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category("Audio");
    components.verifyValue('210-XXXXX');
  })

  it('Should verify the CPN functionality for: DEFAULT with EXTRA-TWO-DIGIT-VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN in Exported spreadsheet
    export_CPN("212-00001-00");
    nav.openDashboard();
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("212-00001-00", compData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("999-00001-00", prodData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category("Audio");
    components.verifyValue('210-XXXXX-00');
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-9-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN in Exported spreadsheet
    export_CPN("720-0001");
    nav.openDashboard();
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("720-0001", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("999-0002-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category("Adhesive");
    components.verifyValue('825-XXXXX-00');
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-10-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN in Exported spreadsheet
    export_CPN("213-00001-00");
    nav.openDashboard();
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("213-00002-00", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("999-00001-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category("Adhesive");
    components.verifyValue('310-XXXXX-00');
  })

  it('Should verify the CPN functionality for: CUSTOM-CODE-WITH-11-DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Cable Assembly"};

    // Verify CPN in Exported spreadsheet
    export_CPN("E-CAP-00001-00");
    nav.openDashboard();
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("A-CAB-00002-00", compData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("A-FGS-00001-00", prodData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category("Battery Pack");
    components.verifyValue('A-BAT-XXXXX-00');
  })

  it('Should verify the CPN functionality for: WITH-7-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN in Exported spreadsheet
    export_CPN("212-0000001");
    nav.openDashboard();
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("212-0000001", compData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("999-0000001", prodData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category("Adhesive");
    components.verifyValue('410-XXXXX');
  })

  it('Should verify the CPN functionality for: WITH-6-DIGIT-PREFIX-AND-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name: "Test_Item", status: "DESIGN", category: "Wire"};
    const ProdData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};

    // Verify CPN in Exported spreadsheet
    export_CPN("210001-01", compData);
    nav.openDashboard();
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("210001-01", compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("150001-01", ProdData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify CPN by changing category
    submit_a_component(compData.name, compData.status, compData.category);
    change_category("Legacy");
    components.verifyValue('10-01');
  })

  it('Should verify the CPN functionality for: FREE-FORM', { tags: ["Sphero"] }, () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Create a component
    nav.openDashboard();
    submit_a_component("Test_Cmp", "PROTOTYPE");
    components.clickSaveButtonInEditComponent();
    components.getCpnValueFromEditViewPage().then((cpnValue) => {
      // Verify CPN in export table
      components.navigateToComponentViewPage("Test_Cmp");
      components.clickExportIconInViewComponent();
      tableHelpers.assertTextInCell('cpn', "Test_Cmp", cpnValue);

      // Customize to export CPN alone
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

    // Verify CPN not present for deleted component
    nav.openDashboard();
    submit_a_component(compData.name, compData.status, compData.category);
    components.clickSaveButtonInEditComponent();
    components.getCpnValueFromEditViewPage().then((cpnValue) => {
      nav.openComponentsTab();
      tableHelpers.checkTableRow(compData.name);
      components.deleteComponentFromTable();
      components.enterSearchTerm(cpnValue);
      tableHelpers.assertRowNotPresentInTable('cpn', cpnValue);
    })
    resetAccount(CPN_rules.FREE_FORM);

    // Verify CPN not present for deleted product
    submit_a_product(prodData.name, prodData.status, prodData.category);
    products.clickSaveButtonInEditProduct();
    products.getCpnValueFromEditViewPage().then((cpnValue) => {
      nav.openProductTab();
      tableHelpers.checkTableRow(prodData.name);
      products.deleteProductFromTable();
      components.enterSearchTerm(cpnValue);
      tableHelpers.assertRowNotPresentInTable('cpn', cpnValue);
    })
    resetAccount(CPN_rules.FREE_FORM);
  })

  it('Should verify the CPN functionality for: PROD-WITH-PREFIX-900', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.PROD_WITH_PREFIX_900);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("PROD-WITH-PREFIX-900"));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("212-00001", compData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("900-00001", prodData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category("Adhesive");
    components.verifyValue('410-XXXXX');
  })

  it('Should verify the CPN functionality for: WITH-1-OR-3-DIGIT-PREFIX-AND-6-DIGIT-COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Incoming Quality Control"};

    // Verify CPN in Exported spreadsheet
    export_CPN("IQC-000001", compData);
    nav.openDashboard();
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("IQC-000001", compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("999-000001", prodData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify CPN by changing category
    submit_a_component("Test_Item", "DESIGN", "OTS Electrical");
    change_category("Fabricated Electrical");
    components.verifyValue('Y-XXXXX');
  })

  it('Should verify the CPN functionality for: CONDITIONAL-01-VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN in Exported spreadsheet
    export_CPN("212-00001");
    nav.openDashboard();
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("212-00001", compData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("999-00001", prodData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify CPN by changing category
    submit_a_component(compData.name, compData.status, compData.category);
    change_category("Adhesive");
    components.verifyValue('410-XXXXX-01');
  })

  it('Should verify the CPN functionality for: HYBRID-WITH-6-DIGIT-CPN', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    const prodData = {name: "Test_Item", status: "DESIGN", category: "Electrical"};
    const compData = {name: "Test_Item", status: "DESIGN", category: "Capacitor"};

    // Verify CPN in Exported spreadsheet
    export_CPN("910001", {name: "CMP", status: "DESIGN", category: "Capacitor"}, false);
    nav.openDashboard();
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("910000", compData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("110000", prodData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify CPN by changing category
    submit_a_component("Test_Item", "DESIGN", "Capacitor");
    change_category("Adhesive");
    components.verifyValue('910001');
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

    // Verify CPN in Exported spreadsheet
    export_CPN("10000");
    nav.openDashboard();
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("10000", compData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("10000", prodData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify CPN by changing category
    submit_a_component(compData.name, compData.status, compData.category);
    change_category("Adhesive");
    components.verifyValue('10000');
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

    // Verify CPN in Exported spreadsheet
    export_CPN("10000-00");
    nav.openDashboard();
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN not present for deleted component
    deleteComponentInSearchPage("10000-00", compData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN not present for deleted product
    deleteProductInSearchPage("10000-00", prodData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify CPN by changing category
    submit_a_component("Test_Item");
    change_category('Adhesive');
    components.verifyValue("10000-00");
  })
})
