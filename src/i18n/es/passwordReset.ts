import type { passwordReset as pt } from '../pt/passwordReset';

export const passwordReset: typeof pt = {
  title: 'Recuperar contraseña',
  forgotLink: '¿Olvidó la contraseña?',
  emailIntro: 'Escriba el correo de su cuenta. Le enviaremos un código de 6 dígitos para crear una contraseña nueva.',
  sendCode: 'Enviar código',
  sending: 'Enviando...',
  codeSent: (email: string) => `Si existe una cuenta con ${email}, le hemos enviado un código. Mire también la carpeta de spam.`,
  code: 'Código',
  codePlaceholder: '000000',
  codeFormat: 'El código tiene 6 dígitos.',
  newPassword: 'Contraseña nueva',
  changePassword: 'Cambiar contraseña',
  changing: 'Cambiando...',
  resendCode: 'Reenviar código',
  changeEmail: 'Usar otro correo',
  errorTitle: 'Error al recuperar la contraseña',
  invalidCode: 'Código incorrecto o caducado. Pida un código nuevo.',
};
