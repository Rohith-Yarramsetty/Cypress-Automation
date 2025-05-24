export default {
  orbitFabAssembly: {
    specLabel: '//label[text()="labelName"]',
    finish: '//label[text()="Finish"]//following-sibling::input',
    material: '//label[text()="Material"]//following-sibling::input',
    finishInCmpEditPage: '//span[text()="Finish"]//following-sibling::div/input',
    materialInCmpEditPage: '//span[text()="Material"]//following-sibling::div/input',
    specFieldsInViewCmpPage: '//span[text()="name"]//following-sibling::span',
    applicablityFields: 'select[name="spec"]'
  },
}
