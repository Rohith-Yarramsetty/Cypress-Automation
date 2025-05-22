


it("Login to OrangrHRM and access the admin page", () => {
    cy.visit("/web/index.php/auth/login");
    cy.get("input[name=username]").type("Admin");
    cy.get("input[type=password]").type("admin123");
    cy.get("button[type=submit]").click();

    cy.get('span').contains('Admin').first().click();
    cy.get('h5').contains('System Users').should('be.visible');
});

it("Login to ORangeHRM and interact with various types of UI elements", () => {
    cy.visit("/web/index.php/auth/login");
    cy.get("input[name=username]").type("Admin");
    cy.get("input[type=password]").type("admin123");
    cy.get("button[type=submit]").click();
    cy.get('span').contains('Admin').first().click();
    cy.get('h5').contains('System Users').should('be.visible');

    cy.xpath('//label[text()="Username"]/parent::div/following-sibling::div/input')
      . clear().type("Sampath");
    cy.xpath('//label[text()="User Role"]/parent::div/following-sibling::div//div[text()="-- Select --"]')
      .click()
    cy.xpath('//div[@role="listbox"]//span[text()="Admin"]')
      .click()
})
