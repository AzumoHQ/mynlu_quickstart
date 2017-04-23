/**
 * Created by Alvaro & JP Lorandi on 4/21/17.
 */

// add request module to communicate with the HEROKU Add-on service myNLU-RASA
const request = require('request');

if (!process.env.PORT) {
  require('dotenv').config();
}

const server_port = process.env.PORT || 8080;
const MYNLU_RASA_URL = process.env.MYNLU_RASA_URL;
const MYNLU_RASA_TOKEN = process.env.MYNLU_RASA_TOKEN;

const http = require('http');
const fs = require('fs');
const formidable = require("express-formidable");
const util = require('util');
const app = require('express')();
const mustacheExpress = require('mustache-express');
const Promise = require('bluebird');


app.use(formidable());
// Register '.mustache' extension with The Mustache Express
app.engine('html', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get("/", function (req, res) {
  console.log("get");
  res.render('form.html');
});

app.post("/", function(req, res){
  return Promise.coroutine(function *() {
    if (req.files.trainFile) {
      const response = yield trainFile(req.files.trainFile.path);
      res.render('form.html', {parsingResult: response});
    } else if (req.fields.sentence) {
      const response = yield parseSentence(req.fields.sentence);
      res.render('form.html', {parsingResult: JSON.stringify(response, null, 2)});
    } else {
      res.render('form.html');
    }
  })();
});

//server.listen(server_port);
app.listen(server_port);
console.log(`server listening on ${server_port}`);



/**
 * This function will parse the sentence returning the result
 * @param sentence the sentence to parse
 * @param callback the call back to pass the response from the service
 * @returns {*}
 */
function parseSentence(sentence) {
  return new Promise(function(resolve, reject){
    const url = `${MYNLU_RASA_URL}/parse?token=${MYNLU_RASA_TOKEN}`;
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

function trainFile(path) {
  return new Promise(function(resolve, reject) {
    const formData = {
      body: fs.createReadStream(path)
    };
    const url = `${MYNLU_RASA_URL}/train?token=${MYNLU_RASA_TOKEN}`;

    request.post({url, formData}, (err, httpResponse, body) => {
      if (!err && httpResponse.statusCode == 200) {
        resolve(body);
      } else {
        reject ({err, httpResponse, body});
      }
    })
  });
}
