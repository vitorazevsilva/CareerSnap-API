const app = require('../../src/app');

  test('[MAIL][1] - Envia um Email por Template', async () => {
      let data = {
          First: 'Hello',
          xyz: 'Hello World',
          ABC: 'World',
      }
      const info = await app.services.mailer.sendEmailUsingTemplate('vsdev.mailer@gmail.com', 'Email de Teste', 'test', data);
      expect(info.messageId).toBeDefined();
    });

    test('[MAIL][2] - Envia um Email por Plain Text', async () => {
      let html = '<!DOCTYPE html><html><head><title>Email de Teste</title></head><body><h1>Email de Teste (Plain Text)</h1><p>Este é um email de teste enviado através da sua aplicação.</p><p>Por favor, não responda a este email.</p></body></html>';
      const info = await app.services.mailer.sendPlainEmail('vsdev.mailer@gmail.com', 'Email de Teste', html);
      expect(info.messageId).toBeDefined();
    });
