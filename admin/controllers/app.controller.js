/* eslint-env browser */

import $ from 'jquery';

export default {
  childCtrl: null,

  init() {
    $('.ui.checkbox').checkbox();
  },

  showModal(event, id, ...params) {
    $(`#${id}`).modal('show').find('.sy-modal-data').val(params.join('|'));
  },

  hideModal(event, id) {
    const modalId = id || $(event.currentTarget).closest('.ui.modal').attr('id');
    $(`#${modalId}`).modal('hide');
  },

  execAction(controller, action) {
    const actionToExec = this.getAction(controller, action);
    if (actionToExec) {
      actionToExec();
    }
  },

  getAction(controller, action) {
    if (controller && controller[action] && typeof controller[action] === 'function') {
      return controller[action];
    }
    return undefined;
  },

  listActions(controller) {
    if (controller) {
      return Object.keys(controller);
    }
    return [];
  },

  registerActions(controller) {
    const actions = this.listActions(controller);
    actions.forEach((action) => {
      if (action === 'init') {
        return;
      }

      const target = $(`[data-action='${action}']`);
      if (!target.length) {
        return;
      }

      let params = [];
      if (target.data('params')) {
        params = target.data('params').split('|');
      }

      target.on(
        target.data('actionOn') || 'click',
        event => this.getAction(controller, action)(event, ...params)
      );
    });
  },
};
