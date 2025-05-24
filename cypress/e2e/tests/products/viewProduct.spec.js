import { Products } from "../../pages/products/products";
import { Navigation } from "../../pages/navigation";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { SignIn } from "../../pages/signin";

const products = new Products();
const nav = new Navigation();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const signin = new SignIn();

let email, companyId, orgId;

describe("View Product tests", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
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

  it('Should update the Revision with given value in save as revision modal', () => {
    nav.openProductTab();
    const prodName = fakerHelper.generateProductName()
    products.createBasicProduct(prodName);

    // Change Revision value empty to 1 and verify
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.enterRevisionInSaveAsRevisionModal(1);
    products.clickContinueBtnInSaveAsRevisionModal();
    products.verifyRevisionInViewProduct(1);

    // Change Revision value 1 to 3 and verify
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.enterRevisionInSaveAsRevisionModal(3);
    products.clickContinueBtnInSaveAsRevisionModal();
    products.verifyRevisionInViewProduct(3);

    // Change Revision value 3 to 6 and verify
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.enterRevisionInSaveAsRevisionModal(6);
    products.clickContinueBtnInSaveAsRevisionModal();
    products.verifyRevisionInViewProduct(6);

    // Change Revision value 6 to 10 and verify
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.enterRevisionInSaveAsRevisionModal(10);
    products.clickContinueBtnInSaveAsRevisionModal();
    products.verifyRevisionInViewProduct(10);

    // Change Revision value 10 to 15 and verify
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.enterRevisionInSaveAsRevisionModal(15);
    products.clickContinueBtnInSaveAsRevisionModal();
    products.verifyRevisionInViewProduct(15);

    // Change Revision value 15 to 18 and verify
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.enterRevisionInSaveAsRevisionModal(18);
    products.clickContinueBtnInSaveAsRevisionModal();
    products.verifyRevisionInViewProduct(18);
  })

  it('Should show the Continue button in visible state after changing Revision values', () => {
    nav.openProductTab();
    const prodName = fakerHelper.generateProductName()
    products.createBasicProduct(prodName);

    // Change Revision value empty to 1 and verify
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.enterRevisionInSaveAsRevisionModal(1);
    products.verifyContinueBtnEnabledInSaveAsRevisionModal();

    // Change Revision value 1 to 3 and verify
    products.enterRevisionInSaveAsRevisionModal(3);
    products.verifyContinueBtnEnabledInSaveAsRevisionModal();

    // Change Revision value 3 to 6 and verify
    products.enterRevisionInSaveAsRevisionModal(6);
    products.verifyContinueBtnEnabledInSaveAsRevisionModal();

    // Change Revision value 6 to 10 and verify
    products.enterRevisionInSaveAsRevisionModal(10);
    products.verifyContinueBtnEnabledInSaveAsRevisionModal();

    // Change Revision value 10 to 15 and verify
    products.enterRevisionInSaveAsRevisionModal(15);
    products.verifyContinueBtnEnabledInSaveAsRevisionModal();

    // Change Revision value 15 to 18 and verify
    products.enterRevisionInSaveAsRevisionModal(18);
    products.verifyContinueBtnEnabledInSaveAsRevisionModal();
  })
})
