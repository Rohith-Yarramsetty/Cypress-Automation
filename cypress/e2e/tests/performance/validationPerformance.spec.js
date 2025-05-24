import { SignIn } from "../../pages/signin"
import { Navigation } from "../../pages/navigation"
import { FeatureHelpers } from "../../helpers/featureHelper"
import constData from "../../helpers/pageConstants"
import { TableHelpers } from "../../helpers/tableHelper"
import { AuthApi } from "../../api/auth"
import { NavHelpers } from "../../helpers/navigationHelper"
import { Assembly } from "../../pages/components/assembly"
import { ImportFromFile } from "../../pages/components/importFromFile"
import { Components } from "../../pages/components/component"
import { CompanySettingsApi } from "../../api/companySettingsApi"
import { ComponentApi } from "../../api/componentApi"
import { UsersApi } from "../../api/userApi"
import { Utils } from '../../helpers/utils'

const signin = new SignIn()
const components = new Components()
const nav = new Navigation()
const featureHelper = new FeatureHelpers()
const tableHelper = new TableHelpers()
const authApi = new AuthApi()
const navHelper = new NavHelpers()
const assembly = new Assembly()
const importFromFile = new ImportFromFile()
const compSettings = new CompanySettingsApi()
const userApi = new UsersApi()
const compApi = new ComponentApi()

let email, companyId, orgId
let cmpToAdd

cmpToAdd = {
  CPN: '921-00001',
  Quantity: 1
}
const timer = {}

before(() => {
  Cypress.session.clearAllSavedSessions()
  const user = authApi.signUp()
  user.orgData.then(res => { orgId = res.body.org_id })
  email = user.email
  signin.signinWithOrigin(email)
})

beforeEach(() => {
  authApi.signin(email)
  navHelper.navigateToSearch()
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })

  // Create Component
  const compData = {
    category: "Battery Pack",
    name: "cmp-1"
  }
  compApi.createComponent(compData)
})

afterEach(() => {
  compSettings.resetCompany(companyId)
})

after(() => {
  compSettings.deleteCompany(companyId, orgId)
})

describe("Large Assembly Table Validation Perf", { tags: ['perf', 'perf-validation'] }, () => {
  const module = 'Large Assembly Table Validation Perf'

  const runTestSteps = ({ importFile, test }) => {
    // Import components from File
    nav.openComponentsTab()
    importFromFile.clickOnImportFromFile()
    importFromFile.uploadFile('6.baseline-assembly-component.xlsx')

    // Verify the Labels mapped
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name')
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category')
    importFromFile.clickOnContinue()

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation()
    importFromFile.clickOnContinue()
    featureHelper.waitForLoadingIconToDisappear()

    // Verify the count of imported components
    importFromFile.verifyTotalComponentsCount(2)
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'EBOM Assembly Parent')

    // Import Assembly Components
    components.clickEditIcon()
    assembly.clickOnAssemblyTab()
    assembly.clickOnImportFromFile()
    assembly.uploadFile(importFile)
    featureHelper.waitForLoadingIconToDisappear()

    // Verify the labels Mapped
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category')
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name')
    importFromFile.verifyNecessaryLabelsMapped('Quantity', 'quantity')
    importFromFile.verifyNecessaryLabelsMapped('Ref Des', 'ref des')
    importFromFile.clickOnContinue()

    // Verify import errors
    importFromFile.verifyNoErrorsAfterValidation()
    importFromFile.clickOnContinue()
    components.clickSaveButtonInEditComponent({ timeout: 1000000 })
    nav.openComponentsTab()

    // Verify the count of imported components
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'EBOM Assembly Parent')
    assembly.clickOnAssemblyTab()

    let msg = 'view to edit transition'
    components.clickEditIcon()
    Utils.startTimer(timer)
    featureHelper.waitForLoadingIconToDisappear()
    Utils.endTimer({ test, msg, timer })

    msg = 'edit quantity cell'
    assembly.setQuantityValue(1, 10)
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReport()
    assembly.clickQuantityCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'reset quantity cell'
    assembly.setQuantityValue(1, 1)
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReportToClear()
    assembly.clickQuantityCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'delete ref des cell'
    assembly.setRefDesValue(1, '')
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReportToClear()
    assembly.clickRefDesCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'duplicate ref des in a cell'
    assembly.setRefDesValue(1, 'R1,R1')
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReport()
    assembly.clickRefDesCell(1)
    Utils.endTimer({ test, msg, timer })

    // remove duplicaton from ref des
    assembly.setRefDesValue(1, 'R1')
    assembly.waitForAssemblyErrorReportToClear()
    assembly.clickRefDesCell(1)

    msg = 'duplicate ref des across cells'
    assembly.setRefDesValue(1, 'R1,C5693')
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReport()
    assembly.clickRefDesCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'reset ref des to default'
    assembly.setRefDesValue(1, 'U625')
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReportToClear()
    assembly.clickRefDesCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'duplicate item numbers across cells'
    assembly.setItemNumberValue(1, 1)
    assembly.setItemNumberValue(2, 1)
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReport()
    assembly.clickItemNumberCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'reset item numbers to default'
    assembly.setItemNumberValue(1, '')
    assembly.setItemNumberValue(2, '')
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReportToClear()
    assembly.clickItemNumberCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'set notes cell'
    assembly.setNotesValue(1, 'random notes')
    Utils.startTimer(timer)
    assembly.waitForAssemblyErrorReportToClear()
    assembly.clickNotesCell(2)
    Utils.endTimer({ test, msg, timer })

    msg = 'remove row from table'
    assembly.removeRow(2)
    Utils.startTimer(timer)
    assembly.clickQuantityCell(1)
    Utils.endTimer({ test, msg, timer })

    msg = 'add component from library'
    Utils.startTimer(timer)
    assembly.addComponentsToAssemblyTable(cmpToAdd)
    assembly.waitForAssemblyErrorReportToClear()
    assembly.clickQuantityCell(1)
    Utils.endTimer({ test, msg, timer })
  }

  it('Should handle 20 components', { retries: 0 }, () => {
    const spec = 'Should handle 20 components'
    const test = `${module}:${spec}`
    runTestSteps({
      importFile: 'validation-perf-20-cmps.xlsx',
      test
    })
  })

  it('Should handle 50 components', { retries: 0 }, () => {
    const spec = 'Should handle 50 components'
    const test = `${module}:${spec}`
    runTestSteps({
      importFile: 'validation-perf-50-cmps.xlsx',
      test
    })
  })

  it.only('Should handle 100 components', { retries: 0 }, () => {
    const spec = 'Should handle 100 components'
    const test = `${module}:${spec}`
    runTestSteps({
      importFile: 'validation-perf-100-cmps.xlsx',
      test
    })
  })

  it('Should handle 150 components', { retries: 0 }, () => {
    const spec = 'Should handle 150 components'
    const test = `${module}:${spec}`
    runTestSteps({
      importFile: 'validation-perf-150-cmps.xlsx',
      test
    })
  })

  it('Should handle 250 components', { retries: 0 }, () => {
    const spec = 'Should handle 250 components'
    const test = `${module}:${spec}`
    runTestSteps({
      importFile: 'validation-perf-250-cmps.xlsx',
      test
    })
  })
})
