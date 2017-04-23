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

function getStatus() {
  return new Promise((resolve, reject) => {
    const url = `${MYNLU_RASA_URL}/status?token=${MYNLU_RASA_TOKEN}`;
    request.get({url}, function (error, response, body) {
      console.log("status response");
      console.log(response.statusCode);
      if (!error && response.statusCode == 200) {
        console.log(body);
        resolve(body);
      } else {
        reject({error, response, body});
      }
    });
  });
}

app.post("/", function (req, res) {
  return Promise.coroutine(function *() {
    if (req.fields.action) {
      let renderData = null;
      switch (req.fields.action) {
        case "train":
          if (req.files.trainFile) {
            const response = yield trainFile(req.files.trainFile.path);
            renderData = {trainResult: response};
          }
          break;
        case "parse":
          if (req.fields.sentence) {
            const response = yield parseSentence(req.fields.sentence);
            renderData = {parseResult: JSON.stringify(response, null, 2)};
          }
          break;
        case "status":
          const response = yield getStatus();
          console.log("response:", response);
          renderData = {statusResult: response};
          break;
      }
      console.log("render data: ", renderData);
      res.render('form.html', renderData);
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
  return new Promise(function (resolve, reject) {
    const url = `${MYNLU_RASA_URL}/parse?token=${MYNLU_RASA_TOKEN}`;
    request.post({
      url: url,
      json: {
        q: sentence // this is passed as the body of the POST { "q" : "the sentence to parse" }
      }
    }, function (error, response, body) {
      console.log("parse response");
      console.log(response.statusCode);
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
  return new Promise(function (resolve, reject) {
    const formData = {
      body: fs.createReadStream(path)
    };
    const url = `${MYNLU_RASA_URL}/train?token=${MYNLU_RASA_TOKEN}`;

    request.post({url, formData}, (err, httpResponse, body) => {
      console.log("train response");
      console.log(httpResponse.statusCode);
      if (!err && httpResponse.statusCode == 200) {
        resolve(body);
      } else {
        reject({err, httpResponse, body});
      }
    })
  });
}
