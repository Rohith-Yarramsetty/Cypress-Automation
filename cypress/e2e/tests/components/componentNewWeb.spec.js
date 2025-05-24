import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { ComponentApi } from "../../api/componentApi";
import { Sourcing } from "../../pages/components/sourcing";
import { TableHelpers } from "../../helpers/tableHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const sourcing = new Sourcing();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();

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

describe("Component New from VendorModule", () => {
  it("Duplicate MPN error should disappear after auto populating the SKU and category combination from heading.", () => {
    const data = {
      componentType : constData.componentType.electrical,
      category      : constData.electricalComponents.capacitor,
      mpn           : 'GRM32ER60J107ME20L',
    }

    // Navigate to Component tab
    nav.openComponentsTab();

    // Import component from Vendor and set first row as primary
    components.importFromVendor(data);

    // Import with same MPN
    nav.openComponentsTab();
    components.clickOnImportFromVendor();
    components.chooseType(data.componentType);
    components.chooseCategoryInImportVendorPage(data.category);
    components.enterMpn(data.mpn);

    // Verify error and click on Import component from vendor to auto populate new MPN
    components.verifyMpnAlreadyExistErrorPresent('MPN already exists in library.', '212-00001');
    components.clickImportCmpFromVendorToAutoPopulateSKUorMPNinput()

    // Verify MPN already exist tooltip not present
    components.verifyMpnAlreadyExistErrorNotPresent();
  })

  it("sources should trigger the modified flag correctly if status is not DESIGN", () => {
    let compOneData = {
        category     : "Capacitor",
        name         : "Cap",
        status       : "PROTOTYPE"
      }

    components.clickonCreateManually();
    components.chooseElectricalType();
    components.chooseCategory(compOneData.category);
    components.selectStatus(compOneData.status);
    components.clickOnCreate();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData = {
      mpn: "mpn1",
      manufacturer: "man1",
      description: "desc1",
    },
    distributorData = {
      dpn: "dpn1",
      distributor: "dist1",
      description: "desc1",
    },
    quoteData = {
      leadTime: "2",
      minQuantity: "1",
      unitPrice: "0.25000",
    };

    sourcing.enterManufacturerData(1, manufacturerData);
    sourcing.enterDistributorData(1, 1, distributorData);
    sourcing.enterQuoteData(1, 1, 1, quoteData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    let manufacturerOneData = {
      mpn: "mpn2",
      manufacturer: "man2",
      description: "desc2",
    },
    distributorOneData = {
      dpn: "dpn2",
      distributor: "dist2",
      description: "desc2",
    },
    quoteOneData = {
      leadTime: "2",
      minQuantity: "1",
      unitPrice: "0.25000",
    };

    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();
    sourcing.enterManufacturerData(2, manufacturerOneData);
    sourcing.enterDistributorData(2, 1, distributorOneData);
    sourcing.enterQuoteData(2, 1, 1, quoteOneData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentRevisionModifiedIconPresent();

    // Revert back the changes
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickOnRevertBackInCmpViewPage();
    components.clickYesBtnInConfirmRevertChanges();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify revision modified icon
    components.verifyComponentRevisionModifiedIconNotPresent();

    // Remove quote and verify revision modified icon
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickExpand();
    sourcing.clickQuoteRemoveIcon(1,1,1)
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentRevisionModifiedIconPresent();

    // Revert back the changes
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickOnRevertBackInCmpViewPage();
    components.clickYesBtnInConfirmRevertChanges();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify revision modified icon
    components.verifyComponentRevisionModifiedIconNotPresent();

    // Remove distributor and verify revision modified icon
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickExpand();
    sourcing.clickDistributorRemoveIcon("dist1")
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentRevisionModifiedIconPresent();

    // Revert back the changes
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickOnRevertBackInCmpViewPage();
    components.clickYesBtnInConfirmRevertChanges();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify revision modified icon
    components.verifyComponentRevisionModifiedIconNotPresent();

    // Remove manufacturer and verify revision modified icon
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickExpand();
    sourcing.clickManufacturerRemoveIcon("man1")
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyComponentRevisionModifiedIconPresent();

    // Revert back the changes
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickOnRevertBackInCmpViewPage();
    components.clickYesBtnInConfirmRevertChanges();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify revision modified icon
    components.verifyComponentRevisionModifiedIconNotPresent();
  })
})
