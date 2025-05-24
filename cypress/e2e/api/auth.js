/// <reference types="cypress" />

import { ApiHelpers } from "../helpers/apiHelper";
import endpoints from "../helpers/endpoints";
import { FakerHelpers } from "../helpers/fakerHelper";
import { FeatureHelpers } from "../helpers/featureHelper";
import { Navigation } from "../pages/navigation";
import { PropelAuthApi } from "./propelAuthApi";
import { UsersApi } from "./userApi";

const apiHelper = new ApiHelpers();
const faker = require('faker');
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const propelApi = new PropelAuthApi();
const userApi = new UsersApi();
const nav = new Navigation();

export class AuthApi {
  signin(email = Cypress.env("username"), password = Cypress.env("password")) {
    let propEnv = featureHelper.propelAuthUrl();

    const path = `${propEnv}/api/fe/v1/login`;
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': '-.-'
    }
    const body = {
      "email": email,
      "password": password
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
    cy.wait(4000);
    cy.reload();
  }

  signup(companyName, firstName, lastName, email, password = Cypress.env("password"), phone = '') {
    const path = endpoints.signup;
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'cookie'
    }
    const body = {
      "user": {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "phoneNumber": phone,
        "password": password,
        "confirmPassword": password
      },
      "company":{
        "name": companyName,
        "subscription":{
          "package":"PRO",
          "duration":"Monthly"
        }
      },
      "accept":{
        "valid":true
      },
      "submit":{
        "class":""
      }
    }

    return apiHelper.postrequest(path, headers, body).then((res)=>{
      expect(res.status).to.eq(200);
    })
  }

  signOut() {
    let propEnv = featureHelper.propelAuthUrl();

    const path = `${propEnv}/api/v1/logout`;
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'cookie'
    }

    apiHelper.getAccessToken().then((response) => {
      let access_token = response.body.access_token;
      cy.request({
        method: 'POST',
        url: path,
        headers: { authorization: `Bearer ${access_token}` },
        body: null,
        retryOnStatusCodeFailure: true
      })
    }).then((res)=>{
      expect(res.status).to.eq(200);
    })
  }

  confirmSignUpInvitationLink(email, serverId = Cypress.env('serverId')) {
    const date = new Date();
    cy.mailosaurGetMessage(serverId, {
      sentTo: email
    },
    { 
      receivedAfter: date,
      timeout: 20000
    }).then((mail) => {
      expect(mail.subject).to.eq("Welcome to Duro");
      const link = mail.html.links[0].href;
      if (link.includes(Cypress.config().baseUrl)) {
        const token = link.split('/')[4]
        this.confirmSignUp(token)
      } else {
        cy.request({
          url: link,
          followRedirect: false,
        }).then((resp) => {
          // expect(resp.status).to.eq(200);
          const token = resp.redirectedToUrl.split('/')[4];
          this.confirmSignUp(token)
        });
      }
    })
  }

  confirmSignUp(token) {
    const path = endpoints.confirmSignUp;
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': 'cookie'
    };
    const body = {
      "token": token,
    }

    apiHelper.postrequest(path, headers, body).then((res)=>{
      expect(res.status).to.eq(200);
    })
  }

  signUp1(serverId = Cypress.env('serverId')) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = fakerHelper.generateMailosaurEmail(firstName, lastName);
    const companyName = faker.lorem.word(9)+ 'durolabs'+ faker.random.number({min:1000, max:9999});
    let signUpRes = this.signup(companyName, firstName, lastName, email);
    signUpRes.as('data')  
    this.confirmSignUpInvitationLink(email, serverId)
    return {
      email: email,
      firstName: firstName,
      lastName: lastName,
      fullName: firstName + ' ' + lastName,
      companyName: companyName,
      data: cy.get('@data')
    }
  }

  signUp() {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = fakerHelper.generateMailosaurEmail(firstName, lastName);
    const companyName = 'cy' + faker.lorem.word(9)+ 'durolabs'+ faker.random.number({min:1000000, max:9999999});
    const email_confirmed = true
    const role = 'ADMINISTRATOR'
    const password = Cypress.env("password")
    const projectName = featureHelper.getProjectName();
    const successMsg = `Successfully added an user ${email} to company ${companyName} in project ${projectName} in PropelAuth`;
    const failureMsg = `Failed to add an user ${email} to company ${companyName} in project ${projectName} in PropelAuth`;
    let organization_id;
    propelApi.signin();
    propelApi.createUser(firstName, lastName, email, password, email_confirmed, projectName)
    const org_data = propelApi.createOrg(companyName, projectName).then((res1) => {
      organization_id = res1.body.org_id;
    })
    org_data.as('org_data')
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
      companyName: companyName,
      role: role,
      orgData: cy.get('@org_data')
    }
  }

  reSignin() {
    userApi.getCurrentUser().then((res) => {
      const email = res.body.data.email;
      this.signOut();
      this.signin(email);
      nav.openDashboard();
      nav.verifyNavigationMenuItems();
    })
  }
}
