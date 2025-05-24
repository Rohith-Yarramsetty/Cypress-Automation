import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { Products } from "../../pages/products/products";
import { Assembly } from "../../pages/components/assembly";
import { Variants } from "../../pages/components/variants";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const products = new Products();
const variants = new Variants();
const assembly = new Assembly();
const navHelper = new NavHelpers();
const components = new Components();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

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

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Product Documents Module", () => {
  it('should upload and create the document URL correctly', () => {
    // Create a product
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName('TEST_PROD');
    products.uploadDocuments('apple.jpg');
    products.clickCreateButton();
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the Document link
    products.clickOnDocumentsTab();
    products.verifyDocumentLink();
  })
})
