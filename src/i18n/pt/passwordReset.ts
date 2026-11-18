/** "Esqueceu a senha" (código de 6 dígitos por email). */
export const passwordReset = {
  title: 'Recuperar senha',
  forgotLink: 'Esqueceu a senha?',
  emailIntro: 'Escreva o e-mail da sua conta. Vamos enviar um código de 6 dígitos para criar uma nova senha.',
  sendCode: 'Enviar código',
  sending: 'A enviar...',
  codeSent: (email: string) => `Se existir uma conta com ${email}, enviámos um código. Veja também a pasta de spam.`,
  code: 'Código',
  codePlaceholder: '000000',
  codeFormat: 'O código tem 6 dígitos.',
  newPassword: 'Nova senha',
  changePassword: 'Mudar senha',
  changing: 'A mudar...',
  resendCode: 'Reenviar código',
  changeEmail: 'Usar outro e-mail',
  errorTitle: 'Erro ao recuperar a senha',
  invalidCode: 'Código errado ou expirado. Peça um novo código.',
};
