/// <reference types="node" />
// Testes da validação do formulário "Criar conta" (features/auth/registration).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registrationPayload, validateRegistration } from '../src/features/auth/registration';

const ok = { name: 'Alexandre', email: 'a@b.pt', password: 'segredo1', confirmPassword: 'segredo1' };

test('Formulário válido → sem erro', () => {
  assert.equal(validateRegistration(ok), null);
});

test('Campos vazios', () => {
  assert.equal(validateRegistration({ ...ok, name: '  ' }), 'Todos os campos devem ser preenchidos.');
  assert.equal(validateRegistration({ ...ok, confirmPassword: '' }), 'Todos os campos devem ser preenchidos.');
});

test('E-mail inválido', () => {
  assert.equal(validateRegistration({ ...ok, email: 'abc' }), 'O e-mail não é válido.');
  assert.equal(validateRegistration({ ...ok, email: 'a@b' }), 'O e-mail não é válido.');
});

test('Senha curta e senhas diferentes', () => {
  assert.equal(validateRegistration({ ...ok, password: '12345', confirmPassword: '12345' }), 'A senha tem de ter pelo menos 6 caracteres.');
  assert.equal(validateRegistration({ ...ok, confirmPassword: 'outra123' }), 'As senhas não coincidem.');
});

test('Payload: tira espaços das pontas e mantém maiúsculas do e-mail', () => {
  assert.deepEqual(registrationPayload({ ...ok, name: ' Ana ', email: ' Ana@X.pt ' }), { name: 'Ana', email: 'Ana@X.pt', password: 'segredo1' });
});
