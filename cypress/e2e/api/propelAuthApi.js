/// <reference types="cypress" />

import { FeatureHelpers } from "../helpers/featureHelper";

const featureHelper = new FeatureHelpers();

export class PropelAuthApi {
  signin(email = Cypress.env("propelAuthUsername"), password = Cypress.env("propelAuthPassword")) {
    const path = 'https://auth.propelauth.com/api/fe/v1/login';
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': '-.-'
    }
    const body = {
      "email": email,
      "password": password,
    }

    const successMsg = 'Successfully loggged in to PropelAuth';
    const failureMsg = 'Failed to login in to PropelAuth';

    return cy.request({
        method: 'POST',
        url: path,
        headers: headers,
        body: body,
        retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }

  getRefreshToken() {
    const path = 'https://auth.propelauth.com/api/v1/refresh_token';
    const headers = {
      'Content-Type': 'application/json',
      'origin': Cypress.config().baseUrl,
      'referer': `${Cypress.config().baseUrl}/`,
    }

    return cy.request({
        method: 'GET',
        url: path,
        headers: headers,
        retryOnStatusCodeFailure: true
    })
  }

  getProjectId() {
    return this.getRefreshToken().then((res) => {
      let access_token = res.body.access_token;
      const org_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
      const path = `https://api.propelauth.com/v2/${org_id}/project/`;
      const successMsg = 'Successfully received project id details from PropelAuth';
      const failureMsg = 'Failed to receive project id details from PropelAuth';
      return cy.request({
        method: 'GET',
        url: path,
        headers: { authorization: `Bearer ${access_token}` },
        retryOnStatusCodeFailure: true
      }).then((res)=>{
        expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
      })
    })
  }

  createOrg(companyName, project) { 
    return this.getRefreshToken().then((res) => {
      let access_token = res.body.access_token;
      const org_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
      return this.getProjectId().then((response) => {
        const index = response.body.findIndex(obj => obj.name== project);
        let project_id = response.body[index]['project_id']
        let prod_realm_id = response.body[index]['prod_realm_id']

        const successMsg = `Successfully created a company ${companyName} in project ${project} in PropelAuth`;
        const failureMsg = `Failed to create a company ${companyName} in project ${project} in PropelAuth`;
        const path = `https://api.propelauth.com/v2/${org_id}/project/${project_id}/realm/${prod_realm_id}/org/create`;
        cy.request({
          method: 'POST',
          url: path,
          headers: { authorization: `Bearer ${access_token}` },
          body: {"org_name": companyName},
          retryOnStatusCodeFailure: true
        }).as('resp').then((res)=>{
          cy.log(JSON.stringify(res))
          window.localStorage.setItem('orgId', res.body.org_id)
          expect(res.status === 201 ? successMsg : failureMsg).to.eq(successMsg);
        })
        return cy.get('@resp')
      })
    })
  }

  createUser(firstName, lastName, email, password = Cypress.env("password"), email_confirmed = true, project) { 
    return this.getRefreshToken().then((res) => {
      let access_token = res.body.access_token;
      const org_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
      return this.getProjectId().then((response) => {
        const index = response.body.findIndex(obj => obj.name == project);
        let project_id = response.body[index]['project_id']
        let prod_realm_id = response.body[index]['prod_realm_id']
        const successMsg = `Successfully created a user ${email} in project ${project} in PropelAuth`;
        const failureMsg = `Failed to create a user ${email} in project ${project} in PropelAuth`;

        const path = `https://api.propelauth.com/v2/${org_id}/project/${project_id}/realm/${prod_realm_id}/user/create`;
       
        const body = {
          "email_confirmed": email_confirmed,
          "send_email_to_confirm_email_address": true,
          "password": password,
          "first_name": firstName,
          "last_name": lastName,
          "email": email
        }
        return cy.request({
          method: 'POST',
          url: path,
          headers: { authorization: `Bearer ${access_token}` },
          body: body,
          retryOnStatusCodeFailure: true
        }).then((res)=>{
          expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
        })
      })    
    })
  }

  deleteCompany(organization_id) {
    const projectName = featureHelper.getProjectName();
    const successMsg = `Successfully deleted the company with id ${organization_id} from PA`
    const failureMsg = `Failed to delete the company with id ${organization_id} from PA`

    this.signin();
    this.getRefreshToken().then((res) => {
      let access_token = res.body.access_token;
      const org_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
      return this.getProjectId().then((response) => {
        const index = response.body.findIndex(obj => obj.name == projectName);
        let project_id = response.body[index]['project_id']
        let prod_realm_id = response.body[index]['prod_realm_id']

        const path = `https://api.propelauth.com/v2/${org_id}/project/${project_id}/realm/${prod_realm_id}/org/${organization_id}`;
       
        const body = {}
        return cy.request({
          method: 'DELETE',
          url: path,
          headers: { authorization: `Bearer ${access_token}` },
          body: body,
          retryOnStatusCodeFailure: true
        }).then((res)=>{
          expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
        })
      })
    })
  }

  deleteUser(user_id) {
    const projectName = featureHelper.getProjectName();
    const successMsg = `Successfully deleted the user with id ${user_id} from PA`
    const failureMsg = `Failed to delete the user with id ${user_id} from PA`

    this.signin();
    this.getRefreshToken().then((res) => {
      let access_token = res.body.access_token;
      const org_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
      return this.getProjectId().then((response) => {
        const index = response.body.findIndex(obj => obj.name == projectName);
        let project_id = response.body[index]['project_id']
        let prod_realm_id = response.body[index]['prod_realm_id']

        const path = `https://api.propelauth.com/v2/${org_id}/project/${project_id}/realm/${prod_realm_id}/user/${user_id}/act`;
       
        const body = {"action":"Delete"};
        return cy.request({
          method: 'POST',
          url: path,
          headers: { authorization: `Bearer ${access_token}` },
          body: body,
          retryOnStatusCodeFailure: true
        }).then((res)=>{
          expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
        })
      })
    })
  }

  deleteAllUsersInOrg(orgId) {
    const projectName = featureHelper.getProjectName();
    this.signin();
    this.getRefreshToken().then((res) => {
      let access_token = res.body.access_token;
      const org_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
      this.getProjectId().then((response) => {
        const index = response.body.findIndex(obj => obj.name == projectName);
        let project_id = response.body[index]['project_id']
        let prod_realm_id = response.body[index]['prod_realm_id']

        const path = `https://api.propelauth.com/v2/${org_id}/project/${project_id}/realm/${prod_realm_id}/org/users`;       
        const body = {"org_id": orgId, "page_size": 70, "page_number": 0};

        cy.request({
          method: 'POST',
          url: path,
          headers: { authorization: `Bearer ${access_token}` },
          body: body,
          retryOnStatusCodeFailure: true
        }).then((res) => {
            const totalUsers = res.body.total_users;
            for (let i = 0; i < totalUsers; i++) {
              let userId = res.body.users[i].user_id;
              const successMsg = `Successfully deleted the user with id ${userId} from PA`
              const failureMsg = `Failed to delete the user with id ${userId} from PA`
              const path = `https://api.propelauth.com/v2/${org_id}/project/${project_id}/realm/${prod_realm_id}/user/${userId}/act`;
              const body = { "action": "Delete" };
              cy.request({
                method: 'POST',
                url: path,
                headers: { authorization: `Bearer ${access_token}` },
                body: body,
                retryOnStatusCodeFailure: true
              }).then((res)=>{
                expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
              }) 
            }
        })
      })
    })
  }
}