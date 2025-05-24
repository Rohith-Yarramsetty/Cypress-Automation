/// <reference types="cypress" />

import { ApiHelpers } from "../helpers/apiHelper";
import { FakerHelpers } from "../helpers/fakerHelper";
import endpoints from "../helpers/endpoints";
import { FeatureHelpers } from "../helpers/featureHelper";
import { PropelAuthApi } from "./propelAuthApi";
import { Utils } from "../helpers/utils";

const apiHelper = new ApiHelpers();
const faker = require('faker');
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const propelApi = new PropelAuthApi();

let serverId = Cypress.env('serverId');

export class UsersApi {

  createUser(firstName, lastName, email, role, groups, title = "QA") {
    const baseUrl = Cypress.config().baseUrl;
    const envIndex = Utils.getEnvIndex(baseUrl)
    const apiSuffix = baseUrl.includes('test') ? envIndex : ''
    const gcpPrefix = baseUrl.includes('staging') ? 'staging' : 'qa'
    const env = `https://core-api${apiSuffix}.${gcpPrefix}-gcp.durolabs.xyz`
    const path = `${env}/graphql`;
    const successMsg = `Successfully created user "${firstName} ${lastName}"`;
    const failureMsg = 'Failed to create user';

    return this.getCurrentUser().then((res) => {
      const companyId = res.body.data.company;
      const body = [
        {
          "variables": {
            "input": {
              "firstName": firstName,
              "lastName": lastName,
              "email": email,
              "role": role,
              "groups": groups,
              "title": title,
              "primaryCompanyId": companyId,
              "invite": {"accepted": true}
            }
          },
          "query":"mutation ($input: CreateUserInput) {\n  createUser(input: $input) {\n    id\n    __typename\n  }\n}"
        }
      ]

      return apiHelper.getAccessToken().then((response) => {
        let access_token = response.body.access_token;
        return cy.request({
          method: 'POST',
          url: path,
          headers: { 
            authorization: `Bearer ${access_token}`,
            origin: baseUrl
          },
          body: body,
          retryOnStatusCodeFailure: true
        }).then((res)=>{
          expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
        })
      })
    })
  }

  visitInvitationLink(email) {
    const projectName = featureHelper.getProjectName();
    const date = new Date();
    cy.mailosaurGetMessage(serverId, {
      sentTo: email
    }, {
      timeout: 20000,
      receivedAfter: date,
    }).then((email) => {
      expect(email.subject).to.eq(`Confirm your email for ${projectName}`);
      cy.visit(email.html.links[0].href)
    })
  }

  acceptInvitation(email, newPassword = Cypress.env('password'), emailSubject = 'Confirm your email') {
    const projectName = featureHelper.getProjectName();
    const date = new Date();
    cy.mailosaurGetMessage(serverId, {
      sentTo: email,
      subject: emailSubject
    },
    {
      timeout: 20000,
      receivedAfter: date
    }).then((email) => {
      expect(email.subject).to.eq(`Confirm your email for ${projectName}`);
      const link = email.html.links[1].href;
      cy.request({
        url: link,
      }).then((resp) => {
        expect(resp.status).to.eq(200);
        this.setPassword(newPassword)
      });
    })
  }

  setPassword(newPassword = Cypress.env('password')) {
    const propEnv = featureHelper.propelAuthUrl();
    const path = `${propEnv}/api/fe/v1/update_password`;
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': '-.-'
    }
    const body = {
      "password": newPassword,
    }
    cy.request({
      method: 'POST',
      url: path,
      headers: headers,
      body: body,
      retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status).to.eq(200);
    })
  }

  createUserUsingApi(role = "USER", groups = ["QA"]){
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = fakerHelper.generateMailosaurEmail(firstName, lastName);
    const userId = this.createUser(firstName, lastName, email, role, groups)

    return {
      email: email,
      firstName: firstName,
      lastName: lastName,
      fullName: firstName + ' ' + lastName,
      userId: userId
    }
  }

  getCurrentUser() {
    const path = endpoints.currentUser;
    const successMsg = 'Successfully received Current user details';
    const failureMsg = 'Failed to get current user details';

    return apiHelper.getRequest(path).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }

  createUserForEachRole() {
    const userData        = this.createUserUsingApi('USER');
    const vendorData      = this.createUserUsingApi('VENDOR');
    const approverData    = this.createUserUsingApi('APPROVER');
    const reviewerData    = this.createUserUsingApi('REVIEWER');
    const supplierData    = this.createUserUsingApi('SUPPLIER');
    const adminData       = this.createUserUsingApi('ADMINISTRATOR');

    return {
      usersEmail           : userData.email,
      usersFirstName       : userData.firstName,
      usersLastName        : userData.lastName,
      usersUserId          : userData.userId,
      vendorsEmail         : vendorData.email,
      vendorsFirstName     : vendorData.firstName,
      vendorsLastName      : vendorData.lastName,
      vendorsUserId        : vendorData.userId,
      approversEmail       : approverData.email,
      approversFirstName   : approverData.firstName,
      approversLastName    : approverData.lastName,
      approversUserId      : approverData.userId,
      reviewersEmail       : reviewerData.email,
      reviewersFirstName   : reviewerData.firstName,
      reviewersLastName    : reviewerData.lastName,
      reviewersUserId      : reviewerData.userId,
      suppliersEmail       : supplierData.email,
      suppliersFirstName   : supplierData.firstName,
      suppliersLastName    : supplierData.lastName,
      suppliersUserId      : supplierData.userId,
      adminEmail           : adminData.email,
      adminFirstName       : adminData.firstName,
      adminLastName        : adminData.lastName,
      adminUserId          : adminData.userId,
    }
  }

  createUserUsingPA(role = "USER") {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = fakerHelper.generateMailosaurEmail(firstName, lastName);
    const email_confirmed = true
    const password = Cypress.env("password")
    const projectName = featureHelper.getProjectName();
    const successMsg = `Successfully added an user ${email} in project ${projectName} in PropelAuth`;
    const failureMsg = `Failed to add an user ${email} in project ${projectName} in PropelAuth`;
    let organization_id;
    propelApi.signin();
    const userId = propelApi.createUser(firstName, lastName, email, password, email_confirmed, projectName).then((res1) => {
      cy.log(JSON.stringify(res1.body))
      cy.log(res1.body)
    })

    apiHelper.getAccessToken().then((res) => {
      organization_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
    })

    propelApi.getRefreshToken().then((res) => {
      let access_token = res.body.access_token;
      const org_id = Object.keys(JSON.parse(JSON.stringify(res.body.org_id_to_org_member_info)))[0]
      return propelApi.getProjectId().then((response) => {
        const index = response.body.findIndex(obj => obj.name == projectName);
        let project_id = response.body[index]['project_id']
        let prod_realm_id = response.body[index]['prod_realm_id']
        let test_realm_id = response.body[index]['test_realm_id']

        const path = `https://api.propelauth.com/v2/${org_id}/project/${project_id}/realm/${prod_realm_id}/org/add_user`;
       
        const body = { 
          "role": role,
          "org_id": organization_id,
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

    return {
      email: email,
      firstName: firstName,
      lastName: lastName,
      fullName: firstName + ' ' + lastName,
      userId: userId
    }
  }

  getCompanyName() {
    const path = endpoints.companyProfile;
    const successMsg = 'Successfully received Company name';
    const failureMsg = 'Failed to get Company name';

    return apiHelper.getRequest(path).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }
}
