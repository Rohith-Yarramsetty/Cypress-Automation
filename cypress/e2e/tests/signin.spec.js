import { AuthApi } from "../api/auth";
import { SignIn } from "../pages/signin";
import { UsersApi } from "../api/userApi";
import { Signup }  from "../pages/signup";
import { Headers } from "../pages/headers";
import { Navigation } from "../pages/navigation";
import { UserProfile } from "../pages/userProfile";
import { NavHelpers } from "../helpers/navigationHelper";
import { CompanySettingsApi } from "../api/companySettingsApi";
import { FeatureHelpers } from "../helpers/featureHelper";
import { Utils } from "../helpers/utils";
import userProfileSelectors from "../selectors/accountSettings/users";

const signin = new SignIn();
const header = new Headers();
const authApi = new AuthApi();
const nav = new Navigation();
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const navigation = new Navigation();
const userProfile = new UserProfile();
const featureHelpers = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

beforeEach(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
  nav.openDashboard();
})

afterEach(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Duro labs Sigin Test Cases", () => {
  it('Signin page view', () => {
    // Open login page
    authApi.signOut();
    cy.visit('')

    // Verify Login page
    if(!Cypress.config().baseUrl.includes("test")) signin.verifyPageView();
    else {
      cy.origin( featureHelpers.propelAuthUrl(), { args: {} }, ({}) => {
        cy.contains('Welcome').should('have.text', 'Welcome');
        cy.get('#email').should('be.visible');
        cy.get('#password').should('be.visible');
        cy.contains('Log In').should('be.visible');
        cy.contains('Forgot Password?').should('be.visible');
        cy.contains('Sign in with SSO').should('be.visible');
        cy.contains('Sign in with Google').should('be.visible');
      })
    }
  })

  it('Signin with invalid credentials', () =>{
    // Navigate to profile page
    nav.openProfilePage();
    userProfile.verifyEmail(email);

    // Change the password & logout
    userProfile.changePasswordThroughDuro("Success@2023");
    userProfile.logOutFromAuthPage();
    Cypress.session.clearAllSavedSessions();

    // Verify the signin with invalid password
    if(!Cypress.config().baseUrl.includes("test")) {
      signin.enterEmail(email);
      signin.enterPassword(Cypress.env("password"));
      signin.clickSignIn();

      // Verify the error message
      signin.verifyErrorMessage("No account found with those credentials.");
    } else {
      let password = Cypress.env("password");
      cy.origin( featureHelpers.propelAuthUrl(), { args: {email, password} }, ({email, password}) => {
        cy.get('#email').type(email);
        cy.get('#password').type(password);
        cy.contains('Log In').click();

        // Verify the error message
        cy.contains("No account found with those credentials.").should('be.visible');
      })
    }
  })

  it('Signin with valid credentials', () =>{
    // Open login page
    authApi.signOut();
    cy.visit('')
    signin.navigateToUrl();

    // Signin with a valid account
    signin.signin(email);

    // Verify the page after login
    navigation.verifyNavigationMenuItems();
    header.signout();
  })

  it('Reset the password', () => {
    // Navigate to profile page
    nav.openProfilePage();
    userProfile.verifyEmail(email);

    // Change the password & logout
    userProfile.changePasswordThroughDuro("Success@2023");
    userProfile.logOutFromAuthPage();
    Cypress.session.clearAllSavedSessions();

    // Proceed with password reset
    if(!Cypress.config().baseUrl.includes("test")) {
      signin.clickOnFogotPasswordLink();
      signin.enterForgotPasswordEmail(email);
      signin.clickOnResetPasssword();

      signin.verifyResetSuccessMessage();
    } else {
      cy.origin( featureHelpers.propelAuthUrl(), { args: {email} }, ({email}) => {
        cy.contains('Forgot Password?').click();
        cy.get('body').should('contain.text', 'Reset your password')
        cy.get('input#email').type(email, {force: true}).should('have.value', email);
        cy.get('.reset-btn').click();
        // cy.get('body').should('contain.text', 'If that email address is in our database, we will send you an email to reset your password.');
      })
    }

    // Verify the password reset verification email
    let date = new Date(), env;
    featureHelpers.getExportEmail(date, email).then((exportEmail) => {
      if(Cypress.config().baseUrl.includes('staging')) env = "Staging"; else env = `QA${Utils.getEnvIndex()}`
      expect(exportEmail.subject).to.eq(`Reset your ${env} password`);
    })
  })

  it('Verify the error for most commonly used password', () => {
    // Navigate to profile page
    nav.openProfilePage();
    userProfile.verifyEmail(email);

    let old_Password = Cypress.env('password')
    // Navigate to Auth page for password change
    cy.contains('Password').click({force: true});

    if(Cypress.config().baseUrl.includes('staging')) {
      cy.contains('Update Password').click();
      cy.xpath(userProfileSelectors.profilePage.oldPassword)
        .clear().type(old_Password)
        .should('have.value', old_Password);

      // Verify error with most often password
      cy.get('form div>div>div').eq(1).type('123456789');
      cy.get('form button').contains('Update Password').click();
      cy.contains('Password is too commonly used. Please choose something more secure.')
        .should('be.visible')
    } else {
      cy.origin(featureHelpers.propelAuthUrl()+'/account',
      { args: {old_Password} }, ({old_Password}) => {
        cy.contains('Update Password').click();

        cy.get('form').within(() => {
          cy.get('div>div>div').eq(0).type(old_Password);

          // Verify error with most often password
          cy.get('div>div>div').eq(1).type('123456789');
          cy.get('button').contains('Update Password').click();
          cy.contains('Password is too commonly used. Please choose something more secure.')
            .should('be.visible')
        })
      })
    }
  })
})
