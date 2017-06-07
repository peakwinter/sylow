/* eslint-env browser */

import $ from 'jquery';

export default class AppController {
  constructor() {
    $('.ui.checkbox').checkbox();
    $('.ui.dropdown').dropdown();
  }

  listActions(controller = this) {
    const ctrlProto = Object.getPrototypeOf(controller);
    return Object.getOwnPropertyNames(ctrlProto);
  }

  registerActions(controller = this) {
    const actions = this.listActions(controller);
    const targets = $('[data-action]');
    targets.each((idx, ele) => {
      const target = $(ele);
      const action = target.data('action');
      if (!actions.includes(action)) {
        return;
      }

      let params = [];
      if (target.data('params')) {
        params = target.data('params').split('|');
      }

      target.on(
        target.data('actionOn') || 'click',
        event => controller[action](event, ...params)
      );
    });
  }

  showModal(event, id) {
    $(`#${id}`).modal('show');
  }

  hideModal(event, id) {
    const modalId = id || $(event.currentTarget).closest('.ui.modal').attr('id');
    $(`#${modalId}`).modal('hide');
  }
}
