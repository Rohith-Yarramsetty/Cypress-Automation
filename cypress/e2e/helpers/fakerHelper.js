/// <reference types="cypress" />

const faker = require('faker');

export class FakerHelpers {
  generateEmail(firstName = faker.name.firstName(), lastName = faker.name.lastName()) {
    const email = firstName+'.'+lastName+'@'+Cypress.env("domain")+'.com';
    return email.toLowerCase();
  }

  generateProductName() {
    return faker.commerce.productName() + faker.random.number({min:1000, max:99999})
  }

  generateMailosaurEmail(firstName = faker.name.firstName(), lastName = faker.name.lastName()) {
    const email = `${firstName}.${lastName}_cy_test${faker.random.number({min:1000, max:9999})}@${Cypress.env("serverId")}.mailosaur.net`
    return email.toLowerCase();
  }

  generateEcoName() {
    const ecoName = 'eco' + faker.random.number({min:1000, max:99999})
    return ecoName.toString();
  }

  getRandomStringOfCharacters(string_length) {
    let random_string = '';
    let random_ascii;
    for(let i = 0; i < string_length; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii)
    }
    return random_string
  }

  generateRandomMassValue() {
    return faker.datatype.number({max: 30, precision: 1});
  }

  generateComponentName() {
    return this.generateProductName();
  }
}
