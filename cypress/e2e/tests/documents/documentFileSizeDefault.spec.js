import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { UsersApi } from "../../api/userApi";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Products } from "../../pages/products/products";
import { SignIn } from "../../pages/signin";
import { FeatureHelpers } from "../../helpers/featureHelper";

const fakerHelper = new FakerHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const nav = new Navigation();
const userApi = new UsersApi();
const compSettings = new CompanySettingsApi();
const products = new Products();
const signin = new SignIn();
const featureHelper = new FeatureHelpers();

let email, orgId, companyId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
    compSettings.updateCompanySettings(companyId, compPayloads.documentMaxSize('25000000'));
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

describe("Document file sizes", () => {
  it('document should be rejected, if its size is more than company max file size limit(25 MB)', () => {
    // Navigate to Product Tab
    nav.openProductTab();

    // Fill product creation form
    const prodName = fakerHelper.generateProductName();
    products.clickNewButton();
    products.checkCategoryItem(constData.productType.firmware);
    products.enterProductName(prodName);
    products.selectLifeCycleStatus(constData.status.prototype);
    products.enterRevision(1);

    // Upload 26MB size document and Verify error message
    products.uploadDocuments('26MB.bin');
    products.verifyErrorMessage();
  })

  it('document should be uploaded, if its size is equal to company max file size limit(25 MB)', () => {
    // Fill product creation form
    nav.openProductTab();
    const prodName = fakerHelper.generateProductName();
    products.clickNewButton();
    products.checkCategoryItem(constData.productType.firmware);
    products.enterProductName(prodName);
    products.selectLifeCycleStatus(constData.status.prototype);
    products.enterRevision(1);

    // Upload 25MB size document and create the product
    products.uploadDocuments('25MB.png');
    products.clickCreateButton();
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify no of rows in documents tab
    products.clickOnDocumentsTab();
    products.verifyNoOfRowsPresentInDocumentsTable(1);
  })
})
