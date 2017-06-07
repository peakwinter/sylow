/* eslint-env browser */

import $ from 'jquery';

import Controller from './index';


export default class extends Controller {
  init() {
    this.form = $('#register-form');
    this.form.form({
      fields: {
        username: {
          identifier: 'username',
          rules: [{ type: 'empty' }]
        },
        password: {
          identifier: 'password',
          optional: true,
          rules: [{ type: 'empty' }]
        },
        confirm: {
          identifier: 'confirm',
          rules: [{ type: 'match[password]' }]
        }
      }
    });
  }

  showDeleteModal(event, clientId) {
    this.clientToDelete = clientId;
    this.app.showModal(event, 'delete-client-modal');
  }

  deleteClient() {
    $.ajax({
      url: `/clients/${this.clientToDelete}`,
      method: 'DELETE'
    }).done(() => { window.location = '/clients'; });
  }
}
