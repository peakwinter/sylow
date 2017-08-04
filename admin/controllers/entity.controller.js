/* eslint-env browser */

import $ from 'jquery';
import moment from 'moment';
import FileSaver from 'file-saver';

import Controller from './index';
import * as scrypt from '../helpers/scrypt.helper';


export default class extends Controller {
  init() {
    let formSubmit;
    let formValidate;

    if ($('#register-form').length) {
      this.form = $('#register-form');
      formSubmit = (event) => {
        if (!this.form.find('#passwordHash').val() && this.form.form('is valid')) {
          return this.generateSaltAndScrypt(event);
        }
        return undefined;
      };
      formValidate = {
        fields: {
          username: 'empty',
          password: 'empty',
          confirm: 'match[password]'
        }
      };
    } else {
      this.form = $('#update-form');
      formSubmit = (event) => {
        if (this.form.find('#password').val() && !this.form.find('#passwordHash').val() &&
            this.form.form('is valid')) {
          return this.generateSaltAndScrypt(event);
        }
        return undefined;
      };
      formValidate = {
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
      };
    }

    const createdText = new Date($('#creation-date').text());
    const created = moment(createdText).format('lll');
    $('#creation-date').text(`Created the ${created}`);

    this.form.submit(formSubmit);
    this.form.form(formValidate);
  }

  generateSaltAndScrypt(event) {
    if (event) {
      event.preventDefault();
    }

    this.form.find('button[type="submit"]').addClass('disabled loading');
    const password = this.form.find('#password').val();
    const passwordSalt = scrypt.generateSalt();

    scrypt.scrypt(password, passwordSalt, (key) => {
      this.form.find('#passwordHash').val(key);
      this.form.find('#passwordSalt').val(passwordSalt);
      this.form.trigger('submit');
    });
  }

  showDeleteModal(event, entityId) {
    this.entityToDelete = entityId;
    this.app.showModal(event, 'delete-entity-modal');
  }

  showRevokeModal(event, tokenId) {
    this.tokenToRevoke = tokenId;
    this.app.showModal(event, 'revoke-token-modal');
  }

  deleteEntity() {
    $.ajax({
      url: `/entities/${this.entityToDelete}`,
      method: 'DELETE'
    }).done(() => { window.location = '/entities'; });
  }

  revokeToken() {
    $.ajax({
      url: `/tokens/${this.tokenToRevoke}`,
      method: 'DELETE'
    }).done(() => { window.location = window.location; });
  }

  exportEntity(event, entityId) {
    $.ajax({
      url: `/entities/${entityId}/export`,
      method: 'GET'
    }).done((datas) => {
      const blob = new Blob([JSON.stringify(datas, null, 2)], { type: 'application/json; charset=utf-8' });
      FileSaver.saveAs(blob, `${datas.domain}.json`);
    });
  }
}
