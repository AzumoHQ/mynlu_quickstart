/**
 * Created by Alvaro & JP Lorandi on 4/21/17.
 */

// add request module to communicate with the HEROKU Add-on service myNLU-RASA
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const templates = require('express-handlebars');
Promise = require('bluebird');


if (!process.env.PORT) {
  require('dotenv').config();
}

const server_port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.engine('handlebars', templates({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// const http = require('http');
const fs = require('fs');
// const formidable = require("formidable");
const util = require('util');

const MYNLU_RASA_URL = process.env.MYNLU_RASA_URL;
const MYNLU_RASA_TOKEN = process.env.MYNLU_RASA_TOKEN;


// const server = http.createServer(function (req, res) {
//   if (req.method.toLowerCase() == 'get') {
//     displayForm(res);
//   } else if (req.method.toLowerCase() == 'post') {
//     processAllFieldsOfTheForm(req, res);
//   }
//
// });


function displayForm(req, res) {
  res.render('home', {});
}

function processAllFieldsOfTheForm(req, res) {
  // console.log('res: ', req);
  // console.log('res.body: ', req.body);
  parseSentence(req.body.sentence).then((value) => {
    res.render('home', {value: JSON.stringify(value)});
  }).catch((error) => {
    res.render('home', {error: JSON.stringify(error)});
  });


}

app.get('/', displayForm);
app.post('/', processAllFieldsOfTheForm);

app.listen(server_port);
console.log(`server listening on ${server_port}`);

/**
 * This function will parse the sentence returning the result
 * @param sentence the sentence to parse
 * @param callback the call back to pass the response from the service
 * @returns {*}
 */
function parseSentence(sentence) {
  // remember to use your own configuration for MYNLU_RASA_URL and MYNLU_RASA_TOKEN
  const url = `${MYNLU_RASA_URL}/parse?token=${MYNLU_RASA_TOKEN}`;
  return new Promise((resolve, reject) => {
    request.post({
      url: url,
      json: {
        q: sentence // this is passed as the body of the POST { "q" : "the sentence to parse" }
      }
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        // if there is no error and statusCode is 200 every goes fine so call the callback
        resolve(body);
      } else {
        // some error has happened so show data to debug.
        reject({error: error, status: response.statusCode, body: body});
      }
    })
  });

}
