/* eslint-env browser */

import $ from 'jquery';

import Controller from './index';
import * as scrypt from '../helpers/scrypt.helper';


export default class EntityController extends Controller {
  init() {
    this.form = $('#password-form');
    this.form.submit(event => this.register(event));
    this.form.form({
      fields: {
        username: 'empty',
        password: 'match[confirm]',
        confirm: 'empty'
      }
    });
  }

  register(event) {
    if (!this.form.find('#passwordHash').val() && this.form.form('is valid')) {
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
  }

  showDeleteModal(event, entityId) {
    this.entityToDelete = entityId;
    this.app.showModal(event, 'delete-entity-modal');
  }

  deleteEntity() {
    $.ajax({
      url: `/entities/${this.entityToDelete}`,
      method: 'DELETE'
    })
      .done(() => {
        window.location = '/entities';
      });
  }
}
