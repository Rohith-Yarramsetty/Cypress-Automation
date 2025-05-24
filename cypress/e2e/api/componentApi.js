/// <reference types="cypress" />

import { ApiHelpers } from "../helpers/apiHelper";
import { ManufacturesData } from "../helpers/dataHelpers/manufacturers";
import endpoints from "../helpers/endpoints";
import { FakerHelpers } from "../helpers/fakerHelper";

const apiHelper = new ApiHelpers();
const fakerhelper = new FakerHelpers();

export class ComponentApi {
  submitNewComponentForm(data) {
    let options = {
      category: "Capacitor",
      name: fakerhelper.generateProductName(),
      revision: '',
      status: "DESIGN",
      eid: '',
      compDesc: '',
      specs: '',
      images: [],
      documents: [],
    }

    for (let property in data) { 
      options[property] = data[property]; 
    }

    if (options.specs == '') {
      options.specs = [];
    }

    if (options.images == '') {
      options.images = [];
    }

    if (options.documents == '') {
      options.documents = [];
    }

    const path = endpoints.submitNewComponentForm;
    const headers = {
      'Content-Type': 'application/json'
    }
    const body = {
      "category": options.category,
      "name": options.name,
      "revision": options.revision,
      "status": options.status,
      "eid": options.eid,
      "description":options.compDesc,
      "images": options.images,
      "documents": options.documents,
      "specs": options.specs,
      "children": [],
      "archived": true
    }
  
    return apiHelper.postrequest(path, headers, body)
  }

  getComponentDataBeforeSave(id) {
    return apiHelper.getRequest(endpoints.getComponetData.replace('id', id));
  }

  saveComponent(res, id, manufacturers = res.manufacturers) {
    const path = endpoints.saveComponent.replace('id', id);
    const headers = {
      'Content-Type': 'application/json'
    }
    const body = {
      alias: "cmp",
      archived: false,
      category: res.category,
      categoryCPN: res.cpn,
      children: res.children,
      cmpState: res.cmpState,
      co: res.co,
      company: res.company,
      cpn: res.cpn,
      cpnVariant: res.cpnVariant,
      created: res.created,
      creator: res.creator,
      customProperties: res.customProperties,
      defaultCurrency: res.defaultCurrency,
      description: res.description,
      documents: res.documents,
      eid: res.eid,
      hasDuroAccount: res.hasDuroAccount,
      images: res.images,
      inCompleteCost: res.inCompleteCost,
      isEditableWhileInCo: false,
      lastModified: res.lastModified,
      lastModifiedBy: res.lastModifiedBy,
      library: res.library,
      manufacturers: manufacturers,
      mass: res.mass,
      massStatus: res.massStatus,
      mode: res.mode,
      modified: res.modified,
      name: res.name,
      nextCoRevision: res.nextCoRevision,
      onShapeReleasePackages: res.onShapeReleasePackages,
      originalRevision: res.originalRevision,
      previousRevision: res.previousRevision,
      previousStatus: res.previousStatus,
      primarySource: res.primarySource,
      procurement: res.procurement,
      releasesCount: res.releasesCount,
      restoreVariantGroup: res.restoreVariantGroup,
      revision: res.revision,
      revisionManaged: res.revisionManaged,
      revisions: res.revisions,
      rolledUpCost: res.rolledUpCost,
      rolledUpCostAsPrimary: res.rolledUpCostAsPrimary,
      specs: res.specs,
      status: res.status,
      unitOfMeasure: res.unitOfMeasure,
      vendor: res.vendor,
      vendorConfigurationString: res.vendorConfigurationString,
      vendorId: res.vendorId,
      _id: res._id
    }

    return apiHelper.postrequest(path, headers, body);
  }

  createComponent(data) {
    let manufacturers;
    if(data && data.manufacturer) {
      const manf = new ManufacturesData();
      manufacturers = manf.manufacturesData(data);
    }

    if(data) {
      return apiHelper.getAccessToken().then((token) => {
        let access_token = token.body.access_token;
        
        if (data.documents != '' && data.documents != null && data.images != '' && data.images != null) {
          let imageId
          cy.uploadFileApi(data.images, data.imageFileType, endpoints.thumbnailUpload, access_token).then((id) => {
            imageId = id;
          })
          return cy.uploadFileApi(data.documents, data.documentFileType, endpoints.documentsUpload, access_token).then((documentId) => {
            data.images = [imageId];
            data.documents = [{"file": documentId, "specs": {"type" : "GENERIC", "revision": "1", "status": "DESIGN"}}];
            return this.createComponentWithData(data, manufacturers)
          })
        } else if (data.documents != '' && data.documents != null ) {
            return cy.uploadFileApi(data.documents, data.documentFileType, endpoints.documentsUpload, access_token).then((documentId) => {
              data.documents = [{"file": documentId, "specs": {"type" : "GENERIC", "revision": "1", "status": "DESIGN"}}];
              this.createComponentWithData(data, manufacturers);
            })
        } else if (data.images != '' && data.images != null) {
            return cy.uploadFileApi(data.images, data.imageFileType, endpoints.thumbnailUpload, access_token).then((imageId) => {
              data.images = [imageId];
              return this.createComponentWithData(data, manufacturers);
          })
        } else {
          return this.createComponentWithData(data, manufacturers);
        }
      })
    } else {
      return this.createComponentWithData(data, manufacturers);
    }
  }

  createComponentWithData(data, manufacturers) {
    const successMsg = 'Component is successfully created'
    const failureMsg = 'Component is not created'
    return this.submitNewComponentForm(data).then((res) => {
      expect(res.status).to.eq(200);
      const id = res.body.data;
      return this.getComponentDataBeforeSave(id).then((res) => {
        expect(res.status).to.eq(200);
        return this.saveComponent(res.body.data, id, manufacturers).then((res) => {
          expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
        })
      })
    })
  }

  getAllComponents() {
    const headers = {
      'Content-Type': 'application/json'
    }
    const path = `/v1/search/components`;
    const body = {
      "page": "**",
      "sort": "id",
      "reverse": true,
      "limit": 0,
      "lean": true,
      "or": {
        "name": "**",
        "description": "**",
        "status": "**",
        "cpn": "**",
        "mfr": "**",
        "mpn": "**",
        "dist": "**",
        "dpn": "**",
        "category": "**",
        "revision": "**",
        "eid": "**"
      }
    };

    const successMsg = `Received all components details successfully`;
    const failureMsg = 'Failed to get the component details';

    return apiHelper.postrequest(path, headers, body).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }

  getComponentData(componentId) {
    const successMsg = "Successfully got the document details";
    const failureMsg = "Failed to get document details";

    const path = `/v1/components/${componentId}`;

    const headers = { 'Content-Type': 'application/json' };

    const body = {}

    return apiHelper.getRequest(path, headers, body).then((res) => {
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }
}
