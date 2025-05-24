import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants"
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const faker = require('faker');
const signin = new SignIn();
const nav = new Navigation();
const product = new Products();
const fakerhelper = new FakerHelpers();
const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Products One", () => {
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

  it('Create Product', function () {
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }

    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.createNewProduct(data)

    // Verify data before save and after save
    product.verifyDataInEditMode(data)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()
    product.verifyDataOnProductCreation(data)

    nav.openProductTab()
    
    // Verify prouduct data in the table
    product.assertProductTableData(data)
  })

  it('Delete Product from product details page', function () {
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }

    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.createNewProduct(data)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()

    // Verify Product created
    nav.openProductTab()
    product.assertProductTableData(data)

    // Delete product
    tableHelper.clickOnCell(constData.productTableHeaders.name, data.prodName)
    product.deleteProduct()
    product.waitForLoadingIconToDisappear()

    // Assert product not present in table
    product.assertProductDeleted(constData.productTableHeaders.name, data.prodName)
  })

  it('Delete multiple products from tables', function () {
    const data1 = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }
    const data2 = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }

    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.createNewProduct(data1)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()

    // Create another new product
    nav.openProductTab();
    product.createNewProduct(data2);
    product.clickSaveButtonInEditProduct();
    product.waitForLoadingIconToDisappear();

    // Select the Product row
    nav.openProductTab();
    tableHelper.checkTableRow(data1.prodName);
    tableHelper.checkTableRow(data2.prodName);

    // Delete product
    product.deleteProduct();
    product.waitForLoadingIconToDisappear();

    // Verify product not present in table
    product.assertProductDeleted(constData.productTableHeaders.eid, data1.prodName);
    product.assertProductDeleted(constData.productTableHeaders.eid, data2.prodName);
  })

  it('Revert the product revision status', ()=>{
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }
     // Navigate to Product tab
     nav.openProductTab()

     // Create new product
     product.createNewProduct(data)
     product.clickSaveButtonInEditProduct()
     product.waitForLoadingIconToDisappear()

     // Check product from the table
     nav.openProductTab()
     tableHelper.checkTableRow(data.prodName)

     // Update the status from the table
     product.updateStatus()

     // Revert the status for the updated product
     product.revertStatus()
  })

  it('Update the product revision status', ()=>{
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }
    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.createNewProduct(data)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()
    
    // Check product from the table
    nav.openProductTab()
    tableHelper.checkTableRow(data.prodName)

    // Update the status of the product
    product.clickOnUpdateStatus();
    product.changeStatusInRowFromChangeStatusModal(data.prodName, constData.status.prototype);
    product.clickOnContinue();
    product.waitForLoadingIconToDisappear();
 
    // Verify the component post updation
    product.assertProductTablePostUpdation(data.prodName, data.prodDesc, data.eid, constData.status.prototype);
  })

  it('Update and reset the product revision status', ()=>{
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }
    // Navigate to Product tab
    nav.openProductTab();

    // Create new product
    product.createNewProduct(data)
    product.clickSaveButtonInEditProduct();
    product.waitForLoadingIconToDisappear();
    
    // Check product from the table
    nav.openProductTab();
    tableHelper.checkTableRow(data.prodName);

    // Update and reset the status of the product
    product.updateAndResetStatus(constData.status.prototype);
 
    // Verify updated status in each row from Change Status modal
    product.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(data.prodName, constData.status.design);
    product.verifyCheckboxUncheckedInStatusChangeModal(data.prodName);
  })

  it('Update bulk status and apply', ()=>{
    const data1 = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }
    const data2 = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }

    // Navigate to product tab and create product
    nav.openProductTab()
    product.createNewProduct(data1)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()

    // Navigate to product tab and create second product
    nav.openProductTab()
    product.createNewProduct(data2)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()
    
    // Check product from the table
    nav.openProductTab()
    tableHelper.checkTableRow(data1.prodName) 
    tableHelper.checkTableRow(data2.prodName) 

    // Update the status and Apply 
    product.updateBulkStatusAndApply(constData.status.prototype)
 
    // Verify updated status in each row from Change Status modal
    product.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(data1.prodName, constData.status.prototype)
    product.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(data2.prodName, constData.status.prototype)

    // Click Continue button in Change Status modal
    product.clickOnContinue()
  })
  
  it('Delete single product from table', ()=>{
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }
    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.createNewProduct(data)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()
    
    // Check product from the table
    nav.openProductTab()
    tableHelper.checkTableRow(data.prodName) 

    // Delete the product from the table
    product.deleteProductFromTable()

    // Verify the deleted product from the table
    product.assertProductDeleted(constData.productTableHeaders.name, data.prodName)
  })
   
  it('Duplicate product from table', ()=>{
    const data = {
      prodName: fakerhelper.generateProductName(),
      eid: faker.random.number({min:1000000, max:9999999}),
      prodDesc: "The description related to product",
      prodManagEmail: fakerhelper.generateEmail(),
      engEmail: fakerhelper.generateEmail(),
      procurementEmail: fakerhelper.generateEmail(),
      qaEmail: fakerhelper.generateEmail(),
      manufacturEmail: fakerhelper.generateEmail(),
      preProductionLaunch: featureHelpers.addYearsToToday(),
      preProductionValue: 2,
      massProductionLaunch: featureHelpers.addYearsToToday(2),
      massProductionValue: 100,
    }
    const duplicateProduct= product.getCopiedProductName(data.prodName);  

    // Navigate to Product tab
    nav.openProductTab()

    // Create new product
    product.createNewProduct(data)
    product.clickSaveButtonInEditProduct()
    product.waitForLoadingIconToDisappear()
    
    // Check product from the table
    nav.openProductTab()
    tableHelper.checkTableRow(data.prodName) 

    // Delete the product from the table
    product.duplicateProductFromTable()

    // Verify the duplicated product from the table
    nav.openProductTab()
    product.verifyCopiedProductDataInTable(duplicateProduct, data)
  })

  it('Status Design should allow numeric and alphabetic values', () => {
    // Navigate to Product Tab
    nav.openProductTab();

    // Creating New Product
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());
    product.checkCategoryItem(constData.productType.electrical);
    product.selectLifeCycleStatus(constData.status.design);

    // Asserting Revision with different values
    product.enterRevision(1);
    product.verifyRevisionTooltipNotPresent();
    product.enterRevision('A');
    product.verifyRevisionTooltipNotPresent();
  })

  it('Revision can be changed from default value without errors', () => {
    // Navigate to Product Tab
    nav.openProductTab();

    // Creating New Product
    product.clickNewButton();
    product.enterProductName(fakerhelper.generateProductName());
    product.checkCategoryItem(constData.productType.electrical);
    product.selectLifeCycleStatus(constData.status.prototype);

    // Asserting Revision with different values
    for(let i=1;i<=5;i++)
    {
      product.enterRevision(i);
      product.verifyRevisionTooltipNotPresent();
    }
  })

  it('Create button should not be active if there are any errors in any field', () => {
    // Navigate to Product Tab
    nav.openProductTab();

    // Creating New Product
    product.clickNewButton();
    product.checkCategoryItem(constData.productType.electrical);

    // Enter Name with 101 characters
    // Assert the tooltip contains 'Should be less than 101 characters'
    product.enterProductName(fakerhelper.getRandomStringOfCharacters(101));
    product.verifyNameTooltipPresent('Should be less than 101 characters');
    product.verifyCreateBtnDisabled();
    product.enterProductName(fakerhelper.generateProductName());
    product.verifyNameTooltipNotPresent();
    product.verifyCreateBtnEnabled();
    product.selectLifeCycleStatus(constData.status.production);

    // Enter Numeric values in Revision
    // Assert the tooltip 'Should not contain numbers'
    product.enterRevision(1);
    product.verifyRevisionTooltipPresent('Should not contain numbers');
    product.verifyCreateBtnDisabled();
    product.enterRevision('A');
    product.verifyRevisionTooltipNotPresent();
    product.verifyCreateBtnEnabled();

    // Enter EID with 42 Characters
    // Assert the tooltip 'Should be less than 41 characters'
    product.enterEid(fakerhelper.getRandomStringOfCharacters(42));
    product.verifyEidTooltipPresent('Should be less than 41 characters');
    product.verifyCreateBtnDisabled();
    product.enterEid('1212-ABC');
    product.verifyEidTooltipNotPresent();
    product.verifyCreateBtnEnabled();

    // Enter Description with 801 Characters
    // Assert the tooltip with 'Should be less than 801 characters'
    product.enterProductDescription(fakerhelper.getRandomStringOfCharacters(801));
    product.verifyDescTooltipPresent('Should be less than 801 characters');
    product.verifyCreateBtnDisabled();
    product.enterProductDescription('1212-ABC');
    product.verifyDescTooltipNotPresent();
    product.verifyCreateBtnEnabled();
  })

  it.skip('Should show uploading status and cancel button when document or thumbnail are uploading', () => {
    const data = {
      prodName: fakerhelper.generateProductName(),
      status: constData.status.design,
    }

    // Navigate to Product Tab
    nav.openProductTab();

    // Create new product
    product.clickNewButton();
    product.checkCategoryItem(constData.productType.mechanical);
    product.enterProductName(data.prodName);
    product.selectLifeCycleStatus(data.status);
    product.enterRevision(1);

    // Uploading Thumbnail and Verifying error message
    product.uploadThumbnailAndVerifyUploadingStatus('drone.jpg');
    product.uploadThumbnail('30mb-file.png');
    product.verifyErrorMessage();
    product.removeFailedFile();
    product.uploadThumbnailAndCancelFileUpload('drone.jpg');

    // Uploading Documents and Verifying error message
    product.uploadDocumentAndVerifyUploadingStatus('4mb.pdf');
    product.uploadDocuments('30mb-file.png');
    product.verifyErrorMessage();
    product.removeFailedFile();
    product.uploadDocumentAndCancelFileUpload('4mb.pdf');
    product.clickCreateButton();

    // Uploading Documents in Edit View
    product.uploadDocumentAndVerifyUploadingStatusInEditView('4mb.pdf');
    product.clickSaveButtonInEditProduct();

    // Asserting Product Name, Status and length of Table
    product.verifyProductNameAndStatusInProductView(data.prodName, data.status);
    product.verifyLengthOfTable(2);

    // Asserting Error Message for Large size files
    product.clickEditIcon();
    product.uploadDocumentInEditView('30mb-file.png');
    product.verifyErrorMessageInEditView();
    product.uploadDocumentAndCancelFileUploadInEditView('4mb.pdf');
  })

  it('should create Product with default procurement value', () => {
    const data = {
      productName: fakerhelper.generateProductName(),
      status: constData.status.design,
    }

    // Navigate to Product Tab
    nav.openProductTab();
    product.clickNewButton();

    // Creating New Product
    product.enterProductName(data.productName);
    product.checkCategoryItem(constData.productType.mechanical);
    product.selectLifeCycleStatus(data.status);
    product.clickCreateButton();
    product.clickSaveButtonInEditProduct();

    // Asserting Product Name, Status and Procurement value
    product.verifyProductNameAndStatusInProductView(data.productName, data.status);
    product.verifyProcurementValue();
  })
})
