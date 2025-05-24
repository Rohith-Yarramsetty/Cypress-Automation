import selectors from '../selectors/signup'

export class Signup {

  enterCompanyName(companyName) {
    cy.get(selectors.companyNameTxtBx).type(companyName);
  }

  enterCompnayEmail(companyEmail) {
    cy.get(selectors.compnayEmailTxtBx).type(companyEmail);
  }

  clickOnContinue() {
    cy.xpath(selectors.continueBtn).click();
  }

  enterFirstName(firstName) {
    cy.get(selectors.firstNameTxt).type(firstName);
  }

  enterLastName(lastName) {
    cy.get(selectors.lastNameTxtBx).type(lastName);
  }

  enterPassword(password){
    cy.get(selectors.passwordTxtBx).type(password);
  }

  enterConfirmPassword(confirmPassword){
    cy.get(selectors.confirmPasswordTxtBx).type(confirmPassword);
  }

  enterPhoneNumber(phoneNumber){
    cy.get(selectors.phonenumberTxtBx).type(phoneNumber);
  }

  acceptTermsAndConditions(){
    cy.get(selectors.acceptTermsCheckBx).check();
  }

  clickOnSignup(){
    cy.xpath(selectors.signupBtn).click();
  }

  enterCompanyDetails(companyName, companyEmail){
    this.enterCompanyName(companyName);
    this.enterCompnayEmail(companyEmail);
  }

  enterAccountDetails(firstName, lastName, password, confirmPassword, phoneNumber){
    this.enterFirstName(firstName);
    this.enterLastName(lastName);
    this.enterPassword(password);
    this.enterConfirmPassword(confirmPassword);
    this.enterPhoneNumber(phoneNumber);
  }

  verifySuccessMessage(email){
    cy.get(selectors.signupSuccessMessageTitle).should('have.text', 'You’re Almost Done');
    cy.get(selectors.signupSuccessMessageContent).should('have.text',
     'We have sent an email to '+email+'. It will expire shortly, please check your inbox and click the link to activate your account now.');
  }

  verifyDomainExistErrorMessage(){
    cy.get(selectors.domainExistError).should('have.text',
     'We could not process this request. Please contact support for help: info@durolabs.co');
  }

  verifyErrorMessage(errorMessage){
    cy.get(selectors.errorMessage).should('have.text', errorMessage);
  }
}