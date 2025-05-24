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
import { Components }          from "../../pages/components/component";
import   CPN_rules             from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries }        from "../../helpers/dataHelpers/customCpn/CPN_libraries";
import   compPayloads          from "../../helpers/dataHelpers/companySettingsPayloads";

const signin           = new SignIn();
const exports          = new Export();
const authApi          = new AuthApi();
const userApi          = new UsersApi();
const products         = new Products();
const nav              = new Navigation();
const components       = new Components();
const compApi          = new ComponentApi();
const tableHelpers     = new TableHelpers();
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

const create_component_and_change_category =
  (revertData, compData = {name: "Test_Cmp", status: "DESIGN", category: "Capacitor"}) => {
  submit_a_component(compData.name, compData.status, compData.category);
  components.clickSaveButtonInEditComponent();
  components.verifyCpnInViewPage(revertData.actualCpn);

  // Verify new category CPN
  components.clickEditIcon();
  components.changeCategoryInEditComponent(revertData.newCategory);
  components.verifyCategoryChangeModal();
  components.clickContinueInChangeCategoryModal();
  components.selectStatusInEditView("PROTOTYPE");
  components.clickContinueBtnInSaveAsRevisionModal();
  components.clickSaveButtonInEditComponent();
}

const revert_component_from_view_page =
  (revertData, compData = {name: "Test_Cmp", status: "DESIGN", category: "Capacitor"}) => {
  // Verify default CPN
  create_component_and_change_category(revertData, compData);
  components.verifyCpnInViewPage(revertData.newCpn);

  // Verify reverted CPN
  components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
  components.clickOnRevertBackInCmpViewPage();
  components.clickYesBtnInConfirmRevertChanges();
  components.verifyCpnInViewPage(revertData.revertedCpn);
}

const revert_component_from_search_page =
  (revertData, compData = {name: "Test_Cmp", status: "DESIGN", category: "Capacitor"}) => {
  create_component_and_change_category(revertData, compData);

  nav.openComponentsTab();
  components.enterSearchTerm("name: " + compData.name);
  components.checkSelectAllIndexesCheckbox();
  cy.contains("Revert").click();
  cy.get(".modal").contains("Yes").click();
  tableHelpers.assertTextInCell("id", compData.name, revertData.revertedCpn);
}

const delete_from_view_page = (compData = {name: "Test_Cmp", status: "DESIGN", category: "Capacitor"}) => {
  compApi.createComponent(compData);
  products.createAndSaveBasicProduct();
  products.getCpnValueFromEditViewPage().then((prodCpn) => {
    components.navigateToComponentViewPage(compData.name);
    components.getCpnValueFromEditViewPage().then((compCpn) => {
      components.deleteComponentFromDetailsPage();
      products.navigateToProductViewPage("TestProduct");
      products.deleteProduct();

      nav.openComponentsTab();
      components.enterSearchTerm("name: " + compData.name);
      cy.wait(3000);
      tableHelpers.assertRowNotPresentInTable("id", compCpn);

      nav.openProductTab();
      products.enterSearchTerm("name: " + "TestProduct");
      cy.wait(3000);
      tableHelpers.assertRowNotPresentInTable("id", prodCpn);
    })
  })
}

const product_export_email =(exportCpn, prodData = {name: "TestProduct", status: "DESIGN", revision: "1"}) => {
  products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);
  products.clickExportIconInViewProduct();

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
    const download_file_link = email.html.links[0].href.toString();
    const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
    exports.downloadExportFileInExportEmail(download_file_link, fileName);
    cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
      expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1", `${exportCpn}`]);
    })
  })
}

const resetAccount = (CPN_rules) => {
  cpnLibraries.set_CPN_rules(CPN_rules);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
}

