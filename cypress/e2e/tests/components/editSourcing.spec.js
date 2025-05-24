import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Sourcing } from "../../pages/components/sourcing";
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

  context("Source Edit:", () => {
    beforeEach(() => {
      const data = {
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
      // sourcing.verifyAllDataInSourcingTable(data.mpn);

      // Edit and Navigate to sourcing tab
      components.clickEditIcon();
      featureHelper.waitForLoadingIconToDisappear();
      sourcing.navigateToSourcingTab();
    })

    it.skip('Green checkmark should be visible when no changes to source', () =>{
      // Expand rows and Update
      sourcing.checkSelectAll();
      sourcing.clickExpand();

      // Enter sourcing data
      sourcing.enterMinimumQuantity(1, 1, 1, 3);
      sourcing.enterUnitPrice(1, 1, 1, '1.2');

      // Enter sourcing data
      sourcing.enterMinimumQuantity(1, 1, 2, 4);
      sourcing.enterUnitPrice(1, 1, 2, '1.3');

      // Cancel the changes
      components.clickCancelInEditCmpAfterSavingCmp();
      components.clickOkBtnInUnsavedChangesModal();

      // Update the sourcing data
      components.checkSelectAllIndexesCheckbox();
      sourcing.clickUpdate();

      sourcing.verifyGreenCheckMarkInViewSourcing(1, constData.sourcingTableHeaders.unitPrice);
      sourcing.verifyGreenCheckMarkInViewSourcing(2, constData.sourcingTableHeaders.unitPrice);
    })

    it('Checkbox functionality should work correctly in edit mode', () =>{
      // Expand the first row and Update
      sourcing.clickExpand(); 

      // Assert that when all rows that have the UNIT PRICE label are checked, 
      // the rows that have the MPN and DPN labels are also checked.
      sourcing.checkAllQuoteCheckBoxes();
      sourcing.verifyMpnDpnRowChecked(); 

      // Assert that when all rows that have the UNIT PRICE label are unchecked, 
      // the rows that have the MPN and DPN labels are also unchecked.
      sourcing.unCheckAllQuotesCheckBoxes();
      sourcing.verifyMpnDpnRowUnChecked();

      // Assert that when at least one (but not all) of the rows that have the UNIT PRICE label are checked, 
      // the rows that have the MPN and DPN labels are in ‘middle’ state, that is neither checked nor unchecked.
      sourcing.checkQuoteCheckboxInDistributors();
      sourcing.verifyMiddleMfrAndDistributorCheckBxs();
    })

    it('Update button should be active when one or more rows selected', () => {
      let distributorIndex;
      let quoteIndex;
      sourcing.clickExpand();
      sourcing.verifyUpdateOptionNotActive();

      // Select the first row that has UNIT PRICE and LEAD TIME values in its cells and verify update
      sourcing.checkQuoteCheckboxInDistributors(distributorIndex = 1, quoteIndex = 1);
      sourcing.verifyUpdateOptionActive();

      // Click Set Primary button to set the first row as the primary source
      sourcing.clickOnSetPrimary();

      // Assert that Update button is active
      sourcing.verifyUpdateOptionActive();

      // Select rows 2 to 4, and assert that Update button is active
      sourcing.checkQuoteCheckboxInDistributors(distributorIndex = 2, quoteIndex = 1);
      sourcing.checkQuoteCheckboxInDistributors(distributorIndex = 3, quoteIndex = 1);
      sourcing.verifyUpdateOptionActive();

      // Deselect all rows, and assert that Update button is not active
      sourcing.clickOnPrimarySourceQuoteCheckboxInDistributors();
      sourcing.uncheckQuoteCheckboxInDistributors(distributorIndex = 2, quoteIndex = 1);
      sourcing.uncheckQuoteCheckboxInDistributors(distributorIndex = 3, quoteIndex = 1);

      sourcing.verifyUpdateOptionNotActive();
    })

    it('Green arrow should be visible when values are better', () => {
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

          // Go back to the edit view by clicking the Edit icon and navigate to Sourcing tab
          components.clickEditIcon();
          sourcing.navigateToSourcingTab();
          sourcing.clickExpand();

          // Verify and Select the first row that has its UNIT PRICE and LEAD TIME values edited earlier
          sourcing.verifyUnitPriceFirstRowValueInEditSourcing(Math.trunc(newUnitPrice));
          sourcing.verifyLeadTimeFirstRowValueInEditSourcing(Math.trunc(newLeadTime));

          sourcing.checkQuoteCheckboxInDistributors();
         
          // Click the Update button and wait for the update to complete
          sourcing.clickUpdate();
          sourcing.waitforUpdateLoadingIconTodisapper();

          // Assert UNIT PRICE and LEAD TIME first row values are reverted to their original values
          sourcing.verifyUnitPriceFirstRowValueInEditSourcing(unitPrice);
          sourcing.verifyLeadTimeFirstRowValueInEditSourcing(leadTime);

          // Assert that green arrow icons are displayed in the UNIT PRICE and LEAD TIME first row
          sourcing.verifyUnitPriceGreenDownArrowIconInFirstRow();
          sourcing.verifyLeadTimeGreenDownArrowIconInFirstRow();
        })
      })
    })

    it.skip('Only selected rows should be updated', () => {
      let distributorIndex;
      let quoteIndex;

      // Click the Expand
      sourcing.clickExpand();

      // Select rows 1 to 3 
      sourcing.checkQuoteCheckboxInDistributors(distributorIndex = 1, quoteIndex = 1);
      sourcing.checkQuoteCheckboxInDistributors(distributorIndex = 2, quoteIndex = 1);

      // Click the Update button and wait for the update to complete
      sourcing.clickUpdate();
      sourcing.waitforUpdateLoadingIconTodisapper();

      // Assert that green checkmark icon is not shown in the UNIT PRICE and LEAD TIME cells of unselected rows
      sourcing.verifyLeadTimeAndUnitPriceIconsNotPresentInRow(distributorIndex = 3, quoteIndex = 1);
      sourcing.verifyLeadTimeAndUnitPriceIconsNotPresentInRow(distributorIndex = 3, quoteIndex = 2);
      sourcing.verifyLeadTimeAndUnitPriceIconsNotPresentInRow(distributorIndex = 3, quoteIndex = 3);
      sourcing.verifyLeadTimeAndUnitPriceIconsNotPresentInRow(distributorIndex = 3, quoteIndex = 4);
      sourcing.verifyLeadTimeAndUnitPriceIconsNotPresentInRow(distributorIndex = 3, quoteIndex = 5);

      // Assert that green checkmark icon is shown in the UNIT PRICE and LEAD TIME cells of only the selected rows
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 1, quoteIndex = 1);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 2, quoteIndex = 1);

      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 1, quoteIndex = 1);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 2, quoteIndex = 1);
    })

    it('Red arrow should be visible when values are worse', () => {
      // Click on expand button
      sourcing.clickExpand();

      const originalLeadTime = sourcing.getLeadTimeValue();
      originalLeadTime.then(parseInt).then((leadTime) => {
        const originalUnitPrice = sourcing.getUnitPriceValue();
        originalUnitPrice.then(parseFloat).then((unitPrice) => {

          // In the first row that has unit price and lead time, set UNIT PRICE , LEAD TIME value half of what it was and Save
          const newLeadTime = leadTime/2;
          const newUnitPrice =  unitPrice/2;

          sourcing.enterLeadTime(1, 1, 1, Math.trunc(newLeadTime));
          sourcing.enterUnitPrice(1, 1, 1, Math.trunc(newUnitPrice));

          components.clickSaveButtonInEditComponent();
          featureHelper.waitForLoadingIconToDisappear();

          // Go back to the edit view by clicking the Edit icon and navigate to Sourcing tab
          components.clickEditIcon();
          sourcing.navigateToSourcingTab();
          sourcing.clickExpand();

          // Verify and Select the first row that has its Unit Price and Lead Time values edited earlier
          sourcing.verifyUnitPriceFirstRowValueInEditSourcing(Math.trunc(newUnitPrice));
          sourcing.verifyLeadTimeFirstRowValueInEditSourcing(Math.trunc(newLeadTime));
          sourcing.checkQuoteCheckboxInDistributors();

          // Click the Update button and wait for the update to complete
          sourcing.clickUpdate();
          sourcing.waitforUpdateLoadingIconTodisapper();

          // Assert that Unit Price and lead time first row and values are reverted to their original values
          sourcing.verifyUnitPriceFirstRowValueInEditSourcing(unitPrice);
          sourcing.verifyLeadTimeFirstRowValueInEditSourcing(leadTime);

           // Assert that red arrow icons are displayed in the Unit Price and Lead Time first row 
          sourcing.verifyUnitPriceRedUpArrowIconInFirstRow();
          leadTime > 0 ? sourcing.verifyLeadTimeRedUpArrowIconInFirstRow()
                       : sourcing.verifyLeadTimeGreenCheckMarkIconInFirstRow();
        })
      })
    })

    it.skip('Green checkmark should be visible for all rows when no changes to source', () =>{
      let distributorIndex, quoteIndex;
      // Expand the first row and Update
      sourcing.checkSelectAll();
      sourcing.clickExpand();
      sourcing.clickUpdate();
      sourcing.waitforUpdateLoadingIconTodisapper();

      // Verify Green checkmark for unit price is visible for distributor 1
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 1, quoteIndex = 1);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 1, quoteIndex = 2);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 1, quoteIndex = 3);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 1, quoteIndex = 4);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 1, quoteIndex = 5);

      // Verify Green checkmark for unit price is visible for distributor 2
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 2, quoteIndex = 1);

      // Verify Green checkmark for unit price is visible for distributor 3
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 3, quoteIndex = 1);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 3, quoteIndex = 2);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 3, quoteIndex = 3);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 3, quoteIndex = 4);
      sourcing.verifyUnitPriceGreenIcon(distributorIndex = 3, quoteIndex = 5);

      // Verify Green checkmark for lead time is visible for distributor 1
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 1, quoteIndex = 1);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 1, quoteIndex = 2);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 1, quoteIndex = 3);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 1, quoteIndex = 4);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 1, quoteIndex = 5);

      // Verify Green checkmark for lead time is visible for distributor 2
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 2, quoteIndex = 1);

      // Verify Green checkmark for lead time is visible for distributor 3
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 3, quoteIndex = 1);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 3, quoteIndex = 2);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 3, quoteIndex = 3);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 3, quoteIndex = 4);
      sourcing.verifyLeadTimeGreenIcon(distributorIndex = 3, quoteIndex = 5);
    })
  })
})
