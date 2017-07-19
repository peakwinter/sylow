/* eslint-env browser */

import $ from 'jquery';
import FileSaver from 'file-saver';

import Controller from './index';

export default class extends Controller {
  init() {
  } 

  exportServer(event) {
    const serverDatas = document.getElementById('exportButton').dataset;
    const obj = {
      name: serverDatas.name,
      domain: serverDatas.domain,
      description: serverDatas.description,
      keypair: {
        public: serverDatas.pubkey,
        private: serverDatas.privkey
      },
      authoritative: true
    };

    let blob = new Blob([JSON.stringify(obj, null, 2)], {type: "application/json; charset=utf-8"});
    FileSaver.saveAs(blob, 'blap.json');
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
} 
