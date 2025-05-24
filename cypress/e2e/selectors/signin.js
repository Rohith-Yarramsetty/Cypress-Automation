export default {

  url: "https://qa-gcp.durolabs.xyz/signin",

  pageHeader: '//*[text()="Welcome"]',
  emailTxtBx: '#email',
  passwordTxtBx: '#password',
  signinBtn: '//button[text()="Log In"]',
  signupLink: '//a[text()="Sign up"]',
  forgotLink: '//*[text()="Forgot Password?"]',
  signinWithGoogleBtn: '//span[text()="Sign in with Google"]',
  signinWithEmailBtn: '//span[text()="Sign in with Email"]',
  ssoBtn: '//span[text()="Sign in with SSO"]',
  errorMessage: '[type=error]',
  submitButton: '//button[text()="Log In"]',
  resetSuccessMessage: '//h5[text()="Reset your password"]//parent::div//p',
  forgotPasswordEmail: '[placeholder="email@example.com"]',
  resetBtn: '//button[text()="Reset Password"]',
}
