import { UsersApi } from "../../../api/userApi";
import { ApiHelpers } from "../../apiHelper";

const apiHelper = new ApiHelpers();
const userApi = new UsersApi();

const baseUrl = Cypress.config().baseUrl;
const apiUrl = baseUrl.includes('test') ? baseUrl.replace("//test", "//core-api") : baseUrl.replace("//", "//core-api.");

export class CpnLibraries {
  createLibrary(cpnRules) {
    return apiHelper.getApiToken().then(res2 => {
      const apiToken = res2.body.data.apiToken.token;

      return cy.request({
        method: 'POST',
        url: apiUrl + "/graphql",
        body: JSON.stringify(cpnRules),
        headers: {
          'Content-Type': 'application/json',
          'apiToken': apiToken,
        },
      }).then((response) => {
        const successMsg = `Successfully created new library with ID: ${response.body.data.createLibrary.id}`;
        const failureMsg = "Unable to create new library";
        expect(response.status).to.eq(200)
        expect(response.body.data).to.have.property('createLibrary');
        expect(response.body.data.createLibrary).to.have.property('id');
        expect(response.body.data.createLibrary).to.have.property('name');
        expect(response.status == 200 ? successMsg : failureMsg).to.eq(successMsg);
      })
    })
  }

  updateLibrary(new_libraryId) {
    return userApi.getCurrentUser().then(userRes =>
      apiHelper.getApiToken().then(res2 => {
        const apiToken = res2.body.data.apiToken.token;
        const userId = userRes.body.data._id

        return cy.request({
          method: 'POST',
          url: apiUrl + "/graphql",
          headers: {
            'Content-Type': 'application/json',
            'apiToken': apiToken,
          },
          body: JSON.stringify({
            query: `mutation {
              updateUser(
                input:{
                  id: "${userId}"
                  activeLibraryId: "${new_libraryId}"
                  libraryIds:["${new_libraryId}"]
                }
              )
              {
                id
                firstName
                lastName
                activeLibrary { id }
                libraries { id }
              }
            }`
          }),
        }).then(response => {
          const successMsg = `Successfully updated the library ${response.body.data.updateUser.activeLibrary.id} with new CPN rules`;
          const failureMsg = "Unable to update the library with new CPN rules";
          expect(response.status==200 ? successMsg : failureMsg).to.eq(successMsg);
          expect(response.body.data.updateUser.activeLibrary.id).to.eq(new_libraryId);
        })
      }))
  }

  deleteLibrary(libraryId) {
    return apiHelper.getApiToken().then(res2 => {
      const apiToken = res2.body.data.apiToken.token;
      return cy.request({
        method: 'POST',
        url: apiUrl + "/graphql",
        body: JSON.stringify({
          query: `mutation {
                    deleteLibrary(input: {
                      id:"${libraryId}"
                    })
                    { id }
                  }`
        }),
        headers: {
          'Content-Type': 'application/json',
          'apiToken': apiToken,
        },
      }).then((response) => {
        const successMsg = "Successfully deleted the library";
        const failureMsg = "Unable to delete the library";
        expect(response.status == 200 ? successMsg : failureMsg).to.eq(successMsg);
        expect(response.body.data.deleteLibrary.id).to.eq(libraryId);
      })
    })
  }

  set_CPN_rules(cpnRules) {
    userApi.getCurrentUser().then(userRes => {
      const activeLibraryId = userRes.body.data.activeLibrary._id;

      // Create a library with new CPN rules
      this.createLibrary(cpnRules).then((res) => {

        // Update the user with new library
        this.updateLibrary(res.body.data.createLibrary.id);
      })

      // Delete the old library
      this.deleteLibrary(activeLibraryId);
    })
  }
}
