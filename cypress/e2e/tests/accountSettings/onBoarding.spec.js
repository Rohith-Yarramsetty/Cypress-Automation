import { SignIn } from "../../pages/signin";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { TableHelpers } from "../../helpers/tableHelper";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { Headers } from "../../pages/headers";
import { SandBox } from "../../pages/accountSettings/sandBox";
import { UsersApi } from "../../api/userApi";

const faker = require('faker');
const signin = new SignIn();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const tableHelper = new TableHelpers();
const compSettings = new CompanySettingsApi();
const nav = new Navigation();
const sandBox = new SandBox();
const userApi = new UsersApi();
const header = new Headers()

describe("Onboarding Module - testcases", () => {

  let email, companyId, orgId;

  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then(res => {companyId = res.body.data.company});

    // Navigate to search and click on Avatar icon
    navHelper.navigateToSearch();
    header.clickOnAvatarIcon();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  describe('On boarding Module initial login', () => {
    it('should create sample product successfully', () => {
      // Switch to sandbox option and verify the popover
      sandBox.clickOnSandBoxOption();
      sandBox.verifyPrivateSandBoxPopOverPresent();
      sandBox.verifySandBoxLogoPresent();
      sandBox.verifySandBoxMsg('You’re in Sandbox.')
      sandBox.clickOngotItBtnInPopOver();

      // Verify sample product present
      nav.openComponentsTab();
      sandBox.clickOnProductTab();
      tableHelper.assertRowPresentInTable(constData.productTableHeaders.name, "Drone D100")

      // click on exit sandbox and verify company account popover
      sandBox.clickOnExitSandBox();
      sandBox.verifyCompanyAccPopOverPresent();
    })
  })

  describe('On boarding module from other pages', () => {
    it('PLM1943 Error Dialog', () => {
      // Switch to sandbox option and verify the popover
      sandBox.clickOnSandBoxOption();

      // click on exit sandbox
      sandBox.clickOnExitSandBox();
    })

    it('on-boarding should work properly if user navigated to search route before starting tutorials', () => {
      // Switch to sandbox option
      sandBox.clickOnSandBoxOption();
      sandBox.clickOngotItBtnInPopOver();

      // Navigate to Product Tab
      nav.openProductTab();

      // click on exit sandbox and verify company account popover
      sandBox.clickOnExitSandBox();
      sandBox.verifyCompanyAccPopOverPresent();
    })
  })
})
