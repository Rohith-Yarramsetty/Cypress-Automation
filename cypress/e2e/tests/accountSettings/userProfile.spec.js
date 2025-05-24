import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { Headers } from "../../pages/headers";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import { ApiHelpers } from "../../helpers/apiHelper";
import { UserProfile } from "../../pages/userProfile";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FeatureHelpers } from "../../helpers/featureHelper";

const signin = new SignIn();
const nav = new Navigation();
const header = new Headers();
const authApi = new AuthApi();
const faker = require('faker');
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const apiHelpers = new ApiHelpers();
const userProfile = new UserProfile();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id})
  companyName = user.companyName;
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
})

beforeEach(() => {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Profile changes module - through PLM', () => {
  it('cancel and save button should be disabled if no changes to profile', () => {
    nav.openProfilePage();

    // Verify save btn & cancel btn
    userProfile.verifySaveBtn('Disabled');
    userProfile.verifyCancelBtn('Disabled');

    // Enter the phone number & verify the butons
    userProfile.enterPhoneNumber();
    userProfile.verifySaveBtn('Enabled');
    userProfile.verifyCancelBtn('Enabled');
  })

  it('User should be able to login to duro post changing the email', () => {
    let newEmail = fakerHelper.generateMailosaurEmail();

    // Verify avatar modal email
    header.clickOnAvatarIcon();
    header.verifyEmailInAvatarModal(email);

    // Verify the profile page email
    nav.openProfilePage();
    userProfile.verifyEmail(email);

    // Change the email
    userProfile.enterEmail(newEmail);
    userProfile.clickSaveBtn();

    // Assign new email to email
    email = newEmail;

    // Re-signin to the application
    Cypress.session.clearAllSavedSessions();
    signin.signin(newEmail);
    navHelper.navigateToSearch();

    // Verify avatar modal email
    header.clickOnAvatarIcon();
    header.verifyEmailInAvatarModal(newEmail);

    // Verify the profile page email
    nav.openProfilePage();
    userProfile.verifyEmail(newEmail);
  })

  it('Verify the details of user after profile details got updated', () => {
    const userData = {
      firstName   :  faker.name.firstName() + "firstName",
      lastName    :  faker.name.lastName() + "lastName",
      phoneNo     :  "(234) 567-890",
      jobTitle    :  "QA",
    }

    // Enter the Profile data & save
    nav.openProfilePage();
    userProfile.enterFirstName(userData.firstName);
    userProfile.enterLastName(userData.lastName);
    userProfile.enterPhoneNumber(userData.phoneNo);
    userProfile.enterJobTitle(userData.jobTitle);
    userProfile.clickSaveBtn();

    // Navigate to dashboard
    nav.openDashboard();

    // Verify the updated profile data
    nav.openProfilePage();
    userProfile.verifyFirstName(userData.firstName);
    userProfile.verifyLastName(userData.lastName);
    userProfile.verifyPhoneNumber(userData.phoneNo);
    userProfile.verifyJobTitle(userData.jobTitle)
  })

  it('Verify the login attempt post password update through Duro', () => {
    const new_Password = Cypress.env('password') + 'new';

    // Navigate to profile page
    nav.openProfilePage();

    // Change the password & logout
    userProfile.changePasswordThroughDuro(new_Password);
    userProfile.logOutFromAuthPage();
    Cypress.session.clearAllSavedSessions();

    // Try signing in with old password
    if(Cypress.config().baseUrl.includes("staging")) {
      signin.verifyPageView();
      signin.enterEmail(email);
      signin.enterPassword();
      signin.clickSignIn();
      signin.verifyErrorMessage("No account found with those credentials.");

      // Try signing in with new password
      signin.enterPassword(new_Password);
      signin.clickSignIn();
    } else {
      cy.origin( featureHelper.propelAuthUrl(),
      { args: {email, old_password: Cypress.env("password"), new_Password} }, ({email, old_password, new_Password}) => {
        cy.get('#email').type(email);
        cy.get('#password').type(old_password);
        cy.contains('Log In').click();

        // Verify the error message
        cy.contains("No account found with those credentials.").should('be.visible');

        cy.get('#email').clear().type(email);
        cy.get('#password').clear().type(new_Password);
        cy.contains('Log In').click();        
      })
    }
    nav.verifyNavigationMenuItems();
    cy.url().should('contain', Cypress.config().baseUrl);
  })
})
