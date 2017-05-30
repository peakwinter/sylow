/* eslint-env browser */

import $ from 'jquery';
import * as scrypt from '../helpers/scrypt.helper';

export default {
  init() {
    const form = $('#password-form');
    form.submit(event => this.register(form, event));
    form.form({
      fields: {
        username: 'empty',
        password: 'match[confirm]',
        confirm: 'empty'
      }
    });
  },

  register(form, event) {
    if (!form.find('#passwordHash').val() && form.form('is valid')) {
      if (event) {
        event.preventDefault();
      }

      form.find('button[type="submit"]').addClass('disabled loading');
      const password = form.find('#password').val();
      const passwordSalt = scrypt.generateSalt();

      scrypt.scrypt(password, passwordSalt, (key) => {
        form.find('#passwordHash').val(key);
        form.find('#passwordSalt').val(passwordSalt);
        form.trigger('submit');
      });
    }
  }
};
