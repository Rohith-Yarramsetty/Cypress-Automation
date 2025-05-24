import { SignIn } from "../../pages/signin";
import { Headers } from "../../pages/headers";
import { Users } from "../../pages/accountSettings/users";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { FeatureHelpers } from "../../helpers/featureHelper";

const faker = require('faker');
const signin = new SignIn();
const header = new Headers();
const user = new Users();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const userApi = new UsersApi();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
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

describe('Reviewer Settings Module', () => {
  beforeEach(() => {
    // Invite a User wit role Reviewer
    const reviewer = userApi.createUserUsingApi('REVIEWER',);

    // Signin with Reviewers Account
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(reviewer.email);
    authApi.signin(reviewer.email);
    navHelper.navigateToSearch();
  })

  it('User having role type reviewer should not be able to edit the company profile', () => {
    // Navigate to Company Settings page
    cy.visit('/settings/company');

    // Verify necessary fields are readOnly
    user.verifyCountryInCompanyProfileIsNotEditable();
    user.verifyCompanyNameInCompanyProfileIsNotEditable();
    user.verifyCompanyWebsiteInCompanyProfileIsNotEditable();
    user.verifyAddressStreetInCompanyProfileIsNotEditable();
    user.verifyAddressSuiteInCompanyProfileIsNotEditable();
    user.verifyCityInCompanyProfileIsNotEditable();
    user.verifyStateInCompanyProfileIsNotEditable();
    user.verifyZipCodeInCompanyProfileIsNotEditable();
  })

  it('User having role type reviewer should not be able to switch in sandbox mode', () => {
    navHelper.navigateToSearch();

    // Click on Avatar Icon
    header.clickOnAvatarIcon();

    // Verify SandBox Option not present
    user.verifySandBoxOptionNotPresentInSettings();
  })

  it('User having role type reviewer should not be able to view users, groups and company settings', () => {
    navHelper.navigateToSearch();

    // Navigate to Groups page
    cy.visit('/settings/groups');
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Page not Present
    user.verifyGroupsPageNotPresent();

    // Navigate to Users page
    cy.visit('/settings/users');
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Page not Present
    user.verifyUsersPageNotPresent();
  })
})