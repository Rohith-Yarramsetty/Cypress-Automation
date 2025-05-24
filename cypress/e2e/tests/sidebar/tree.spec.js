import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Products } from "../../pages/products/products";
import { Assembly } from "../../pages/components/assembly";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { SideBar } from "../../pages/sidebar";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const components = new Components();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const products = new Products();
const assembly = new Assembly();
const importFromFile = new ImportFromFile();
const sidebar = new SideBar();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
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

describe("SideBar Module", () => {
  it("should add components in product assembly and test left nav tree", () => {
    // Create basic product and add assembly components
    nav.openProductTab();
    products.createBasicProduct("New Test Product", constData.status.design, "123-11");
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.uploadFile('10a.new_componens_for_left_nav_tree.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    products.clickSaveButtonInEditProduct();
    assembly.verifyNoOfRowsPresentInAssemblyTable(6);

    // Navigate to child assembly components and add child components
    components.navigateToComponentEditPage("EBOM cmp", false);
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    importFromFile.checkExistingComponentsForAssemblyImport();
    importFromFile.uploadFile('10b.add_components_to_assembly.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    assembly.verifyNoOfComponentsInAssemblytable(3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Select product from sidebar dropdown and verify name
    cy.reload();
    nav.openProductTab();
    products.verifyNoOfProductsFromProductsLibrary(1);
    sidebar.verifyProductsDropdownText("Select Product");
    sidebar.clickOnProductsDropdown();
    sidebar.selectProdOrCmpFromDropdown("New Test Product");
    products.verifyProductNameInViewMode("New Test Product");

    // Go to list items and verify names
    sidebar.goToListItem("232-00001");
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("RES one");

    sidebar.goToListItem("212-00001");
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("cap one");

    sidebar.goToListItem("212-00002");
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("cap two");

    sidebar.goToListItem("212-00003");
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("cap three");

    sidebar.goToListItem("912-00001");
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("MBOM cmp");

    // Expand child in side bar and go to assembly components and verify names
    sidebar.clickExpandChildIcon("EBOM cmp");
    sidebar.clickOnChildAssemblyForAssembly("cap one")
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("cap one");

    sidebar.clickOnChildAssemblyForAssembly("cap two")
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("cap two");

    sidebar.clickOnChildAssemblyForAssembly("MBOM cmp")
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("MBOM cmp");
  });

  it("left Nav tree should work correctly with delete functionality", () => {
    // Create basic product and add assembly components
    nav.openProductTab();
    products.createBasicProduct("prd with delete func", constData.status.design, "123-11");
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.uploadFile("10a.new_componens_for_left_nav_tree.xlsx");
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    products.clickSaveButtonInEditProduct();
    assembly.verifyNoOfRowsPresentInAssemblyTable(6);

    // Navigate to product and verify no of child
    nav.openProductTab();
    products.verifyNoOfProductsFromProductsLibrary(1);
    sidebar.verifyProductsDropdownText("999-00001 prd with delete func");
    sidebar.clickOnProductsDropdown();
    products.verifyProductNameInViewMode("prd with delete func")
    assembly.verifyNoOfRowsPresentInAssemblyTable(6);

    // Delete assembly component and verify no of assembly components in side bar
    sidebar.goToListItem("232-00001");
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentNameInViewComponent("RES one");
    components.clickDeleteComponentIconFromDetailsPage();
    components.waitForDeleteComponentModal()
    components.clickDeleteButtonInDeleteComponentModal()
    featureHelper.waitForLoadingIconToDisappear();
    cy.reload();
    nav.openProductTab();
    sidebar.clickOnProductsDropdown();
    sidebar.selectProdOrCmpFromDropdown("prd with delete func");
    sidebar.verifyAssemblyCount(5);
  })
});