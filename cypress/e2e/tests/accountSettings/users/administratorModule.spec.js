import { AuthApi } from "../../../api/auth";
import { SignIn } from "../../../pages/signin";
import { UsersApi } from "../../../api/userApi";
import constData from "../../../helpers/pageConstants";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { TableHelpers } from "../../../helpers/tableHelper";
import { Users } from "../../../pages/accountSettings/users";
import { NavHelpers } from "../../../helpers/navigationHelper";
import { CompanySettingsApi } from "../../../api/companySettingsApi";

const user = new Users();
const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const faker = require('faker');
const navHelper = new NavHelpers();
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

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

context("Administrator Settings Module", () => {
  beforeEach(function () {
    const administratorData = {
      firstName : faker.name.firstName(),
      lastName : faker.name.lastName(),
      jobTitle : "Test Engineer",
      role : "Administrator",
      groupName : "QA"
    }

    let adminstratorEmail = fakerHelper.generateMailosaurEmail(administratorData.firstName, administratorData.lastName);

    // Go to users settings
    navHelper.navigateToUsers();

    // Create user and sign out from site admin credentials
    user.createUser(administratorData.firstName, administratorData.lastName, adminstratorEmail, administratorData.jobTitle, administratorData.role, administratorData.groupName)
    authApi.signOut();

    // Sign in with Administrator credentials
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(adminstratorEmail);
    authApi.signin(adminstratorEmail);
  })

  it("administrator can't edit the site admin info", () =>{
    // Go to users settings
    navHelper.navigateToUsers();
    tableHelper.clickOnCell(constData.usersTableHeaders.EMAIL, email);

    // Verify All the fields are editable
    user.verifyFirstNameIsReadOnly();
    user.verifyLastNameIsReadOnly();
    user.verifyEmailIsReadOnly();
    user.verifyRoleIsReadOnly();
    user.verifyJobTitleIsReadOnly();

    user.verifyGroupReadOnly("QA");
    user.verifyGroupReadOnly("Engineering");
    user.verifyGroupReadOnly("Supplier");
    user.verifyGroupReadOnly("Management");
    user.verifyGroupReadOnly("Procurement");
  })

  it('user having role type administrator should be able to add user in groups', () =>{
    // Navigate to Groups page and verify add user button enabled
    navHelper.navigateToGroups();
    user.verifyAddUserForQaEnabledInGroups();
  })

  it('user having role type administrator should be able to edit the company profile', () =>{
    // Go to company profile
    navHelper.navigateToCompanyProfile();

    // Verify All the fields are editable
    user.verifyCompanyNameInCompanyProfileIsEditable();
    user.verifyCompanyWebsiteInCompanyProfileIsEditable();
    user.verifyAddressStreetInCompanyProfileIsEditable();
    user.verifyAddressSuiteInCompanyProfileIsEditable();
    user.verifyCityInCompanyProfileIsEditable();
    user.verifyStateInCompanyProfileIsEditable();
    user.verifyZipCodeInCompanyProfileIsEditable();
  })
})
