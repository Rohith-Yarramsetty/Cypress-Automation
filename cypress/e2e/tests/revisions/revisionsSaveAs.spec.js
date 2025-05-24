import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Assembly } from "../../pages/components/assembly";
import { Products } from "../../pages/products/products";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const featureHelper = new FeatureHelpers();
const assembly = new Assembly();
const products = new Products();

let email, companyId, orgId;

describe("Revisions module", () => {
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

  context("No children Module", () => {
    it("should allow save as revision for COMPONENTS with design status and NO children", () => {
      const cmpData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        revision: "1",
        status: constData.status.design,
      }

      // Create a Component
      compApi.createComponent(cmpData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);

      // Edit and Save as revision and add comment
      components.clickEditIcon();
      components.clickSaveAsRevisionBtn();
      components.enterCommentInSaveAsRevisionModal("CMP Rev Notes");
      components.clickContinueBtnInSaveAsRevisionModal();

      // Verify History table
      components.clickOnHistoryIcon();
      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 1, 'Revision');
      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 1, 2);
      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 1, constData.status.design);
      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 1, "CMP Rev Notes");

      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 2, 'Modified');
      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 2, 1);
      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 2, constData.status.design);
      components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 2, "—");
    })
  })

  context("With children Module", () => {
    let cmpName
    beforeEach(() => {
      cmpName = fakerHelper.generateProductName();
      const cmpData = {
        category: "Adhesive",
        name: cmpName,
        status: constData.status.design,
        revision: 1
      }
      compApi.createComponent(cmpData);
    })

    it('should allow save as revision for COMPONENTS with design status and children in assembly', () => {
      const assemblyCmpData = {
        category: "MBOM",
        name: fakerHelper.generateProductName(),
        status: constData.status.design
      }

      // Create assembly type component
      compApi.createComponent(assemblyCmpData);
      nav.openComponentsTab();

      // Get CPN value of child component
      featureHelper.getCpnValueFromTable(cmpName, 1).then((value) => {
        const childCmpCpnValue = value
        const childData = {
          CPN:childCmpCpnValue ,
          Quantity: 1,
        }

        // Go to assembly type component and add child component
        tableHelper.clickOnCell(constData.componentTableHeaders.name, assemblyCmpData.name);
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(childData);
        components.clickSaveButtonInEditComponent();
        featureHelper.waitForLoadingIconToDisappear();

        // Click on edit and Save as revision and add a comment
        components.clickEditIcon();
        components.clickSaveAsRevisionBtn();
        components.entercommentInBulkUpdateSaveAsRevisionModal('Assembly Rev Notes');
        components.checkIncludeChildComponents();
        components.clickContinueBtnInSetNewRevisionsModal();

        // Verify History table of assembly type component
        components.clickOnHistoryIcon();
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 1, 'Revision');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 1, 1);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 1, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 1, "Assembly Rev Notes");

        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 2, 'Modified');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 2, "—");
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 2, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 2, "—");
        components.clickOnHistoryIcon();

        // Go to child component
        assembly.clickOnAssemblyTab();
        tableHelper.clickOnCell(constData.componentTableHeaders.category, 'Adhesive');

        // Verify History table of child component
        components.clickOnHistoryIcon();
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 1, 'Revision');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 1, 2);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 1, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 1, "Assembly Rev Notes");

        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 2, 'Modified');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 2, 1);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 2, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 2, "—");
      })
    })

    it('should allow save as revision for PRODUCTS with design status and children in assembly', () => {
      // Get CPN value of child component
      nav.openComponentsTab();
      featureHelper.getCpnValueFromTable(cmpName, 1).then((value) => {
        const childCmpCpnValue = value
        const childData = {
          CPN:childCmpCpnValue ,
          Quantity: 1,
        }

        // Create a Firmware type product
        const prodName = fakerHelper.generateProductName();
        nav.openProductTab();
        products.clickNewButton();
        products.checkCategoryItem('Firmware');
        products.enterProductName(prodName);
        products.clickCreateButton();

        // Add child component to the created product
        assembly.clickOnAssemblyTab();
        assembly.addComponentsToAssemblyTable(childData);
        products.clickSaveButtonInEditProduct();
        featureHelper.waitForLoadingIconToDisappear();

        // Click on edit and Save as revision and add a comment
        products.clickEditIcon();
        products.clickSaveAsRevisionBtn();
        products.entercommentInBulkUpdateSaveAsRevisionModal('Assembly Rev Notes');
        products.checkIncludeChildComponents();
        products.clickContinueBtnInSetNewRevisionsModal();

        // Verify History table of Parent product
        products.clickOnHistoryIcon();
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 1, 'Revision');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 1, 1);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 1, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 1, "Assembly Rev Notes");

        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 2, 'Modified');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 2, "—");
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 2, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 2, "—");
        products.clickOnHistoryIcon();

        // Go to child component
        assembly.clickOnAssemblyTab();
        tableHelper.clickOnCell(constData.componentTableHeaders.category, 'Adhesive');

        // Verify History table of child component
        components.clickOnHistoryIcon();
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 1, 'Revision');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 1, 2);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 1, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 1, "Assembly Rev Notes");

        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.type, 2, 'Modified');
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.revision, 2, 1);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.status, 2, constData.status.design);
        components.assertTextInHistoryTable(constData.revisionHistoryTableHeaders.deatils, 2, "—");
      })
    })
  })
})
