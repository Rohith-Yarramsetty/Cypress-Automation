/// <reference types="cypress" />

export class Utils {
  static getEnvIndex (baseUrl = Cypress.config().baseUrl) {
    return baseUrl.match(/test(?<index>\d+?)\./)?.groups?.index
  }
  static perfLog(logObj) {
    return cy.task('perfLog', logObj)
  }
  static log(msg) {
    return cy.task('log', msg)
  }
  static runInCyChain(fn) {
    return cy.wrap(null).then(fn)
  }
  static startTimer (timer) {
    return this.runInCyChain(() => {
      if (!timer) {
        const errorMsg = 'ERROR: startTimer called without timer obj'
        cy.log(errorMsg)
        this.log(errorMsg)
        timer = {}
      }
      const start = new Date()
      timer.start = start
      cy.wrap(start)
    })
  }
  static endTimer ({ test, msg, timer = {} }) {
    return this.runInCyChain(() => {
      if (!timer.start) {
        const errorMsg = 'ERROR: end Timer called without start in timer obj'
        cy.log(errorMsg)
        this.log(errorMsg)
        return false
      }
      const end = new Date()
      const diff = end - timer.start
      timer.diff = diff
      cy.log(`${test}:${msg}, DIFF:${diff}`)
      cy.log('=============================')
      this.perfLog({
        test,
        msg,
        diff
      })
      cy.wrap(diff)
    })
  }

  //note: we are using shouldWaitForInvalidClass parameter only in case of any error. By using shouldWaitForInvalidClass flag we are waiting until the input's background get red in case of error.
  static getErrorMsgFromDataTip(selector, shouldWaitForInvalidClass=true)
  {
      if (shouldWaitForInvalidClass)  
      cy.get(selector+".invalid").should('be.visible');
      return cy.get(selector).invoke('attr', ("data-tip"))
  }
}