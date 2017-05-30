/* eslint-env browser */

import $ from 'jquery';
import * as scrypt from '../helpers/scrypt.helper';

export default {
  init() {
    const form = $('#password-form');
    form.submit(event => this.login(form, event));
  },

  login(form, event) {
    if (!form.find('#passwordHash').val()) {
      if (event) {
        event.preventDefault();
      }
      form.find('button[type="submit"]').addClass('disabled loading');
      const username = form.find('#username').val();
      const password = form.find('#password').val();
      $.ajax({ url: `/api/auth/salt?username=${username}`, dataType: 'json' })
        .done((data) => {
          scrypt.scrypt(password, data.salt, (key) => {
            form.find('#passwordHash').val(key);
            form.trigger('submit');
          });
        });
    }
  }
};