context("CPN Schemes", { tags: ["CPN_Impacts", "CPN_Impacts_Two"] }, () => {
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
    const revertData = {
      actualCpn    : "212-00001",
      newCategory  : "Charger",
      newCpn       : "213-00001",
      revertedCpn  : "212-00001"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData);
    compSettings.resetCompany(companyId);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    compSettings.resetCompany(companyId);

    // Delete the comp or prod & verify
    delete_from_view_page();
    compSettings.resetCompany(companyId);

    // Verify export CPN for products
    product_export_email("999-00001");
  })

  it('Should verify the CPN functionality for: DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT', () => {
    // Configure company with CPN rules
    cpnLibraries.set_CPN_rules(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    const revertData = {
      actualCpn    : "212-00001-00",
      newCategory  : "Charger",
      newCpn       : "213-00001-00",
      revertedCpn  : "212-00001-00"
    }

    // Revert component CPN from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT);

    // Verify export CPN for products
    product_export_email("999-00001-00");
  })

  it('Should verify the CPN functionality for: CUSTOM_CODE_WITH_9_DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateFortemCompanySettings(companyId);
    authApi.reSignin();

    const revertData = {
      actualCpn    : "720-0001",
      newCategory  : "IC",
      newCpn       : "730-0001",
      revertedCpn  : "720-0001"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);

    // Verify export CPN for products
    product_export_email("999-0001-00");
  })

  it('Should verify the CPN functionality for: CUSTOM_CODE_WITH_10_DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateArevoCompanySettings(companyId);
    authApi.reSignin();

    const revertData = {
      actualCpn    : "213-00001-00",
      newCategory  : "Charger",
      newCpn       : "214-00001-00",
      revertedCpn  : "213-00001-00"
    }

    // Revert component CPN from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);

    // Verify export CPN for products
    product_export_email("999-00001-00");
  })

  it('Should verify the CPN functionality for: CUSTOM_CODE_WITH_11_DIGIT', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateAferoCompanySettings(companyId);
    authApi.reSignin();

    const revertData = {
      actualCpn    : "E-CAP-00001-00",
      newCategory  : "Diode",
      newCpn       : "E-DIO-00001-00",
      revertedCpn  : "E-CAP-00001-00"
    }

    // Revert component CPN from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);

    // Verify export CPN for products
    product_export_email("A-FGS-00001-00");
  })

  it('Should verify the CPN functionality for: WITH_7_DIGIT_COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_7_DIGIT_COUNTER);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("WITH-7-DIGIT-COUNTER"));
    authApi.reSignin();

    const revertData = {
      actualCpn    : "212-0000001",
      newCategory  : "Charger",
      newCpn       : "213-0000001",
      revertedCpn  : "212-0000001"
    }

    // Revert component CPN from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.WITH_7_DIGIT_COUNTER);

    // Verify export CPN for products
    product_export_email("999-0000001");
  })

  it('Should verify the CPN functionality for: WITH_6_DIGIT_PREFIX_AND_COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateRoomCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name: "CMP", status: "DESIGN", category: "Adhesive"};

    const revertData = {
      actualCpn    : "860001-01",
      newCategory  : "Magnet",
      newCpn       : "870001-01",
      revertedCpn  : "860001-01"
    }

    // Revert component CPN from view page
    revert_component_from_view_page(revertData, compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Revert component from search page
    revert_component_from_search_page(revertData, compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Delete the comp or prod & verify
    delete_from_view_page(compData);
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);

    // Verify export CPN for products
    product_export_email("150001-01");
    resetAccount(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);
  })

  it('Should verify the CPN functionality for: FREE_FORM', { tags: ["Sphero"] }, () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("FREE-FORM"));
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    // Create component & change category
    compApi.createComponent({name: "Test_Cmp"});
    components.navigateToComponentViewPage("Test_Cmp", false);
    components.getCpnValueFromEditViewPage().then((cpnValue1) => {
      components.clickEditIcon();
      components.changeCategoryInEditComponent("Charger");
      components.clickContinueInChangeCategoryModal();
      components.selectStatusInEditView("PROTOTYPE");
      components.clickContinueBtnInSaveAsRevisionModal();
      components.clickSaveButtonInEditComponent();

      // Verify the CPN before reverting
      components.getCpnValueFromEditViewPage().then((cpnValue2) => {
        expect(cpnValue1).to.equal(cpnValue2);

        // Verify the CPN after reverting
        components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
        components.clickOnRevertBackInCmpViewPage();
        components.clickYesBtnInConfirmRevertChanges();
        components.getCpnValueFromEditViewPage().then((cpnValue3) => {
          expect(cpnValue1).to.equal(cpnValue3);
          expect(cpnValue2).to.equal(cpnValue3);
          resetAccount(CPN_rules.FREE_FORM);
        })
      })
    })

    // Delete the comp or prod & verify
    delete_from_view_page();
  })

  it('Should verify the CPN functionality for: PROD_WITH_PREFIX_900', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.PROD_WITH_PREFIX_900);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnType("PROD-WITH-PREFIX-900"));
    authApi.reSignin();

    const revertData = {
      actualCpn    : "212-00001",
      newCategory  : "Charger",
      newCpn       : "213-00001",
      revertedCpn  : "212-00001"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.PROD_WITH_PREFIX_900);

    // Verify export CPN for products
    product_export_email("900-00001");
  })

  it('Should verify the CPN functionality for: WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updatePressoCompanySettings(companyId);
    authApi.reSignin();

    const compData = {name     : "Test-Cmp",
                      status   : "DESIGN",
                      category : "Incoming Quality Control"};

    const revertData = {
      actualCpn    : "IQC-000001",
      newCategory  : "Drawings",
      newCpn       : "DRW-000001",
      revertedCpn  : "IQC-000001"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData, compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Revert component from search page
    revert_component_from_search_page(revertData, compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Delete the comp or prod & verify
    delete_from_view_page(compData);
    resetAccount(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);

    // Verify export CPN for products
    product_export_email("999-000001");
  })

  it('Should verify the CPN functionality for: CONDITIONAL_01_VARIANT', () => {
     // Configure company with CPN rules & CPN schemes
     cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
     compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(true));
     compSettings.updateCompanySettings(companyId, compPayloads.cpnType("CONDITIONAL-01-VARIANT"));
     compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
     authApi.reSignin();

     const revertData = {
      actualCpn    : "212-00001",
      newCategory  : "Charger",
      newCpn       : "213-00001",
      revertedCpn  : "212-00001"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.CONDITIONAL_01_VARIANT);

    // Verify export CPN for products
    product_export_email("999-00001");
  })

  it('Should verify the CPN functionality for: HYBRID_WITH_6_DIGIT_CPN', () => {
    // Configure company with CPN rules & CPN schemes
    compSettings.updateKodiakUserSettings(companyId);
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    const revertData = {
      actualCpn    : "910001",
      newCategory  : "Charger",
      newCpn       : "910001",
      revertedCpn  : "910001"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);

    // Verify export CPN for products
    product_export_email("110001");
  })

  it('Should verify the CPN functionality for: NON_INTELLIGENT_CPN_WITHOUT_VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'DEFAULT'));
    navigation.verifyNavigationMenuItems();
    authApi.reSignin();

    const revertData = {
      actualCpn    : "10000",
      newCategory  : "Charger",
      newCpn       : "10000",
      revertedCpn  : "10000"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITHOUT_VARIANT);

    // Verify export CPN for products
    product_export_email("10000");
  })

  it('Should verify the CPN functionality for: NON_INTELLIGENT_CPN_WITH_VARIANT', () => {
    // Configure company with CPN rules & CPN schemes
    cpnLibraries.set_CPN_rules(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);
    compSettings.updateCompanySettings(companyId, compPayloads.isIntelligentCpnScheme(false));
    compSettings.updateNonIntelligentCompanySettings(companyId);
    compSettings.updateCompanySettings(companyId, compPayloads.nonIntelligentCpn("variantStartingIndex", "00"));
    compSettings.updateCompanySettings(companyId, compPayloads.cpnScheme('activeScheme', 'EXTRA-TWO-DIGIT-VARIANT'));
    authApi.reSignin();

    const revertData = {
      actualCpn    : "10000-00",
      newCategory  : "Charger",
      newCpn       : "10000-00",
      revertedCpn  : "10000-00"
    }

    // Revert component from view page
    revert_component_from_view_page(revertData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Revert component from search page
    revert_component_from_search_page(revertData);
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Delete the comp or prod & verify
    delete_from_view_page();
    resetAccount(CPN_rules.NON_INTELLIGENT_CPN_WITH_VARIANT);

    // Verify export CPN for products
    product_export_email("10000-00");
  })
})
