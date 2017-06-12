/* eslint-env browser */

import $ from 'jquery';

import Controller from './index';


export default class SettingController extends Controller {
  init() {
    this.editBtn = $('#edit_settings_btn');
    this.saveBtn = $('#save_settings_btn');
    this.resetBtn = $('#reset_settings_btn');
    this.form = $('#edit_settings_form');

    this.initialState();
  }

  initialState() {
    $('.settings_updates').each(() => {
      $(this).hide();
    });

    this.saveBtn.hide();
    this.resetBtn.hide();
  }

  editAction() {
    this.editBtn.hide();
    this.saveBtn.show();
    this.resetBtn.show();
    $('.settings_updates').each(() => {
      $(this).show();
    });
    $('.alterable').each(() => {
      $(this).hide();
    });
  }

  resetAction() {
    this.editBtn.show();
    this.saveBtn.hide();
    this.resetBtn.hide();
    $('.settings_updates').each(() => {
      $(this).hide();
    });
    $('.alterable').each(() => {
      $(this).show();
    });
  }

  saveAction(event) {
    if (event) {
      event.preventDefault();
    }
    const datas = {};

    $('.settings_updates').each(() => {
      let key;
      if ($(this).hasClass('checkbox_radio')) {
        if ($(this).checkbox('is checked')) {
          const element = $(this).find('input');
          key = element.attr('name');
          datas[key] = element.val();
        }
      } else if ($(this).hasClass('checkbox_choice')) {
        let element = $(this).find('.checkbox');
        const elementInput = element.find('input');
        key = elementInput.attr('name');
        const values = [];
        if (element.checkbox('is checked')) {
          values.push(elementInput.val());
        }
        element = $(this).find('.new_value input');
        if (element.val() !== '') {
          values.push(element.val());
        }
        datas[key] = values;
      } else {
        key = $(this).attr('name');
        datas[key] = $(this).val();
      }
    });

    $.ajax({
      url: '/settings',
      method: 'POST',
      data: datas
    });
  }
}
