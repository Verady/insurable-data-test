'use strict';
var rp = require('request-promise-native');

const prodUrl = process.argv[2];
const user = process.argv[3];
const password = process.argv[4];
const signup = process.argv[5];

if(!password){
  console.error('Invalid Params: \n  usage: node index.js <prodUrl> <userEmail> <password> (optional) <signup>');
  process.exit(1);
} else {
  console.log('Attempting to run tests agains: ' + prodUrl);
}

function createUser(){

  var options = {
    uri: prodUrl+'/signup',
    method: 'POST',
    json: {
      companyName: 'Test Company',
      email: user,
      password: password
    }
  };

  console.log('Creating new user at: ' + options.uri);

  return rp(options);
}

function login(){
  var options = {
    method: 'POST',
    url: prodUrl+'/login',
    headers: { 'content-type': 'application/json' },
    json: {
     email: user,
     password: password,
    }
  };
  return rp(options);
}

function createApplication(jwt){
  var options = {
    uri: prodUrl+'/api/application',
    method: 'POST',
    json: {
      name: 'Test App',
    },
    auth: {
      bearer: jwt
    }
  };

  return rp(options);
}

function sendHash(jwt, apiKey){
  var options = {
    uri: prodUrl+'/api/secure/hash',
    method: 'POST',
    json: {
      hash: '532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25', //Valid sha256 hash
      tags: {
        'location': 'LOC1',
        'anomaly': 'false',
        'region': 'US'
      }
    },
    auth: {
      bearer: jwt
    },
    headers: {
      'veradyKey': apiKey
    }
  };

  return rp(options);
}
//
// let jwt;
// let apiKey;
if(signup){
  createUser().then((resolve) => {
    console.log('\n\n- User created successfully\n');
    console.log(resolve);
    console.log('\n\n');
    login().then((resolve) => {
      console.log('\n\n- Logged-In successfully\n');
      console.log(resolve);
      let id_token = resolve.id_token;
      createApplication(id_token).then((resolve) => {
        console.log('\n\n- Application created\n');
        console.log(resolve);
        sendHash(id_token, resolve.apiKey).then((resolve)=>{
          console.log('\n\n - Hash sent successfully\n');
          console.log(resolve);
        }).catch((err)=>{
          console.error('\n\nERROR\n\n');
          console.error(err);
        });
      }).catch((err)=>{
        console.error('\n\nERROR\n\n');
        console.error(err);
      });
    }).catch((err)=>{
      console.error('\n\nERROR\n\n');
      console.error(err);
    });
  }).catch((err)=>{
    console.error('\n\nERROR\n\n');
    console.error(err);
  });
} else {
  login().then((resolve) => {
    console.log('\n\n- Logged-In successfully\n');
    console.log(resolve);
    let id_token = resolve.id_token;
    createApplication(id_token).then((resolve) => {
      console.log('\n\n- Application created\n');
      console.log(resolve);
      sendHash(id_token, resolve.apiKey).then((resolve)=>{
        console.log('\n\n - Hash sent successfully\n');
        console.log(resolve);
      }).catch((err)=>{
        console.error('\n\nERROR\n\n');
        console.error(err);
      });
    }).catch((err) =>{
      console.error('\n\nERROR\n\n');
      console.error(err);
    });
  }).catch((err)=>{
    console.error('\n\nERROR\n\n');
    console.error(err);
  });
}
