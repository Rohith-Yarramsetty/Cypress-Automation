import { AuthApi } from "../../../api/auth";
import { SignIn } from "../../../pages/signin";
import { UsersApi } from "../../../api/userApi";
import { Headers } from "../../../pages/headers";
import constData from "../../../helpers/pageConstants";
import { Navigation } from "../../../pages/navigation";
import { ComponentApi } from "../../../api/componentApi";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { TableHelpers } from "../../../helpers/tableHelper";
import { Users } from "../../../pages/accountSettings/users";
import { NavHelpers } from "../../../helpers/navigationHelper";
import { Components } from "../../../pages/components/component";
import { CompanySettingsApi } from "../../../api/companySettingsApi";

const user = new Users();
const signin = new SignIn();
const headers = new Headers();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const faker = require('faker');
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const tableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id})
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
  compSettings.resetCompany(companyId)
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

context("Reviewer Settings Module", () => {
  beforeEach(function () {
    const reviewerData = {
      firstName : faker.name.firstName(),
      lastName : faker.name.lastName(),
      jobTitle : "Test Engineer",
      role : "Reviewer",
      groupName : "QA"
    }

    const cmpData = {
      category: "Charger",
      name: "Cmp-1",
      status: constData.status.production,
      revision: 'A'
    }

    let reviewerEmail = fakerHelper.generateMailosaurEmail(reviewerData.firstName, reviewerData.lastName);

    // Go to users settings
    navHelper.navigateToUsers();

    // Create user and sign out from site admin credentials
    user.createUser(reviewerData.firstName, reviewerData.lastName, reviewerEmail, reviewerData.jobTitle, reviewerData.role, reviewerData.groupName)

    // Navigate to Component tab & Create component
    nav.openComponentsTab();
    compApi.createComponent(cmpData);
    authApi.signOut();

    // Sign in with Reviewer credentials
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(reviewerEmail);
    authApi.signin(reviewerEmail);
    navHelper.navigateToSearch();
  })

  it("Reviewer is not allowed to see the un-authorized action icons", () =>{
    // Go to components tab and click on created component
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, "213-00001");

    // Verify Reviewer is not allowed to see the un-authorized action icons
    components.VerifyEditIconNotPresent();
    components.VerifyDuplicateIconNotPresent();
    components.verifyDeleteIconNotPresent();
    components.verifyExportIconNotPresent();
    components.verifyFavoriteIconPresent();
    components.verifyWhereUsedIconPresent();
    components.verifyHistoryIconPresent();
  })

  it("Reviewer is not allowed to navigate component's un-authorized route", () =>{
    let editPageUrl = '/component/edit/'
    let exportPageUrl = '/export'
    let newComponentFileUrl = '/component/new/file'
    let newComponentWebUrl = '/component/new/web'
    let newComponentManualUrl = '/component/new/manual'

    // Verify Reviewer is not allowed to navigate component's un-authorized route
    navHelper.verifySpecifiedPathNotAccessIble(editPageUrl);
    navHelper.verifySpecifiedPathNotAccessIble(exportPageUrl);
    navHelper.verifySpecifiedPathNotAccessIble(newComponentFileUrl);
    navHelper.verifySpecifiedPathNotAccessIble(newComponentWebUrl);
    navHelper.verifySpecifiedPathNotAccessIble(newComponentManualUrl);
  })
})
