import test from 'node:test';
import assert from 'node:assert/strict';
import { digitsOnly, isValidCnpj, isValidCpf } from '../src/utils/customerValidation.js';

test('normalizes CPF and CNPJ to digits only', () => {
  assert.equal(digitsOnly('529.982.247-25'), '52998224725');
  assert.equal(digitsOnly('11.222.333/0001-81'), '11222333000181');
});

test('validates CPF check digits and rejects repeated digits', () => {
  assert.equal(isValidCpf('529.982.247-25'), true);
  assert.equal(isValidCpf('529.982.247-24'), false);
  assert.equal(isValidCpf('111.111.111-11'), false);
});

test('validates CNPJ check digits and rejects repeated digits', () => {
  assert.equal(isValidCnpj('11.222.333/0001-81'), true);
  assert.equal(isValidCnpj('11.222.333/0001-80'), false);
  assert.equal(isValidCnpj('11.111.111/1111-11'), false);
});
