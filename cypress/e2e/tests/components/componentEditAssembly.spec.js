import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Assembly } from "../../pages/components/assembly";
import { Users } from "../../pages/accountSettings/users";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { FakerHelpers } from "../../helpers/fakerHelper";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const assembly = new Assembly();
const user = new Users();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const fakerHelpers = new FakerHelpers();

let email, companyId, orgId;

describe("Test Components", () => {
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

  context("Component Edit ASSEMBLY Module with Vendor Modal", () => {
    beforeEach(function () {
      const parentCmpData = {
        componentType: constData.componentType.assembly,
        compName: 'Cmp-1',
        category: 'MBOM',
      }

      // Navigate to Componets tab
      nav.openComponentsTab();
      components.clickonCreateManually();
      components.chooseType(parentCmpData.componentType);
      components.chooseCategory(parentCmpData.category);
      components.enterComponentName(parentCmpData.compName);
      components.selectStatus(constData.status.design);
      components.clickOnCreate();
    })

    it('Add another feature should work correctly in component assembly', () => {
      const childCmpData1 = {
        componentType: constData.componentType.electrical,
        category: '(212) Capacitor',
        mpn: 'GRM32ER60J107ME20L'
      }

      const childCmpData2 = {
        componentType: constData.componentType.electrical,
        category: '(212) Capacitor',
        mpn: 'GRM188R61C105KA93D'
      }

      // Navigate to assembly tab and create component using Add from vendor
      assembly.clickOnAddFromVendor();
      components.chooseCategoryInImportVendorPage(childCmpData1.category);
      components.enterMpn(childCmpData1.mpn)
      assembly.checkAddAnotherCheckBx();

      // Verify Success Notification toast appears
      components.clickOnCreate();
      assembly.verifySuccessNotificationAppear();

      components.enterMpn(childCmpData2.mpn)
      assembly.uncheckAddAnotherCheckBx();
      components.clickOnCreate();
      assembly.verifySuccessNotificationAppear();
    })
  })

  context("Component Edit ASSEMBLY Module with Manual Modal", () => {
    beforeEach(function () {
      const parentCmpData = {
        componentType: constData.componentType.assembly,
        compName: 'Cmp-1',
        category: '(912) MBOM',
      }

      // Navigate to Componets tab
      nav.openComponentsTab();
      components.clickonCreateManually();
      components.chooseType(parentCmpData.componentType);
      components.chooseCategory(parentCmpData.category);
      components.enterComponentName(parentCmpData.compName);
      components.selectStatus(constData.status.prototype);
      components.enterComponentDescription('Desc related to Comp');
      components.clickOnCreate();
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
      components.clickEditIcon();
    })

    it('Add another feature should work correctly in component assembly', () => {
      const childCmpData1 = {
        componentType: constData.componentType.mechanical,
        compName: 'Cmp-2',
        category: '(410) Adhesive',
        Quantity: "1",
        cpn: '410-00001'
      }

      const childCmpData2 = {
        componentType: constData.componentType.mechanical,
        compName: 'Cmp-3',
        category: '(410) Adhesive',
        Quantity: "1",
        cpn: '410-00002'
      }

      // Navigate to assembly tab and create component manually
      assembly.clickOnAssemblyTab();
      assembly.clickonCreateManually();
      assembly.checkAddAnotherCheckBx();
      components.chooseType(childCmpData1.componentType);
      components.chooseCategory(childCmpData1.category);
      components.enterComponentName(childCmpData1.compName);
      components.enterRevision(1);
      components.selectStatus(constData.status.design);

      // Verify Success Notification toast appears
      components.clickOnCreate();
      assembly.verifySuccessNotificationAppear();
      components.chooseCategory(childCmpData2.category);
      components.enterComponentName(childCmpData2.compName);
      components.enterRevision(1);
      components.selectStatus(constData.status.design);
      assembly.checkAddAnotherCheckBx();
      components.clickOnCreate();
      assembly.verifySuccessNotificationAppear();
      assembly.cancelCreateManually();

      // Enter the quantity for Child components
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, childCmpData1.Quantity, childCmpData1.cpn)
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, childCmpData2.Quantity, childCmpData2.cpn)
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Navigate to assemly tab and verify number of child components
      assembly.clickOnAssemblyTab();
      user.verifyNoOfRowsPresentInUsersTable(2)
    })

    it('Should display errors on assembly tab', () => {
      const childCmpData1 = {
        componentType: constData.componentType.mechanical,
        compName: 'Cmp-2',
        category: '(410) Adhesive',
        Quantity: "1",
        cpn: '410-00001'
      }

      const childCmpData2 = {
        componentType: constData.componentType.mechanical,
        compName: 'Cmp-3',
        category: '(410) Adhesive',
        Quantity: "1",
        cpn: '410-00002'
      }

      // Navigate to assembly tab and create component manually
      assembly.clickOnAssemblyTab();
      assembly.clickonCreateManually();
      assembly.checkAddAnotherCheckBx();
      components.chooseType(childCmpData1.componentType);
      components.chooseCategory(childCmpData1.category);
      components.enterComponentName(childCmpData1.compName);
      components.enterRevision(1);
      components.selectStatus(constData.status.design);
      components.clickOnCreate();
      assembly.verifySuccessNotificationAppear();
      assembly.cancelCreateManually();

      // Verify the error count before and after entering the quantity value
      assembly.verifyErrorCountInAssemblyTab(1);
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, childCmpData1.Quantity, childCmpData1.cpn)
      assembly.verifyNoErrorInAssemblyTab();
      components.clickSaveButtonInEditComponent();
    })

    it('Should create and add component in assembly successfully', () => {
      const childCmpName = fakerHelpers.generateComponentName();
      assembly.clickOnAssemblyTab();
      assembly.clickonCreateManually();
      components.chooseCategory(constData.mechanicalComponents.adhesive);
      components.enterComponentName(childCmpName);
      components.selectStatus();
      components.enterComponentDescription('Desc related to Comp');
      components.clickOnCreate();
      featureHelper.getCpnValueFromTable(childCmpName, 1).then((value) => {
        let childCpnValue = value
        assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, childCpnValue)
        components.clickSaveButtonInEditComponent();
        assembly.verifyAssemblyChildCount(1)
      })
    })
  })
})
