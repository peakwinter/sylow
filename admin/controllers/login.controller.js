/* eslint-env browser */

import $ from 'jquery';

import Controller from './index';
import * as scrypt from '../helpers/scrypt.helper';

export default class LoginController extends Controller {
  init() {
    this.form = $('#password-form');
    this.form.submit(event => this.login(event));
  }

  login(event) {
    if (!this.form.find('#passwordHash').val()) {
      if (event) {
        event.preventDefault();
      }
      this.form.find('button[type="submit"]').addClass('disabled loading');
      const username = this.form.find('#username').val();
      const password = this.form.find('#password').val();
      $.ajax({ url: `/api/auth/salt?username=${username}`, dataType: 'json' })
        .done((data) => {
          scrypt.scrypt(password, data.salt, (key) => {
            this.form.find('#passwordHash').val(key);
            this.form.trigger('submit');
          });
        });
    }
  }
}
