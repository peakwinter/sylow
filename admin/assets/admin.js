import $ from 'jquery';
import scrypt from 'scrypt-async';

import './images/logo-white.svg';

$(() => {
  const loginForm = $('#login-form');

  loginForm.submit((event) => {
    if (!loginForm.find('#passwordHash').val()) {
      event.preventDefault();
      loginForm.find('#submit').addClass('disabled loading');
      const username = loginForm.find('#username').val();
      const password = loginForm.find('#password').val();
      const options = {
        N: 16384, r: 8, dkLen: 64, encoding: 'hex'
      };
      $.getJSON(`/api/auth/salt?username=${username}`, (data) => {
        const salt = new Buffer(data.salt);
        scrypt(password, salt, options, (key) => {
          loginForm.find('#passwordHash').val(key);
          loginForm.trigger('submit');
        });
      });
    }
  });
});
