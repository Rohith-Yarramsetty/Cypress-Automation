import { Components } from "../../pages/components/component";
import { Products } from "../../pages/products/products";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { SignIn } from "../../pages/signin";

const components = new Components();
const products = new Products();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const assembly = new Assembly();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const signin = new SignIn();

let email, companyId, orgId;

describe("View component tests", () => {
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

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("Check WhereUsed modal data of revision", () => {
    it('Should show correct data in where used modal of revision', () => {
      const compData = {
        category: "Bolt",
        name: "Child-cmp-1",
        status: "DESIGN"
      }
      const assemblyData1 = {
        category: "EBOM",
        name: "Assembly-cmp-1",
        status: "DESIGN"
      }
      const assemblyData2 = {
        category: "MBOM",
        name: "Assembly-cmp-2",
        status: "DESIGN"
      }

      // Create Component and Assemblies
      compApi.createComponent(compData);
      compApi.createComponent(assemblyData1);
      compApi.createComponent(assemblyData2);
      nav.openComponentsTab();

      let componentCpnValue, assembly1CpnValue, assembly2CpnValue, productCpnValue;

      featureHelper.getCpnValueFromTable(compData.name, 1).then((value) => componentCpnValue = value)
      featureHelper.getCpnValueFromTable(assemblyData1.name, 1).then((value) => assembly1CpnValue = value)
      featureHelper.getCpnValueFromTable(assemblyData2.name, 1).then((value) => {
        assembly2CpnValue = value

        // Add component to Assembly 1
        const childCompData = {
          CPN: componentCpnValue,
          Quantity: 2,
        }

        tableHelper.clickOnCell(constData.componentTableHeaders.name, assembly1CpnValue);
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(childCompData);
        components.clickSaveButtonInEditComponent();
        featureHelper.waitForLoadingIconToDisappear();

        // Add component to Assembly 2
        nav.openComponentsTab();
        tableHelper.clickOnCell(constData.componentTableHeaders.name, assembly2CpnValue);
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(childCompData);
        components.clickSaveButtonInEditComponent();
        featureHelper.waitForLoadingIconToDisappear();

        // Create Product
        const prodName = fakerHelper.generateProductName();

        nav.openProductTab();
        products.createBasicProduct(prodName);

        // Add Assemblies to Product
        const childAssemblyData1 = {
          CPN: assembly1CpnValue,
          Quantity: 1,
        }
        const childAssemblyData2 = {
          CPN: assembly2CpnValue,
          Quantity: 1,
        }
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(childAssemblyData1);
        assembly.addComponentsToAssemblyTable(childAssemblyData2);
        products.clickSaveButtonInEditProduct();
        featureHelper.waitForLoadingIconToDisappear();

        // Get CPN value of Product
        nav.openProductTab();
        featureHelper.getCpnValueFromTable(prodName, 1).then((value)=>{
          productCpnValue = value

          // Navigate to components tab
          nav.openComponentsTab();
          tableHelper.clickOnCell(constData.componentTableHeaders.name, componentCpnValue);
          components.clickEditIcon();

          // Change Revision value and add comment
          components.clickSaveAsRevisionBtn();
          components.enterRevisionInSaveAsRevisionModal(1);
          components.enterCommentInSaveAsRevisionModal('Changed Revision Value from 0 to 1');
          components.clickContinueBtnInSaveAsRevisionModal();
          nav.openComponentsTab();

          //components.enterSearchTerm(componentCpnValue);
          tableHelper.clickOnCell(constData.componentTableHeaders.name, componentCpnValue);
          components.clickEditIcon();

          // Change Revision value and add comment
          components.clickSaveAsRevisionBtn();
          components.enterRevisionInSaveAsRevisionModal(2);
          components.enterCommentInSaveAsRevisionModal('Changed Revision Value from 1 to 2');
          components.clickContinueBtnInSaveAsRevisionModal();

          // Verify Where used text and table data
          components.clickWhereUsedIconInViewComponent();
          components.verifyWhereUsedText('1 Product, 2 Assemblies');
          components.verifyDataInWhereUsedTable(productCpnValue, assembly1CpnValue, assembly2CpnValue);
          components.clickWhereUsedIconInViewComponent();

          // Move to previous item using history
          components.clickOnHistoryIcon();
          components.clicksecondItemInHistoryTable();

          // Verify Where used text and table data
          components.clickWhereUsedIconInViewComponent();
          components.verifyWhereUsedText('1 Product, 2 Assemblies');
          components.verifyDataInWhereUsedTable(productCpnValue, assembly1CpnValue, assembly2CpnValue);
          components.clickWhereUsedIconInViewComponent();
        })
      })
    })
  })

  it('Should update the Revision with given value in save as revision modal', () => {
    const cmpData = {
      category: "Bolt",
      name: fakerHelper.generateProductName(),
      status: constData.status.design
    }

    // Create Component using API
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);

    // Change Revision value empty to 1 and verify
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.enterRevisionInSaveAsRevisionModal(1);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.verifyRevisionInViewComponent(1);

    // Change Revision value 1 to 3 and verify
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.enterRevisionInSaveAsRevisionModal(3);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.verifyRevisionInViewComponent(3);

    // Change Revision value 3 to 6 and verify
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.enterRevisionInSaveAsRevisionModal(6);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.verifyRevisionInViewComponent(6);

    // Change Revision value 6 to 10 and verify
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.enterRevisionInSaveAsRevisionModal(10);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.verifyRevisionInViewComponent(10);

    // Change Revision value 10 to 15 and verify
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.enterRevisionInSaveAsRevisionModal(15);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.verifyRevisionInViewComponent(15);

    // Change Revision value 15 to 18 and verify
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.enterRevisionInSaveAsRevisionModal(18);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.verifyRevisionInViewComponent(18);
  })

  it('Should show the Continue button in visible state after changing Revision values', () => {
    const cmpData = {
      category: "Bolt",
      name: fakerHelper.generateProductName(),
      status: constData.status.design
    }

    // Create Component using API
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);

    // Change Revision value empty to 1 and verify
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.enterRevisionInSaveAsRevisionModal(1);
    components.verifyContinueBtnVisibleInSaveAsRevisionModal();

    // Change Revision value 1 to 3 and verify
    components.enterRevisionInSaveAsRevisionModal(3);
    components.verifyContinueBtnVisibleInSaveAsRevisionModal();

    // Change Revision value 3 to 6 and verify
    components.enterRevisionInSaveAsRevisionModal(6);
    components.verifyContinueBtnVisibleInSaveAsRevisionModal();

    // Change Revision value 6 to 10 and verify
    components.enterRevisionInSaveAsRevisionModal(10);
    components.verifyContinueBtnVisibleInSaveAsRevisionModal();

    // Change Revision value 10 to 15 and verify
    components.enterRevisionInSaveAsRevisionModal(15);
    components.verifyContinueBtnVisibleInSaveAsRevisionModal();

    // Change Revision value 15 to 18 and verify
    components.enterRevisionInSaveAsRevisionModal(18);
    components.verifyContinueBtnVisibleInSaveAsRevisionModal();
  })
})
