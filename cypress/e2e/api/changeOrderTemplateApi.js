/// <reference types="cypress" />

import { ApiHelpers } from "../helpers/apiHelper";
import endpoints from "../helpers/endpoints";

const apiHelper = new ApiHelpers();

export class CreateTemplate {
  coTemplate(templateName, approversList = [], notifiersList = [], externalUsers = [], isPublic = false, coType = "eco", approvalType = "First-In") {
    const path = endpoints.saveCoApprovalTemplate;
    const headers = {
      'Content-Type': 'application/json'
    }
    const body = {
      "externalUsers": externalUsers,
      "approvalType": approvalType,
      "templateName": templateName,
      "coType": coType,
      "isPublic": isPublic,
      "approversList": approversList,
      "notifiersList": notifiersList
    }

    const successMsg = `Change order template "${templateName}" successfully created`;
    const failureMsg = 'Failed to create Change Order template';

    apiHelper.postrequest(path, headers, body).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }
}
