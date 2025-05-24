/// <reference types="cypress" />

import { ApiHelpers } from "../helpers/apiHelper";
import endpoints from "../helpers/endpoints";

const apiHelper = new ApiHelpers();

let access_token;

export class ChangeOrderApi {
  deleteDraftChangeOrder(changeOrderId) {
    const successMsg = "Draft CO deleted successfully";
    const failureMsg = "Failed to delete draft CO";

    const path = endpoints.deleteDraftedCo(changeOrderId);

    const headers = { 'Content-Type': 'application/json' };

    const body = {}

    apiHelper.postrequest(path, headers, body).then((res) => {
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }
}

