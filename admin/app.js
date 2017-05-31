/* eslint-env browser */

import $ from 'jquery';

import controllers from './controllers';

// import images so webpack will include them
import './assets/images/logo-white.svg';


$(() => {
  controllers.app.init();
  controllers.app.registerActions(controllers.app);

  const ctrlName = $('body').data('controller');
  if (ctrlName && ctrlName in controllers) {
    console.log(`Registering controller: ${ctrlName}`);  // eslint-disable-line no-console
    const ctrlToUse = controllers[ctrlName];
    ctrlToUse.app = controllers.app;
    ctrlToUse.init();
    controllers.app.registerActions(ctrlToUse);
  }
});
