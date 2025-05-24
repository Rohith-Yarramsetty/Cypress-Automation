import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Assembly } from "../../pages/components/assembly";
import { UsersApi } from "../../api/userApi";
import { ComponentApi } from "../../api/componentApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const fakerHelper = new FakerHelpers();
const assembly = new Assembly();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const changeOrders = new ChangeOrders();

describe("Components", { tags: ["Revision", "Released_Revision", "Released_Revision_Components"] }, () => {
  let email, companyId, orgId, supplierEmail, authorName;

  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    authorName = user.fullName;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
    // Add Supplier role user
    supplierEmail = userApi.createUserUsingApi('SUPPLIER').email
    userApi.acceptInvitation(supplierEmail);
  })

  beforeEach(function () {
    authApi.signin(supplierEmail);
    navHelper.navigateToSearch();
  })
  
  afterEach(() => {
    authApi.signOut();
  })
  
  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("Released Revision for Component", () => {
    let cmpData1, cmpData2, cmpData3;
    before(() => {
      // Sign in with Admin role
      authApi.signin(email);
      navHelper.navigateToSearch();

      // Create 3 components
      cmpData1 = {
        category     : 'EBOM',
        name         : fakerHelper.generateComponentName(),
        revision     : 1,
        status       : constData.status.prototype
      }
      cmpData2 = {
        category     : 'EBOM',
        name         : fakerHelper.generateComponentName(),
        revision     : 1,
        status       : constData.status.prototype
      }
      cmpData3 = {
        category     : 'EBOM',
        name         : fakerHelper.generateComponentName(),
        revision     : 1,
        status       : constData.status.prototype
      }
      compApi.createComponent(cmpData1);
      compApi.createComponent(cmpData2);
      compApi.createComponent(cmpData3);

      // Add cmp3 as child for cmp2
      const cmp3AssemblyData = {
        CPN       : '910-00003' ,
        Quantity  : 1
      }
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData2.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(cmp3AssemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Add cmp2 as child for cmp1
      const cmp2AssemblyData = {
        CPN       : '910-00002' ,
        Quantity  : 1
      }
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData1.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(cmp2AssemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Add all components to change order and Approve the CO
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData1.name);
      components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
      components.clickAddToChangeOrderInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData3.name);
      changeOrders.clickMcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.approveNewChangeOrder();

      // Navigate to cmp1 and enter eid and save the component
      components.navigateToComponentEditPage(cmpData1.name, false);
      components.enterEidInComponentEditPage('eid-111');
      components.clickSaveButtonInEditComponent();
      components.verifyEidInViewPage('eid-111');
    })

    after(() => {
      compSettings.resetCompany(companyId);
    })

    it('should edit component from released revision route correctly', () => {
      // Go to edit page for cmp1 and update the description and verify
      components.navigateToComponentEditPage(cmpData1.name, false);
      components.enterDescriptionInEditComponent('desc updated');
      components.clickSaveButtonInEditComponent();
      components.verifyDescInCmpViewPage('desc updated');
    })

    it('should revert changes from modified history table correctly', () => {
      // Go to cmp1 and navigate to previous revision
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData1.name);
      components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
      components.clickOnPreviousRevision(1);

      // Revert back the changes
      components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
      components.clickOnRevertBackInCmpViewPage();
      components.clickYesBtnInConfirmRevertChanges();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify revision and revision modified icon
      components.verifyRevisionInViewComponent(2);
      components.verifyComponentRevisionModifiedIconNotPresent();
    })

    it('should go to component view page from released revision route correctly', () => {
      components.navigateToComponentViewPage('910-00001', false, 'cpn');

      components.clickOnHistoryIcon();
      components.clickOnPreviousRevision(1);

      components.verifyRevisionInViewComponent(2);
      components.verifyComponentRevisionModifiedIconPresent();
    })
  })
});
