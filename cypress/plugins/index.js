/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars


module.exports = (on, config) => {
   // on('before:browser:launch', (browser = {}, args) => {
     
   //   if (browser.name === 'chrome') {
   //     // launch chrome using incognito
   //     args.push(' --incognito')
   //     console.log(args)
   //   }
 
   //   return args
   // })
}

const readXlsx = require('./read-xlsx');
const {downloadFile} = require('cypress-downloadfile/lib/addPlugin');
const xlsx = require('node-xlsx').default;
const fs = require('fs'); // for file
const path = require('path'); // for file path
const unzipping = require('./unzipping');
const dirTree = require('directory-tree');
const deleteKey = require('key-del');
var sortobject = require('deep-sort-object');

module.exports = (on, config) => {
  on('task', { parsexlsx({ filePath})
  { return new Promise ((resolve, reject) =>
    { try
      {
        const jsonData = xlsx.parse(fs.readFileSync(filePath));
        resolve(jsonData); 
      } catch (e)
      {
        reject(e);
      } });
    }
  });

  on('task', {
    log: (msg) => {
      console.log(msg)
      return true
    },
    perfLog: ({ test, diff, msg }) => {
      console.log({
        test,
        diff,
        msg,
        type: 'PERF_LOG'
      })
      return true
    }
  });

  on('task', {downloadFile});

  on('task', {
    'readXlsx': readXlsx.read
  });

  on('task', {
    'unzipping': unzipping.unzip,
  });

  on('task', {
    convetFolderSrtuctureToJson(folderPath) {
      const tree = dirTree(folderPath, {attributes: ['type']});
      const data = deleteKey(tree, ['size', 'extension', 'path']);
      return sortobject(data);
    }
  })
}
