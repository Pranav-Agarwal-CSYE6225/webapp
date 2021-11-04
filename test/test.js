const mocha = require('mocha');
const chai = require('chai');
const { expect } = require('chai');
var assert = chai.assert; 

describe('Test Login', () => {
    let email = 'a@gmail.com';
    let password = 'abcd';
    it('User authorized', () => {
        expect(email).to.equal('a@gmail.com');
        expect(password).to.equal('abcd');
    } )
})

describe('Test email validation', () => {
    describe('', () => {
       
        it('Validated', () => {
            let password = "S8uD@9Tes"
            let valid=true;
            if (!/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/.test(password)) {
                valid=false;
            }
            assert.isTrue(valid);
        });
    });
});