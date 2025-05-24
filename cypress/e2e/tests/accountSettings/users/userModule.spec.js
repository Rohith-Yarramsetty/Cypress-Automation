import { AuthApi } from "../../../api/auth";
import { SignIn } from "../../../pages/signin";
import { UsersApi } from "../../../api/userApi";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { Users } from "../../../pages/accountSettings/users";
import { NavHelpers } from "../../../helpers/navigationHelper";
import { FeatureHelpers } from "../../../helpers/featureHelper";
import { CompanySettingsApi } from "../../../api/companySettingsApi";

const user = new Users();
const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const faker = require('faker');
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const featureHelpers = new FeatureHelpers();
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
  navHelper.navigateToUsers();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

context('User Settings module', () => {
  beforeEach(function () {
    const data = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      jobTitle: "Test Engineer",
      role: "User",
      groupName: "QA"
    }
    const email = fakerHelper.generateMailosaurEmail(data.firstName, data.lastName)

    // Create user
    user.createUser(data.firstName, data.lastName, email, data.jobTitle, data.role, data.groupName)
    authApi.signOut();

    // login with created user
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(email);
    authApi.signin(email);

    // Navigate users settings
    navHelper.navigateToUsers();
  })

  it('User having role type user should be able to add new user', () =>{
    const data = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      jobTitle: "Test Engineer",
      role: "User",
      groupName: "QA"
    }
    const email = fakerHelper.generateMailosaurEmail(data.firstName, data.lastName)

    // Create user using another user
    user.createUser(data.firstName, data.lastName, email, data.jobTitle, data.role, data.groupName)
    featureHelpers.waitForLoadingIconToDisappear();

    // Verify no users in table
    user.verifyNoOfRowsPresentInUsersTable(3);
  })

  it('User having role type user should be able to add user in groups', () =>{
    // Navigate to groups tab and verify add user option
    navHelper.navigateToGroups();
    user.verifyAddUserForQaEnabledInGroups();
  })

  it('User having role type user should not be able to edit the company profile', () =>{
    // Navigate to company profile tab and verify all options should not be editable
    navHelper.navigateToCompanyProfile();
    user.verifyCompanyNameReadOnlyInCompanyProfile();
    user.verifyCompanyWebsiteReadOnlyInCompanyProfile();
    user.verifyAddressStreetReadOnlyInCompanyProfile();
    user.verifyAddressSuiteReadOnlyInCompanyProfile();
    user.verifyCityReadOnlyInCompanyProfile();
    user.verifyStateDisabledInCompanyProfile();
    user.verifyZipCodeReadOnlyInCompanyProfile();
    user.verifyCountryReadOnlyInCompanyProfile();

    // Verify save and cancel buttons disabled
    user.verifyCancelBtnDisabledInCompanyProfile();
    user.verifySaveBtnDisabledInCompanyProfile();
  })
})
