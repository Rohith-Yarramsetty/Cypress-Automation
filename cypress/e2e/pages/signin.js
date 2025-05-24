/// <reference types="cypress" />
import { UsersApi } from "../api/userApi";
import selectors from "../selectors/signin"
import { Navigation } from "./navigation";
import { FeatureHelpers } from "../helpers/featureHelper"

const navigation = new Navigation();
const userApi = new  UsersApi();
const featureHelper = new FeatureHelpers();

export class SignIn {

   navigateToUrl() {
    cy.visit("/signin");
  }

  navigateToSignUp(){
    cy.visit("/signup");
  }

  clickOnSubmit(){
    cy.xpath(selectors.submitButton).contains('Reset Password').click();
  }

  verifyPageView(){
    cy.xpath(selectors.pageHeader).should('have.text', 'Welcome');
    cy.get(selectors.emailTxtBx).should('be.visible');
    cy.get(selectors.passwordTxtBx).should('be.visible');
    cy.xpath(selectors.signinBtn).contains('Log In').should('be.visible');
    cy.xpath(selectors.forgotLink).should('be.visible');
    // cy.xpath(selectors.signupLink).should('be.visible');
    cy.xpath(selectors.ssoBtn).contains('Sign in with SSO').should('be.visible');
    cy.xpath(selectors.signinWithGoogleBtn).contains('Sign in with Google').should('be.visible');
    // cy.xpath(selectors.signinWithEmailBtn).contains('Sign in with Email').should('be.visible');
  }

  verifyErrorMessage(errorMessage){
    cy.get(selectors.errorMessage).should('have.text', errorMessage);
  }

  verifyResetSuccessMessage(){
    cy.get('body').should('contain.text', 
    'If that email address is in our database, we will send you an email to reset your password.');
  }

  signin(email = Cypress.env("username"), password = Cypress.env("password")) {
    const baseUrl = Cypress.config().baseUrl;
    if (baseUrl.includes('test')) {
      return this.signinWithOrigin(email, password)
    }
    cy.visit('/login')
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickSignIn();
    cy.url().should('contain', Cypress.config().baseUrl)
    cy.reload();
    navigation.verifyNavigationMenuItems();
  }

  signinWithOrigin(email = Cypress.env("username"), password = Cypress.env("password")) {
    const baseUrl = Cypress.config().baseUrl;
    if (!baseUrl.includes('test')) {
      return this.signin(email, password)
    }
    cy.origin(
      featureHelper.propelAuthUrl(),
      // Send the args here...
      { args: { email, password } },
      // ...and receive them at the other end here!
      ({ email, password }) => {
        cy.visit('/login')
        cy.get('#email', { timeout: 120000 }).type(email).should('have.value', email);
        cy.get('#password').type(password).should('have.value', password);
        cy.get('button').contains('Log In').click()
      }
    )
    navigation.verifyNavigationMenuItems()
    cy.url().should('contain', Cypress.config().baseUrl)
  }

  enterEmail(email) {
    cy.get(selectors.emailTxtBx, { timeout: 120000 }).type(email).should('have.value', email);
  }

  enterPassword(password = Cypress.env('password')) {
    cy.get(selectors.passwordTxtBx).clear().type(password).should('have.value', password);
  }

  clickSignIn() {
    cy.get('button').contains('Log In').click()
  }

  clickOnFogotPasswordLink(){
    cy.xpath(selectors.forgotLink).click();
    cy.wait(3000)
  }

  enterForgotPasswordEmail(email) {
    cy.get(selectors.forgotPasswordEmail).type(email).should('have.value', email);
  }

  clickOnResetPasssword() {
    cy.xpath(selectors.resetBtn)
      .click()
  }
}
