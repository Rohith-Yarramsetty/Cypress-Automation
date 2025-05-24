import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Variants } from "../../pages/components/variants";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const variants = new Variants();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const tableHelper = new TableHelpers();
const fakerHelpers = new FakerHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

describe("Variants", { tags: ["Variants, Components_Variants"] }, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should show related category components by default in Variants add from library search', () => {
    const cmpData1 = {
      name: fakerHelpers.generateProductName(),
      category: 'Capacitor',
      status: constData.status.design
    }
    const cmpData2 = {
      name: fakerHelpers.generateProductName(),
      category: 'Capacitor',
      status: constData.status.design
    }
    const cmpData3 = {
      name: fakerHelpers.generateProductName(),
      category: 'Capacitor',
      status: constData.status.design
    }
    const cmpData4 = {
      name: fakerHelpers.generateProductName(),
      category: 'Capacitor',
      status: constData.status.design
    }

    const cmpData5 = {
      name: fakerHelpers.generateProductName(),
      category: 'Resistor',
      status: constData.status.design
    }

    // Create a Components
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    compApi.createComponent(cmpData3);
    compApi.createComponent(cmpData4);
    compApi.createComponent(cmpData5);

    // Go to capacitor type component and click on component variant icon
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData1.name);
    components.clickOnVariantIcon();
    components.clickOnAddFromLibraryInVariantTable();

    // Verify category prefix
    components.verifyAddFromLibraryVariantPrefix(cmpData1.category);

    // Verify same category components present in variants add from library table
    components.assertVariantsPresentInAddFromLibraryTable(cmpData1.name);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData2.name);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData3.name);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData4.name);

    // Verify different category component not present in variants add from library table
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData5.name);

    // Search with CPN Prefix for the category(Capacitor = 212)
    components.searchVariantsInAddFromLibrarySearchBox(212);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData1.name);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData2.name);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData3.name);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData4.name);

    // Verify same component in variants table should not be selected
    components.verifyExistingVariantInAddFromLibraryTable(cmpData1.name);

    // Search the same category component and assert the components presence in add from library table
    components.searchVariantsInAddFromLibrarySearchBox(cmpData2.name);
    components.assertVariantsPresentInAddFromLibraryTable(cmpData2.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData1.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData3.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData4.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData5.name);

    // Search the different category component and assert the components presence in add from library table
    components.searchVariantsInAddFromLibrarySearchBox(cmpData5.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData1.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData2.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData3.name);
    components.assertVariantsNotPresentInAddFromLibraryTable(cmpData4.name);
  })

  it('Verify the variants of component when a variant is created to a duplicated one', () => {
    const compData = {
      name      : fakerHelpers.generateComponentName(),
      staus     : constData.status.design,
      revision  : 3
    }

    // Create component
    compApi.createComponent(compData);

    // Create a variant
    components.navigateToComponentViewPage(compData.name, false);
    components.getCpnValueFromEditViewPage().then((cpn1) => {
      components.clickOnVariantIcon();
      components.clickOnNewVariantIcon();
      components.clickSaveButtonInEditComponent();

      // Change the category
      components.clickEditIcon();
      components.changeCategoryInEditComponent(constData.assemblyComponents.ebom);
      components.verifyCategoryChangeModal();
      components.clickContinueInChangeCategoryModal();
      components.clickSaveButtonInEditComponent();
      components.getCpnValueFromEditViewPage().then((cpn2) => {

        // Duplicate & create a variant for duplicated one
        components.duplicateComponentFromDetailsPage();
        components.clickSaveButtonInEditComponent();
        components.getCpnValueFromEditViewPage().then((cpn3) => {
          components.clickOnVariantIcon();
          components.clickOnNewVariantIcon();
          components.clickSaveButtonInEditComponent();
          components.getCpnValueFromEditViewPage().then((cpn4) => {

            // Verify the component variants
            variants.navigateToVariantsTab();
            variants.verifyAssemblyVariantsNotExists([cpn1, cpn2]);
            variants.verifyAssemblyVariantsExists(1, [cpn3, cpn4]);
          })
        })
      })
    })
  })

  it.skip('Should be able to create multiple variants for a duplicated one', () => {
    const compData = {
      name      : fakerHelpers.generateComponentName(),
      staus     : constData.status.design,
      revision  : 3
    }

    // Create component
    compApi.createComponent(compData);

    // Change the category
    components.navigateToComponentViewPage(compData.name, false);
    components.clickEditIcon();
    components.changeCategoryInEditComponent(constData.assemblyComponents.ebom);
    components.verifyCategoryChangeModal();
    components.clickContinueInChangeCategoryModal();
    components.clickSaveButtonInEditComponent();
    components.getCpnValueFromEditViewPage().then((cpn1) => {

      // Create a variant
      components.clickOnVariantIcon();
      components.clickOnNewVariantIcon();
      components.clickSaveButtonInEditComponent();
      components.getCpnValueFromEditViewPage().then((cpn2) => {

        // Duplicate & create a variant for duplicated one
        components.duplicateComponentFromDetailsPage();
        components.clickSaveButtonInEditComponent();
        components.getCpnValueFromEditViewPage().then((cpn3) => {
          components.clickOnVariantIcon();
          components.clickOnNewVariantIcon();
          components.clickSaveButtonInEditComponent();
          components.getCpnValueFromEditViewPage().then((cpn4) => {

            // Create the second variant
            components.navigateToComponentViewPage(cpn3, false, constData.componentTableHeaders.cpn);
            components.clickOnVariantIcon();
            components.clickOnNewVariantIcon();
            components.renameComponentNameInEditPage();
            components.clickSaveButtonInEditComponent();
            components.getCpnValueFromEditViewPage().then((cpn5) => {

              // Verify the component variants
              variants.navigateToVariantsTab();
              variants.verifyAssemblyVariantsNotExists([cpn1, cpn2]);
              variants.verifyAssemblyVariantsExists(1, [cpn3, cpn4, cpn5]);
            })
          })
        })
      })
    })
  })
})
