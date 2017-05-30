/* eslint-env browser */

import $ from 'jquery';

import controllers from './controllers';

// import images so webpack will include them
import './assets/images/logo-white.svg';


$(() => {
  $('.ui.checkbox').checkbox();

  const ctrlName = $('body').data('controller');
  if (ctrlName && ctrlName in controllers) {
    console.log(`Registering controller: ${ctrlName}`);  // eslint-disable-line no-console
    const ctrlToUse = controllers[ctrlName];
    ctrlToUse.init();
  }
});
