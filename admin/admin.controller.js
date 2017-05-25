import httpStatus from 'http-status';
import APIError from '../server/helpers/APIError';
import config from '../config/config';
import Document from '../server/models/document.model';

//const axios = require('axios');

function init(req, res, next){
/*
  Document
    .find()
    .distinct('contentType')
    .then((contentTypes) => {
       let l = {};
       for(let i =0; i<contentTypes.length; i++) {
         let ct = contentTypes[i]
         Document
           .find({contentType: ct})
           .count()
           .then((count) => {
             l[ct] = count;
           })
           .catch(e => next(e));
       }
      res.render('index', {liste: l})
    })
    .catch(e => next(e));
*/
  Document.aggregate([
    {
      $group: {
        _id: '$contentType',
        nbr: {$sum: 1}
      }
    },
    (error, res) => {
      console.log(res)
    }
  ]);

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
