import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const changeOrder = new ChangeOrders();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
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

  it("Search by CPN and assert the rows in the component table", () => {
    const data1 = {
      category     : "Paint",
      name         : "cmp-1",
    }

    const data2 = {
      category     : "Paint",
      name         : "cmp-2",
    }

    const data3 = {
      category     : "Paint",
      name         : "cmp-3",
    }

    const data4 = {
      category     : "Paint",
      name         : "cmp-4",
    }

    const data5 = {
      category     : "Bolt",
      name         : "cmp-5",
    }

    const data6 = {
      category     : "Instructions",
      name         : "cmp-6",
    }

    const data7 = {
      category     : "EBOM",
      name         : "cmp-7",
    }

    // Create Components
    compApi.createComponent(data1)
    compApi.createComponent(data2)
    compApi.createComponent(data3)
    compApi.createComponent(data4)
    compApi.createComponent(data5)
    compApi.createComponent(data6)
    compApi.createComponent(data7)
    // CPN Values for Cmp-1=464-00001, Cmp-2=464-00002, Cmp-3=464-00003, Cmp-4=464-00004, Cmp-5=411-00001, Cmp-6=626-00001, Cmp-7 = 910-00001

    nav.openComponentsTab()

    let component1CpnValue, component2CpnValue, component3CpnValue, component4CpnValue, component5CpnValue, component6CpnValue, component7CpnValue

    // Retrieve CPN values
    featureHelper.getCpnValueFromTable(data1.name, 1).then((value) => component1CpnValue = value)
    featureHelper.getCpnValueFromTable(data2.name, 1).then((value) => component2CpnValue = value)
    featureHelper.getCpnValueFromTable(data3.name, 1).then((value) => component3CpnValue = value)
    featureHelper.getCpnValueFromTable(data4.name, 1).then((value) => component4CpnValue = value)
    featureHelper.getCpnValueFromTable(data5.name, 1).then((value) => component5CpnValue = value)
    featureHelper.getCpnValueFromTable(data6.name, 1).then((value) => component6CpnValue = value)
    featureHelper.getCpnValueFromTable(data7.name, 1).then((value) => {
      component7CpnValue = value

      // Enter 4 in search term and verify the row present or not
      components.enterSearchTerm("cpn:4")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component7CpnValue)

      // Enter 4* in search term and verify the row present or not
      components.enterSearchTerm("cpn:4*")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component7CpnValue)


      // Enter *4 in search term and verify the row present or not
      components.enterSearchTerm("cpn:*4")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component7CpnValue)

      // Enter 4*1 in search term and verify the row present or not
      components.enterSearchTerm("cpn:4*1")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component7CpnValue)

      // Enter *1 in search term and verify the row present or not
      components.enterSearchTerm("cpn:*1")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component7CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component4CpnValue)

      // Enter *4*1 in search term and verify the row present or not
      components.enterSearchTerm("cpn:*4*1")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component7CpnValue)

      // Enter *4* in search term and verify the row present or not
      components.enterSearchTerm("cpn:*4*")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component7CpnValue)

      // Enter 910 in search term and verify the row present or not
      components.enterSearchTerm("cpn:910")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component7CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)

      // Enter 91* in search term and verify the row present or not
      components.enterSearchTerm("cpn:91*")
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.id, component7CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component1CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component2CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component3CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component4CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component5CpnValue)
      tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.id, component6CpnValue)
    })
  })

  it('Search by MPN and assert the rows in the component table', () => {
    // Create Components
    cy.fixture('createComponent.json').then((component) => {
      compApi.createComponent(component[0])
      compApi.createComponent(component[1])
      compApi.createComponent(component[2])
      compApi.createComponent(component[3])
      compApi.createComponent(component[4]).then(res => {
        cy.visit(`/component/view/${res.body.data}`)
      })
    })

    const cmpName1 = '2.2uF, 10V, 10%, X7R';
    const cmpName2 = '5.62K,1% Resistor';
    const cmpName3 = '10k, 5%';
    const cmpName4 = '16MHz CRYSTAL_SMD'
    const cmpName5 = 'EBOM Assembly Parent';

    // Navigate to Components tab
    nav.openComponentsTab();

    // Verify component with MPN GRJ1023899JKL
    // Enter full MPN in search term and verify the row present or not
    components.enterSearchTerm('mpn: GRJ1023899JKL');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter GRJ* in search term and verify the row present or not
    components.enterSearchTerm('mpn: GRJ*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter *JKL in search term and verify the row present or not
    components.enterSearchTerm('mpn: *JKL');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter GRJ*JKL in search term and verify the row present or not
    components.enterSearchTerm('mpn: GRJ*JKL');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter GRJ*238*JKL in search term and verify the row present or not
    components.enterSearchTerm('mpn: GRJ*238*JKL');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Verify component with MPN RJ103K122
    // Enter full MPN in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ103K122');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter RJ1* in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ1*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter *122 in search term and verify the row present or not
    components.enterSearchTerm('mpn: *122');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter RJ1*122 in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ1*122');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter RJ1*3*122 in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ1*3*122');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Verify component with MPN RJ103K123
    // Enter full MPN in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ103K123');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter RJ1* in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ1*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter *122 in search term and verify the row present or not
    components.enterSearchTerm('mpn: *123');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter RJ1*122 in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ1*123');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter RJ1*3*122 in search term and verify the row present or not
    components.enterSearchTerm('mpn: RJ1*3*123');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Verify component with MPN XT16F
    // Enter full MPN in search term and verify the row present or not
    components.enterSearchTerm('mpn: XT16F');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter XT* in search term and verify the row present or not
    components.enterSearchTerm('mpn: XT*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName5);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter *6F in search term and verify the row present or not
    components.enterSearchTerm('mpn: *6F');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter XT*6F in search term and verify the row present or not
    components.enterSearchTerm('mpn: XT*6F');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

    // Enter X*1*F in search term and verify the row present or not
    components.enterSearchTerm('mpn: X*1*F');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName5);

     // Verify component with MPN XT16M
    // Enter full MPN in search term and verify the row present or not
    components.enterSearchTerm('mpn: XT16M');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName5);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);

    // Enter XT* in search term and verify the row present or not
    components.enterSearchTerm('mpn: XT*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName5);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName4);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter *6M in search term and verify the row present or not
    components.enterSearchTerm('mpn: *6M');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName5);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);

    // Enter XT*6M in search term and verify the row present or not
    components.enterSearchTerm('mpn: XT*6M');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName5);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);

    // Enter X*1*M in search term and verify the row present or not
    components.enterSearchTerm('mpn: X*1*M');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName5);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName4);
  })

  it('Search by DPN and assert the row in the component table', () => {
    // Create Components
    cy.fixture('createComponent.json').then((component) => {
      compApi.createComponent(component[0])
      compApi.createComponent(component[1])
      compApi.createComponent(component[2]).then(res => {
        cy.visit(`/component/view/${res.body.data}`)
      })
    })
    const cmpName1 = '2.2uF, 10V, 10%, X7R';
    const cmpName2 = '5.62K,1% Resistor';
    const cmpName3 = '10k, 5%';

    // Navigate to Components tab
    nav.openComponentsTab();

    // Verify component with DPN DKGRJ1023
    // Enter full DPN in search term and verify the row present or not
    components.enterSearchTerm('dpn: DKGRJ1023');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter DKG* in search term and verify the row present or not
    components.enterSearchTerm('dpn: DKG*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter *1023 in search term and verify the row present or not
    components.enterSearchTerm('dpn: *1023');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter DKG*1023 in search term and verify the row present or not
    components.enterSearchTerm('dpn: DKG*1023');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Verify component with DPN M103K
    // Enter full DPN in search term and verify the row present or not
    components.enterSearchTerm('dpn: M103K');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter M10* in search term and verify the row present or not
    components.enterSearchTerm('dpn: M10*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter *03K in search term and verify the row present or not
    components.enterSearchTerm('dpn: *03K');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter M1*3K in search term and verify the row present or not
    components.enterSearchTerm('dpn: M1*3K');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Verify component with DPN AXT16M
    // Enter full DPN in search term and verify the row present or not
    components.enterSearchTerm('dpn: AXT16M');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);

    // Enter AXT* in search term and verify the row present or not
    components.enterSearchTerm('dpn: AXT*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);

    // Enter *16M in search term and verify the row present or not
    components.enterSearchTerm('dpn: *16M');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);

    // Enter AX*6M in search term and verify the row presen or not
    components.enterSearchTerm('dpn: AX*6M');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
  })

  it('Search by Distributor and assert the row in the component table', () => {
    // Create Components
    cy.fixture('createComponent.json').then((component) => {
      compApi.createComponent(component[0])
      compApi.createComponent(component[1])
      compApi.createComponent(component[3]).then(res => {
        cy.visit(`/component/view/${res.body.data}`)
      })
    })
    const cmpName1 = '2.2uF, 10V, 10%, X7R';
    const cmpName2 = '5.62K,1% Resistor';
    const cmpName3 = '16MHz CRYSTAL_SMD';

    // Navigate to Components tab
    nav.openComponentsTab();

    // Verify component with Distributor Digikey
    // Enter full Distributor name in search term and verify the row present or not
    components.enterSearchTerm('dist: Digikey');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter Dig* in search term and verify the row present or not
    components.enterSearchTerm('dist: Dig*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter *key in search term and verify the row present or not
    components.enterSearchTerm('dist: *key');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter Dig*ey in search term and verify the row present or not
    components.enterSearchTerm('dist: Dig*ey');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Verify component with Distributor Mouser
    // Enter full Distributor name in search term and verify the row present or not
    components.enterSearchTerm('dist: Mouser');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter Mou* in search term and verify the row present or not
    components.enterSearchTerm('dist: Mou*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter *ser in search term and verify the row present or not
    components.enterSearchTerm('dist: *ser');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Enter Mo*er in search term and verify the row present or not
    components.enterSearchTerm('dist: Mo*er');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName2);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName3);

    // Verify component with Distributor Arrow
    // Enter full Distributor name in search term and verify the row presen or not
    components.enterSearchTerm('dist: Arrow');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);

    // Enter Arr* in search term and verify the row presen or not
    components.enterSearchTerm('dist: Arr*');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);

    // Enter *ow in search term and verify the row presen or not
    components.enterSearchTerm('dist: *ow');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);

    // Enter Ar*ow in search term and verify the row presen or not
    components.enterSearchTerm('dist: Ar*ow');
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpName3);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName1);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmpName2);
  })

  it("Search by Name and assert the rows in the component table", () => {
    const cmp1Data = {
      categoryType : "Mechanical",
      category     : "Belt",
      name         : "Belt"
    }

    const cmp2Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "Capacitor"
    }

    const cmp3Data = {
      categoryType : "Assembly",
      category     : "EBOM",
      name         : "EBOM"
    }

    const cmp4Data = {
      categoryType : "Software",
      category     : "CAM",
      name         : "CAM"
    }

    const cmp5Data = {
      categoryType : "Document",
      category     : "CAD",
      name         : "CAD"
    }

    // Create Components
    compApi.createComponent(cmp1Data);
    compApi.createComponent(cmp2Data);
    compApi.createComponent(cmp3Data);
    compApi.createComponent(cmp4Data);
    compApi.createComponent(cmp5Data);

    nav.openComponentsTab();

    // Search for components by using:
    // 'name: Belt', 'name: C*', 'name: C*c*r', 'name: *M', 'name: B*t'
    components.enterSearchTerm("name: Belt")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);

    components.enterSearchTerm("name: C*")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);

    components.enterSearchTerm("name: C*c*r")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);

    components.enterSearchTerm("name: *M")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);

    components.enterSearchTerm("name: B*t")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
  })

  it("Search by Revision and assert the rows in the component table", () => {
    // Data to create components
    const cmp1Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-1",
      status       : constData.status.design,
      revision     : 12
    }
    const cmp2Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-2",
      status       : constData.status.design,
      revision     : 29
    }
    const cmp3Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-3",
      status       : constData.status.design,
      revision     : 41
    }
    const cmp4Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-4",
      status       : constData.status.design,
      revision     : 44
    }
    const cmp5Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-5",
      status       : constData.status.design,
      revision     : 15
    }
    const cmp6Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-6",
      status       : constData.status.design,
      revision     : 24
    }
    const cmp7Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-7",
      status       : constData.status.design,
      revision     : 61
    }
    const cmp8Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-8",
      status       : constData.status.design,
      revision     : "Y"
    }

    // Create Components
    compApi.createComponent(cmp1Data);
    compApi.createComponent(cmp2Data);
    compApi.createComponent(cmp3Data);
    compApi.createComponent(cmp4Data);
    compApi.createComponent(cmp5Data);
    compApi.createComponent(cmp6Data);
    compApi.createComponent(cmp7Data);
    compApi.createComponent(cmp8Data);

    nav.openComponentsTab()

    // Search component by entering revision value (type:cmp rev: 1): Val
    components.enterSearchTerm("type:cmp rev: 1");
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: 1*): Val*
    components.enterSearchTerm("type:cmp rev: 1*");
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: 2*): Val*
    components.enterSearchTerm("type:cmp rev: 2*");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: *1): *Val
    components.enterSearchTerm("type:cmp rev: *1");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: 4*4): Val1*Val2
    components.enterSearchTerm("type:cmp rev: 4*4");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: Z): Val
    components.enterSearchTerm("type:cmp rev: Y");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);
  })

  it("Search by Status and assert the rows in the component table", () => {
    // Data to create components
    const cmp1Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-1",
      status       : constData.status.design
    }
    const cmp2Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-2",
      status       : constData.status.design
    }
    const cmp3Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-3",
      status       : constData.status.prototype
    }
    const cmp4Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-4",
      status       : constData.status.prototype
    }
    const cmp5Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-5",
      status       : constData.status.production
    }
    const cmp6Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-6",
      status       : constData.status.production
    }
    const cmp7Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-7",
      status       : constData.status.obsolete
    }
    const cmp8Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-8",
      status       : constData.status.obsolete
    }

    // Create Components
    compApi.createComponent(cmp1Data);
    compApi.createComponent(cmp2Data);
    compApi.createComponent(cmp3Data);
    compApi.createComponent(cmp4Data);
    compApi.createComponent(cmp5Data);
    compApi.createComponent(cmp6Data);
    compApi.createComponent(cmp7Data);
    compApi.createComponent(cmp8Data);

    nav.openComponentsTab()

    // Search component by entering status value ('status: Value'): Value= Design
    components.enterSearchTerm("status: Design");
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering status value ('status: Val'): Value= Des
    components.enterSearchTerm("status: Des");
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering status value ('status: Val*'): Value= Pr*
    components.enterSearchTerm("status: Pr*");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering status value ('status: *Val'): Value= *pe
    components.enterSearchTerm("status: *pe");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering status value ('status: Val1*Val2'): Value= Pr*on
    components.enterSearchTerm("status:Pr*on");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    // Search component by entering status value ('status: Val1*Val2*Val3'): Value= O*s*e
    components.enterSearchTerm("status:O*s*e");
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);
  })

  it("Search by Category and assert the rows in the component table", () => {
    const cmp1Data = {
      categoryType : "Mechanical",
      category     : "Belt",
      name         : "cmp-1",
    }

    const cmp2Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-2"
    }

    const cmp3Data = {
      categoryType : "Assembly",
      category     : "EBOM",
      name         : "cmp-3",
    }

    const cmp4Data = {
      categoryType : "Software",
      category     : "CAM",
      name         : "cmp-4",
    }

    const cmp5Data = {
      categoryType : "Document",
      category     : "CAD",
      name         : "cmp-5",
    }

    const cmp6Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-6",
    }

    const cmp7Data = {
      categoryType : "Assembly",
      category     : "EBOM",
      name         : "cmp-7",
    }

    const cmp8Data = {
      categoryType : "Software",
      category     : "CAM",
      name         : "cmp-8",
    }

    // Create Components
    compApi.createComponent(cmp1Data);
    compApi.createComponent(cmp2Data);
    compApi.createComponent(cmp3Data);
    compApi.createComponent(cmp4Data);
    compApi.createComponent(cmp5Data);
    compApi.createComponent(cmp6Data);
    compApi.createComponent(cmp7Data);
    compApi.createComponent(cmp8Data);

    nav.openComponentsTab();

    // Search for components by using:
    // 'cat: Capacitor', 'cat: C*c*r', 'cat: *M', 'cat: B*t', 'cat: E*'
    components.enterSearchTerm("cat: Capacitor")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    components.enterSearchTerm("cat: C*c*r")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    components.enterSearchTerm("cat: *M")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);

    components.enterSearchTerm("cat: B*t")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);

    components.enterSearchTerm("cat: C*")
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp2Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp4Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp5Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp6Data.name);
    tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmp8Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp1Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp3Data.name);
    tableHelper.assertRowNotPresentInTable(constData.componentTableHeaders.name, cmp7Data.name);
  })

  it('Search by MPN and assert the rows in the changeOrder list', () => {
    // Create Components
    cy.fixture('createComponent.json').then((component) => {
      compApi.createComponent(component[0])
      compApi.createComponent(component[1])
      compApi.createComponent(component[2])
      compApi.createComponent(component[3])
      compApi.createComponent(component[4]).then(res => {
        cy.visit(`/component/view/${res.body.data}`)
      })
    })

    const cmpName1 = '2.2uF, 10V, 10%, X7R';
    const cmpName2 = '5.62K,1% Resistor';
    const cmpName3 = '10k, 5%';
    const cmpName4 = '16MHz CRYSTAL_SMD'
    const cmpName5 = 'EBOM Assembly Parent';

    // Navigate to Change Orders tab                   // GRJ1023899JKL   RJ103K122   RJ103K123   XT16F   XT16M
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();

    // Verify component with MPN GRJ1023899JKL
    // Enter full MPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: GRJ1023899JKL');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter GRJ* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: GRJ*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter *JKL in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *JKL');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter GRJ*JKL in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: GRJ*JKL');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter GRJ*238*JKL in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: GRJ*238*JKL');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Verify component with MPN RJ103K122
    // Enter full MPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ103K122');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter RJ1* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ1*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter *122 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *122');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter RJ1*122 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ1*122');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter RJ1*3*122 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ1*3*122');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter *K12* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *K12*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter *23* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *23*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Verify component with MPN RJ103K123
    // Enter full MPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ103K123');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter RJ1* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ1*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter *122 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *123');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter RJ1*122 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ1*123');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter RJ1*3*122 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: RJ1*3*123');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Verify component with MPN XT16F
    // Enter full MPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: XT16F');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter XT* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: XT*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentPresentInList(cmpName5);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *6F in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *6F');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter XT*6F in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: XT*6F');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter X*1*F in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: X*1*F');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName5);

    // Enter *16* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *16*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentPresentInList(cmpName5);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Verify component with MPN XT16M
    // Enter full MPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: XT16M');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName5);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);

    // Enter XT* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: XT*');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName5);
    changeOrder.verifyProductOrComponentPresentInList(cmpName4);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *6M in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: *6M');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName5);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);

    // Enter XT*6M in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: XT*6M');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName5);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);

    // Enter X*1*M in search term and verify the row present or not
    changeOrder.searchCreatedComponent('mpn: X*1*M');
    changeOrder.waitUntilSearchLoadingToDisappear();
    changeOrder.verifyProductOrComponentPresentInList(cmpName5);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName4);
  })

  it('Search by DPN and assert the row in the changeOrder list', () => {
    // Create Components
    cy.fixture('createComponent.json').then((component) => {
      compApi.createComponent(component[0])
      compApi.createComponent(component[1])
      compApi.createComponent(component[2]).then(res => {
        cy.visit(`/component/view/${res.body.data}`)
      })
    })
    const cmpName1 = '2.2uF, 10V, 10%, X7R';
    const cmpName2 = '5.62K,1% Resistor';
    const cmpName3 = '10k, 5%';

    // Navigate to Change Orders tab
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();

    // Verify component with DPN DKGRJ1023
    // Enter full DPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: DKGRJ1023');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter DKG* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: DKG*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *1023 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: *1023');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter DKG*1023 in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: DKG*1023');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *RJ* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn:*RJ*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Verify component with DPN M103K
    // Enter full DPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: M103K');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter M10* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: M10*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *03K in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: *03K');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter M1*3K in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: M1*3K');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *03* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: *03*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *10* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: *10*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Verify component with DPN AXT16M
    // Enter full DPN in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: AXT16M');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);

    // Enter AXT* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: AXT*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);

    // Enter *16M in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dpn: *16M');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);

    // Enter AX*6M in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dpn: AX*6M');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);

    // Enter *XT* in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dpn: *XT*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
  })

  it('Search by Distributor and assert the row in the changeOrder list', () => {
    // Create Components
    cy.fixture('createComponent.json').then((component) => {
      compApi.createComponent(component[0])
      compApi.createComponent(component[1])
      compApi.createComponent(component[3]).then(res => {
        cy.visit(`/component/view/${res.body.data}`)
      })
    })
    const cmpName1 = '2.2uF, 10V, 10%, X7R';
    const cmpName2 = '5.62K,1% Resistor';
    const cmpName3 = '16MHz CRYSTAL_SMD';

    // Navigate to Change Orders tab
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();

    // Verify component with Distributor Digikey
    // Enter full Distributor name in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: Digikey');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter Dig* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: Dig*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *key in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: *key');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter Dig*ey in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: Dig*ey');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *gi* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: *gi*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Verify component with Distributor Mouser
    // Enter full Distributor name in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: Mouser');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter Mou* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: Mou*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *ser in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: *ser');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter Mo*er in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: Mo*er');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Enter *us* in search term and verify the row present or not
    changeOrder.searchCreatedComponent('dist: *us*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName3);

    // Verify component with Distributor Arrow
    // Enter full Distributor name in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dist: Arrow');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);

    // Enter Arr* in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dist: Arr*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);

    // Enter *ow in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dist: *ow');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);

    // Enter Ar*ow in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dist: Ar*ow');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);

    // Enter *ro* in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dist: *ro*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName2);

    // Enter *o* in search term and verify the row presen or not
    changeOrder.searchCreatedComponent('dist: *o*');
    changeOrder.verifyProductOrComponentPresentInList(cmpName2);
    changeOrder.verifyProductOrComponentPresentInList(cmpName3);
    changeOrder.verifyProductOrComponentNotPresentInList(cmpName1);
  })

  it("Search by Revision and assert the components in the new change order search list", () => {
    // Data to create components
    const cmp1Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-1",
      status       : constData.status.design,
      revision     : 12
    }
    const cmp2Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-2",
      status       : constData.status.design,
      revision     : 29
    }
    const cmp3Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-3",
      status       : constData.status.design,
      revision     : 41
    }
    const cmp4Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-4",
      status       : constData.status.design,
      revision     : 44
    }
    const cmp5Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-5",
      status       : constData.status.design,
      revision     : 15
    }
    const cmp6Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-6",
      status       : constData.status.design,
      revision     : 24
    }
    const cmp7Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-7",
      status       : constData.status.design,
      revision     : 61
    }
    const cmp8Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-8",
      status       : constData.status.design,
      revision     : "Y"
    }

    // Create Components
    compApi.createComponent(cmp1Data);
    compApi.createComponent(cmp2Data);
    compApi.createComponent(cmp3Data);
    compApi.createComponent(cmp4Data);
    compApi.createComponent(cmp5Data);
    compApi.createComponent(cmp6Data);
    compApi.createComponent(cmp7Data);
    compApi.createComponent(cmp8Data);

    // Navigate to Change Orders tab
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();

    // Search component by entering revision value (type:cmp rev: 1): Val
    changeOrder.searchCreatedComponent("type:cmp rev: 1");
    changeOrder.verifyProductOrComponentPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: 1*): Val*
    changeOrder.searchCreatedComponent("type:cmp rev: 1*");
    changeOrder.verifyProductOrComponentPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: 2*): Val*
    changeOrder.searchCreatedComponent("type:cmp rev: 2*");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: *1): *Val
    changeOrder.searchCreatedComponent("type:cmp rev: *1");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: 4*4): Val1*Val2
    changeOrder.searchCreatedComponent("type:cmp rev: 4*4");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering revision value (type:cmp rev: Y): Val
    changeOrder.searchCreatedComponent("type:cmp rev: Y");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp8Data.name);
  })

  it("Search by Status and assert the components in the new change order search list", () => {
    // Data to create components
    const cmp1Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-1",
      status       : constData.status.design
    }
    const cmp2Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-2",
      status       : constData.status.design
    }
    const cmp3Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-3",
      status       : constData.status.prototype
    }
    const cmp4Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-4",
      status       : constData.status.prototype
    }
    const cmp5Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-5",
      status       : constData.status.production
    }
    const cmp6Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-6",
      status       : constData.status.production
    }
    const cmp7Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-7",
      status       : constData.status.obsolete
    }
    const cmp8Data = {
      categoryType : "Electrical",
      category     : "Capacitor",
      name         : "cmp-8",
      status       : constData.status.obsolete
    }

    // Create Components
    compApi.createComponent(cmp1Data);
    compApi.createComponent(cmp2Data);
    compApi.createComponent(cmp3Data);
    compApi.createComponent(cmp4Data);
    compApi.createComponent(cmp5Data);
    compApi.createComponent(cmp6Data);
    compApi.createComponent(cmp7Data);
    compApi.createComponent(cmp8Data);

    // Navigate to Change Orders tab
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();

    // Search component by entering status value ('status: Value'): Value= Design
    changeOrder.searchCreatedComponent("status: Design");
    changeOrder.verifyProductOrComponentPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering status value ('status: Val'): Value= Des
    changeOrder.searchCreatedComponent("status: Des");
    changeOrder.verifyProductOrComponentPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering status value ('status: Val*'): Value= Pr*
    changeOrder.searchCreatedComponent("status: Pr*");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering status value ('status: *Val'): Value= *pe
    changeOrder.searchCreatedComponent("status: *pe");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering status value ('status: Val1*Val2'): Value= Pr*on
    changeOrder.searchCreatedComponent("status:Pr*on");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp8Data.name);

    // Search component by entering status value ('status: Val1*Val2*Val3'): Value= O*s*e
    changeOrder.searchCreatedComponent("status:O*s*e");
    changeOrder.verifyProductOrComponentNotPresentInList(cmp1Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp2Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp3Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp4Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp5Data.name);
    changeOrder.verifyProductOrComponentNotPresentInList(cmp6Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp7Data.name);
    changeOrder.verifyProductOrComponentPresentInList(cmp8Data.name);
  })
})
