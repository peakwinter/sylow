import httpStatus from 'http-status';
import APIError from '../server/helpers/APIError';
import config from '../config/config';

const request = require('request');


function init(req, res, next){
  res.render('index')
    .catch(e => next(e));
}

function postActions(req, res, next) {
  const username = req.body.username;
  const passwd = req.body.password;
  const formName = req.body.formname;

  if(formName == 'register-form') {
    requestRegister(username, passwd);
  } else if (formName == 'login-form') {
    requestLogin(username, passwd);
  }
}

function requestLogin(username, passwd) {
  const options = {
    url: 'http://localhost:4040/api/auth/salt',
    method: 'GET',
    json: true,
    qs: {'username': username}
  }
  console.log('login '+username+' '+passwd)
 /* request(options, (error, resp, body) => {
    if (!error && resp.statusCode == 200) {
      console.log(body.salt);
    } else {
      console.log(error);
    }
  });*/
}

function requestRegister(username, passwd) {
  console.log('register '+username+' '+passwd)
}



export default { postActions, init };
