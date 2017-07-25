/* eslint-env browser */

import $ from 'jquery';
import FileSaver from 'file-saver';

import Controller from './index';

export default class extends Controller {
  init() {
  } 

  showDeleteModal(event, serverId) {
    this.serverToDelete = serverId;
    this.app.showModal(event, 'delete-server-modal');
  }

  deleteServer() {
    $.ajax({
      url: `/servers/${this.serverToDelete}`,
      method: 'DELETE'
    }).done(() => { window.location = '/servers'; });
  }

  exportServer(event, serverId) {
    $.ajax({
      url: `/servers/${serverId}/export`,
      method: 'GET'
    }).done((datas) => {
      let name = datas.name || datas.domain;
      name = name.concat('.json');
      let blob = new Blob([JSON.stringify(datas, null, 2)], {type: "application/json; charset=utf-8"});
      FileSaver.saveAs(blob, name);
      window.location = `/servers/${serverId}`;
    });
  }
} 
