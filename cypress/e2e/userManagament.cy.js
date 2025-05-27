describe("OrangeHRM test", () => {
    before(()=>{
        cy.session('login',() => {
            //Login to the application
            cy.visit("/web/index.php/auth/login")
            cy.get("input[placeholder=Username]").should("be.visible")
            cy.get("input[name=username]"). type("Admin")
            cy.get("input[name=password]").type("admin123")
            cy.get("button[type=submit]").click()
        })
    })

    it("Adding and Deleting New User in Admin User Management", ()=>{
        let username = "Sampath"+Date.now()
        let employeeName = "Admin  Admin123"

        // Navigate to Admin User Management
        cy.visit("/web/index.php/dashboard/index")
        cy.get('span').contains('Admin').first().click()

        // Inviting New User
        cy.xpath('//button[text()=" Add "]'). click()
        cy.xpath("(//label[text()='User Role']/ancestor::div[contains(@class, 'oxd-input-group')]//div[contains(@class, 'oxd-select-text')])[2]").click()
        cy.xpath("//div[@role='listbox']//span[text()='Admin']").click()
        cy.get('.oxd-autocomplete-text-input > input').type(employeeName).wait(2000)
        cy.xpath(`(//div[@role="option"]/span[text()="${employeeName}"])[1]`).click()
        cy.get(':nth-child(3) > .oxd-input-group > :nth-child(2) > .oxd-select-wrapper > .oxd-select-text > .oxd-select-text-input').click()
        cy.xpath("//div[@role='listbox']//span[text()='Enabled']").click()
        cy.get(':nth-child(4) > .oxd-input-group > :nth-child(2) > .oxd-input').type(username)
        cy.get('.user-password-cell > .oxd-input-group > :nth-child(2) > .oxd-input').type("Sampath@123")
        cy.get(':nth-child(2) > .oxd-input-group > :nth-child(2) > .oxd-input').type("Sampath@123")
        cy.get('.oxd-button--secondary').click()
        cy.xpath("//p[text()='Successfully Saved']").should('be.visible')
        cy.xpath("//p[text()='Successfully Saved']").should('not.exist')

        //Search and verify the user details
        cy.xpath("//label[text()='Username']/parent::div/following-sibling::div/input").should('be.visible')
        cy.xpath("//label[text()='Username']/parent::div/following-sibling::div/input").type(username)
        cy.xpath('//button[text()=" Search "]').click()
        cy.contains('(1) Record Found').should('exist')
        cy.get('[role="cell"]').eq(1).should("have.text", username)
        cy.get('[role="cell"]').eq(2).should("have.text", "Admin")
        cy.get('[role="cell"]').eq(4).should("have.text", "Enabled")

        // Delete the user and verify the user is deleted
        cy.get('[role="table"] button').first().click()
        cy.xpath('//button [text()=" Yes, Delete "]').click()
        cy.xpath('//p [text()="Successfully Deleted"]').should('exist')
        cy.xpath('//p [text()="Successfully Deleted"]').should('not.exist')
        cy.contains('span','No Records Found').should('be.visible')
   })
})