import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Sourcing } from "../../pages/components/sourcing";
import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const faker = require('faker');
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const sourcing = new Sourcing();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Test Components", () => {
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

  context("Source View:", () => {
    let data;
    beforeEach(() => {
      data = {
        componentType: constData.componentType.electrical,
        category: constData.electricalComponents.capacitor,
        mpn: 'GRM32ER60J107ME20L',
        manufacturer: 'Murata'
      }

      // Navigate to Component tab
      nav.openComponentsTab();

      // Import from Vendor
      components.importFromVendor(data);

      // Verify all source table rows
      sourcing.navigateToSourcingTab();
    })

    it.skip('Green checkmark should be visible when no changes to source', () =>{
      // Verify data present in Sourcing Table in view mode
      sourcing.verifyAllDataInSourcingTable(data.mpn);

      // Sort the Distributor column in Ascendending order
      sourcing.sortByDistributor();

      // Check the first row CheckBox and update
      sourcing.checkRowSourcingViewTableCheckBox(1);
      sourcing.clickUpdate();
      sourcing.waitforUpdateLoadingIconTodisapper();

      // Verify Green checkmark should be visible when no changes to source in LeadTime and UnitPrice
      sourcing.verifyGreenCheckMarkInViewSourcing(1, constData.sourcingTableHeaders.unitPrice);
      sourcing.verifyGreenCheckMarkInViewSourcing(1, constData.sourcingTableHeaders.quoteLeadTime);
    })

    it.skip('Green arrow should be visible when values are better', () => {
      // Click edit and Navigate to sourcing tab
      components.clickEditIcon();
      sourcing.navigateToSourcingTab();

      // Click the Expand
      sourcing.clickExpand();

      const originalLeadTime = sourcing.getLeadTimeValue();
      originalLeadTime.then(parseInt).then((leadTime) => {
        const originalUnitPrice = sourcing.getUnitPriceValue();
        originalUnitPrice.then(parseFloat).then((unitPrice) => {

          // In the first row that has unit price, set UNIT PRICE value + 1 and LEAD TIME + 1 and Save
          const newLeadTime = leadTime + 1;
          const newUnitPrice =  unitPrice + 1;

          sourcing.enterLeadTime(1, 1, 1, Math.trunc(newLeadTime));
          sourcing.enterUnitPrice(1, 1, 1, Math.trunc(newUnitPrice));

          components.clickSaveButtonInEditComponent();
          featureHelper.waitForLoadingIconToDisappear();

          // Navigate to Sourcing tab
          sourcing.navigateToSourcingTab();

          // Select the first row that has its UNIT PRICE and LEAD TIME values edited earlier
          sourcing.checkRowSourcingViewTableCheckBox(1);

          // Click the Update button and wait for the update to complete
          sourcing.clickUpdate();
          sourcing.waitforUpdateLoadingIconTodisapper();

          // Assert that green arrow icons are displayed in the UNIT PRICE and LEAD TIME first row and values are reverted to their original values
          sourcing.verifyLeadTimeOrUnitPriceValuesInViewSourcing(unitPrice, 1, constData.sourcingTableHeaders.unitPrice );
          sourcing.verifyLeadTimeOrUnitPriceValuesInViewSourcing(leadTime, 1, constData.sourcingTableHeaders.quoteLeadTime);
          sourcing.verifyGreenDownArrowInViewSourcing(1, constData.sourcingTableHeaders.unitPrice);
          sourcing.verifyGreenDownArrowInViewSourcing(1, constData.sourcingTableHeaders.quoteLeadTime);
        })
      })
    })

    it('Red arrow should be visible when values are worse', () => {
      // Click edit and Navigate to sourcing tab
      components.clickEditIcon();
      sourcing.navigateToSourcingTab();

      // Click on expand button
      sourcing.clickExpand();

      const originalLeadTime = sourcing.getLeadTimeValue();
      originalLeadTime.then(parseFloat).then((leadtime) => {
        const originalUnitPrice = sourcing.getUnitPriceValue();
        originalUnitPrice.then(parseInt).then((unitPrice) => {

          sourcing.setLeadTimeInFirstRow(leadtime/2);
          sourcing.setUnitPriceInFirstRow(unitPrice/2);

          components.clickSaveButtonInEditComponent();
          featureHelper.waitForLoadingIconToDisappear();

          // Navigate to Sourcing tab
          sourcing.navigateToSourcingTab();

          // Select the first row that has its UNIT PRICE and LEAD TIME values edited earlier
          sourcing.checkRowSourcingViewTableCheckBox(1);

          // Click the Update button and wait for the update to complete
          sourcing.clickUpdate();
          sourcing.waitforUpdateLoadingIconTodisapper();

          // Assert that red arrow icons are displayed in the UNIT PRICE first row and values are reverted to their original values
          sourcing.verifyLeadTimeOrUnitPriceValuesInViewSourcing(unitPrice, 1, constData.sourcingTableHeaders.unitPrice );
          sourcing.verifyLeadTimeOrUnitPriceValuesInViewSourcing(leadtime, 1, constData.sourcingTableHeaders.quoteLeadTime);
          sourcing.verifyRedUpArrowInViewSourcing(1, constData.sourcingTableHeaders.unitPrice);
          if(leadtime > 0) {
            sourcing.verifyRedUpArrowInViewSourcing(1, constData.sourcingTableHeaders.quoteLeadTime);
          }
        })
      })
    })

    it('Update button should be active when one ore more rows selected', () => {
      // Assert that Update button is not active
      sourcing.verifyUpdateOptionNotActive();

      // Select the first row that has UNIT PRICE and LEAD TIME values in its cells and verify update is active
      sourcing.checkRowSourcingViewTableCheckBox(1);
      sourcing.verifyUpdateOptionActive();

      // Click Set Primary button to set the first row as the primary source and verify update is active
      sourcing.clickOnSetPrimary();
      sourcing.verifyUpdateOptionActive();

      // Select rows 2 to 4, and assert that Update button is active
      sourcing.checkRowSourcingViewTableCheckBox(2);
      sourcing.checkRowSourcingViewTableCheckBox(3);
      sourcing.checkRowSourcingViewTableCheckBox(4);
      sourcing.verifyUpdateOptionActive();

      // Deselect all rows, and assert that Update button is not active
      sourcing.deselectPrimaryComponent();
      sourcing.unCheckAllCheckBxs();
      sourcing.verifyUpdateOptionNotActive();
    })

    it.skip('Only selected rows should be updated', () => {
      // Select the first three rows that has UNIT PRICE and LEAD TIME values in its cells
      sourcing.checkRowSourcingViewTableCheckBox(1);
      sourcing.checkRowSourcingViewTableCheckBox(2);
      sourcing.checkRowSourcingViewTableCheckBox(3);

      // Click the Update button and wait for the update to complete
      sourcing.clickUpdate();
      sourcing.waitforUpdateLoadingIconTodisapper();

      // Verify Icons should not be visible on unselected rows
      for(let rowIndex = 4; rowIndex <= 16; rowIndex++) {
        sourcing.verifyCheckMarkOrArrowNotPresentInViewSourcing(rowIndex, constData.sourcingTableHeaders.unitPrice);
        sourcing.verifyCheckMarkOrArrowNotPresentInViewSourcing(rowIndex, constData.sourcingTableHeaders.quoteLeadTime);
      }

      // Verify Green checkmark should be visible only on selected rows
      sourcing.verifyGreenCheckMarkInViewSourcing(1, constData.sourcingTableHeaders.unitPrice);
      sourcing.verifyGreenCheckMarkInViewSourcing(2, constData.sourcingTableHeaders.unitPrice);
      sourcing.verifyGreenCheckMarkInViewSourcing(3, constData.sourcingTableHeaders.unitPrice);
      sourcing.verifyGreenCheckMarkInViewSourcing(1, constData.sourcingTableHeaders.quoteLeadTime);
      sourcing.verifyGreenCheckMarkInViewSourcing(2, constData.sourcingTableHeaders.quoteLeadTime);
      sourcing.verifyGreenCheckMarkInViewSourcing(3, constData.sourcingTableHeaders.quoteLeadTime);
    })
  })
})

