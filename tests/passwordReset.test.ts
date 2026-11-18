/// <reference types="node" />
// Testes da validação do "Esqueceu a senha" (features/auth/passwordReset).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateNewPassword, validateResetEmail } from '../src/features/auth/passwordReset';

test('Passo 1: email vazio ou inválido', () => {
  assert.equal(validateResetEmail('  '), 'Todos os campos devem ser preenchidos.');
  assert.equal(validateResetEmail('abc'), 'O e-mail não é válido.');
  assert.equal(validateResetEmail(' ana@x.pt '), null);
});

test('Passo 2: código de 6 dígitos, senha mínima e confirmação', () => {
  const ok = { code: '123456', password: 'nova123', confirmPassword: 'nova123' };
  assert.equal(validateNewPassword(ok), null);
  assert.equal(validateNewPassword({ ...ok, code: '' }), 'Todos os campos devem ser preenchidos.');
  assert.equal(validateNewPassword({ ...ok, code: '12345' }), 'O código tem 6 dígitos.');
  assert.equal(validateNewPassword({ ...ok, code: '12a456' }), 'O código tem 6 dígitos.');
  assert.equal(validateNewPassword({ ...ok, password: '123', confirmPassword: '123' }), 'A senha tem de ter pelo menos 6 caracteres.');
  assert.equal(validateNewPassword({ ...ok, confirmPassword: 'outra12' }), 'As senhas não coincidem.');
});
