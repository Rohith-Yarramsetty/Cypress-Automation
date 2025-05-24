export default {
  nthActionLink: (row, col) => `.integrations-table #extended-table-data tr:nth-child(${row + 1}) td:nth-child(${col}) a`,
  nthTableCell: (row, col) => `.integrations-table #extended-table-data tr:nth-child(${row + 1}) td:nth-child(${col})`,
  formBlock: '.valispace-form-block',
  urlInput: '[name="url"]',
  usernameInput: '[name="username"]',
  passwordInput: '[name="password"]',
  connectBtn: 'button.connect',
  helpIconForPlugin: '//div[text()="name"]/ancestor::td/preceding-sibling::td[@class="help-icon-class"]//a',
  connectIntegration: (name) => `//div[text()="${name}"]//ancestor::tr//div[@class="action"]//a[@class="link"]`,
}