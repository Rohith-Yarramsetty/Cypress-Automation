import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { ComponentApi } from "../../api/componentApi";
import { UsersApi } from "../../api/userApi";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Products } from "../../pages/products/products";
import { Assembly } from "../../pages/components/assembly";
import { Sourcing } from "../../pages/components/sourcing";


const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const fakerHelper = new FakerHelpers();
const compApi = new ComponentApi();
const userApi = new UsersApi();
const featureHelper = new FeatureHelpers();
const product = new Products();
const assembly = new Assembly();
const sourcing = new Sourcing();

let email, companyId, orgId;

describe("Import module", () => {
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

  context("Should fire modals when export sidebar is open", { defaultCommandTimeout: 120000 }, () => {
    it("Should be able to fire 'import from file' modal when export sidebar is open", () => {
      let cmpData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.design,
      }

      // Create a Component and select the component and click on Export
      compApi.createComponent(cmpData);
      nav.openComponentsTab();
      tableHelper.checkTableRow(cmpData.name);
      components.clickExportInCmpLibrary();

      // Click on Import from file and verify Import from file modal
      importFromFile.clickOnImportFromFile();
      importFromFile.verifyImportFromFileModalHeading();
    })

    it("Should be able to fire 'import from file' modal when export sidebar is open", () => {
      let cmpData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.design,
      }

      // Create a Component and select the component and click on Export
      compApi.createComponent(cmpData);
      nav.openComponentsTab();
      tableHelper.checkTableRow(cmpData.name);
      components.clickExportInCmpLibrary();

      // Click on Import from file and verify Import from file modal
      components.clickOnImportFromVendor();
      components.verifyImportFromVendorModalHeading();
    })
  })

  context("Use Existing Error Tooltip Apperance Module", () => {
    it("Use existing button should not appear if duplicate object is product", () => {
      const data = {
        prodName: "test product",
        eid: "eid-prd"
      }

      // Create a Component using imort from file
      nav.openComponentsTab();
      importFromFile.clickOnImportFromFile();
      importFromFile.uploadFile('18a.new_component-for-add-assembly.xlsx');
      importFromFile.verifyNecessaryLabelsMapped('EID', 'eid');
      importFromFile.verifyNecessaryLabelsMapped('Description', 'description');
      importFromFile.clickOnContinue();
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();
      importFromFile.waitForFileUpload();
      importFromFile.verifyImportStatusSucceed(3);

      // Create new product
      nav.openProductTab();
      product.clickNewButton();
      product.checkCategoryItem("Electrical")
      product.enterProductName(data.prodName)
      product.selectLifeCycleStatus(constData.status.design)
      product.enterEid(data.eid)
      product.clickCreateButton()
      product.clickSaveButtonInEditProduct();
      product.waitForLoadingIconToDisappear();
      product.clickEditIcon();

      assembly.clickOnAddFromFile();
      assembly.uploadFile('18c.new_component-for-add-assembly.xlsx');
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the labels Mapped
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
      importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Description', 'description');
      importFromFile.verifyNecessaryLabelsMapped('Quantity', 'quantity');
      importFromFile.clickOnContinue();

      // Verify import errors
      importFromFile.errorCountInReviewPage(4);

      importFromFile.hoverOnErroredColumn(0, 1);
      importFromFile.verifyErrorTipPresent("Name already exists in library.");
      importFromFile.verifyWarningTipPresent("Cannot add product as assembly");
      importFromFile.verifyUseExistingButtonNotPresent();

      importFromFile.hoverOnErroredColumn(0, 5);
      importFromFile.verifyErrorTipPresent("EID already exists in library.");
      importFromFile.verifyWarningTipPresent("Cannot add product as assembly");
      importFromFile.verifyUseExistingButtonNotPresent();
    })
  })

  context("Import from vendor Module", () => {
    it('Should verify the error tip in DPN field if it exceeds 100 characters', () => {
      const data = {
        componentType: constData.componentType.electrical,
        category: constData.electricalComponents.resistor,
        mpn: 'RC0603JR-0710KL',
      }

      const dpn = fakerHelper.getRandomStringOfCharacters(101);

      // Navigate to Component tab
      nav.openComponentsTab();

      // Import from Vendor
      components.importFromVendor(data);
      components.clickEditIcon();
      sourcing.navigateToSourcingTab();
      sourcing.clickExpand();

      // Enter DPN (more than 100 characters) and verify the error tool tip
      sourcing.enterDpn(1, 1, dpn);
      sourcing.verifyDpnErrorToolTip(1, 1, "Should be less than 101 characters")
    })
  })
})
