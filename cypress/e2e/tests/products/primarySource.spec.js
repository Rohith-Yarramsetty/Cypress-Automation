import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants"
import { Sourcing } from "../../pages/components/sourcing";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { Dashboard } from "../../pages/dashboard";
import { Headers } from "../../pages/headers";
import { Components } from "../../pages/components/component";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { Utils } from "../../helpers/utils";

const faker = require('faker');
const signin = new SignIn();
const nav = new Navigation();
const product = new Products();
const fakerhelper = new FakerHelpers();
const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const dashboard = new Dashboard();
const header = new Headers();
const components = new Components();
const compApi = new ComponentApi();
const assembly = new Assembly();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const sourcing = new Sourcing();
const utils = new Utils();

let email, companyId, orgId;

describe("Product Module", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company;
      compSettings.updateCompanySettings(companyId, compPayloads.defaultCurrency('EURO'));
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  describe("with company based customization for Sourcing", () => {
    after(() => {
      compSettings.updateCompanySettings(companyId, compPayloads.shouldAutoSelectRolledUpCost('true'));
    })

    it("should not set rolled-up-cost as default sourcing value, based on company settings", () => {
      const prodData = {
        name     : "prd-1",
        status   : constData.status.design,
        revision : '1'
      }

      // When company flag "shouldAutoSelectRolledUpCost" is TRUE (Default) and manually enetred source is not present
      // then set rolled-up cost automatically as default primary source for products.
      product.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);
      sourcing.navigateToSourcingTab();
      sourcing.verifyRolledUpCostIsAssignedAsPrimary();

      compSettings.updateCompanySettings(companyId, compPayloads.shouldAutoSelectRolledUpCost('false'));

      // When company flag "shouldAutoSelectRolledUpCost" is FALSE then do not set rolled-up cost automatically as default primary source for products.
      const prodOneData = {
        name     : "prd-2",
        status   : constData.status.design,
        revision : '1'
      }

      product.createAndSaveBasicProduct(prodOneData.name, prodOneData.status, prodOneData.revision);
      sourcing.navigateToSourcingTab();
      sourcing.verifyRolledUpCostIsNotAssignedAsPrimary();

      const prodTwoData = {
        name     : "prd-3",
        status   : constData.status.design,
        revision : '1'
      }

      // Despite the company flag "shouldAutoSelectRolledUpCost" value, when a manually enetred source is present
      // then set it as default primary source instead of rolled-up cost.
      nav.openProductTab();
      product.clickNewButton();
      product.enterProductName(prodTwoData.name);
      product.selectLifeCycleStatus(prodTwoData.status);
      product.verifyCreateBtnEnabled();
      product.enterRevision(prodTwoData.revision);
      product.clickCreateButton();
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
        minQuantity: "2",
        unitPrice: "0.250",
        leadTimeUnit : "WEEKS",
      };

      sourcing.navigateToSourcingTab();
      sourcing.enterManufacturerData(1, manufacturerData);
      sourcing.enterDistributorData(1, 1, distributorData);
      sourcing.enterQuoteData(1, 1, 1, quoteData);
      product.clickSaveButtonInEditProduct();
      featureHelpers.waitForLoadingIconToDisappear();
      sourcing.verifyCustomQuoteSetAsPrimary(1);
     })
  });

  it('should set primary source correctly', () => {
    const prodData = {
      name     : fakerhelper.generateProductName(),
      status   : constData.status.production,
      revision : 'P'
    }

    // Create a product
    product.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify unit price & lead time
    product.verifyUnitPriceInViewPage('€0.0000');
    product.verifyleadTimeInViewPage('0 DAYS');
    product.verifyMinQuantityInViewPage('1');

    // / Unset Roll-up cast
    sourcing.navigateToSourcingTab();
    sourcing.uncheckRolledUpCostCheckBox();
    product.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData = {
      mpn: "mpn2",
      manufacturer: "man2",
      description: "desc2",
    },
    distributorData = {
      dpn: "dpn2",
      distributor: "dist2",
      description: "desc2",
    },
    quoteData = {
      leadTime: "2",
      minQuantity: "2",
      unitPrice: "0.250",
      leadTimeUnit : "WEEKS",
    };

    // Add sourcing data 
    sourcing.navigateToSourcingTab();
    sourcing.enterManufacturerData(1, manufacturerData);
    sourcing.enterDistributorData(1, 1, distributorData);
    sourcing.enterQuoteData(1, 1, 1, quoteData);
    product.clickSaveButtonInEditProduct();
    featureHelpers.waitForLoadingIconToDisappear();

    // Verify sorcing data in product view page
    product.verifyleadTimeInViewPage('2 WEEKS');
    product.verifyUnitPriceInViewPage('€0.2500');

    // Verify sourcing data in product edit page
    product.clickEditIcon();
    product.verifyMinQuantityInEditPage('2');
    product.verifyleadTimeInEditPage('2 WEEKS');
    product.verifyUnitPriceInEditPage('€0.2500');
    product.clickCancelInEditPage();

    // Verify the primary souring data
    tableHelper.assertRowPresentInTable(constData.sourcingTableHeaders.minQty, '2');
    tableHelper.assertRowPresentInTable(constData.sourcingTableHeaders.quoteLeadTime, '2');
    tableHelper.assertRowPresentInTable(constData.sourcingTableHeaders.quoteLeadTime, 'WEEKS');
    tableHelper.assertRowPresentInTable(constData.sourcingTableHeaders.unitPrice, '€0.2500');
  })
})
