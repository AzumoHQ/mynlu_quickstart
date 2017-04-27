/**
 * Created by Alvaro & JP Lorandi on 4/21/17.
 */

// add request module to communicate with the HEROKU Add-on service myNLU-RASA
const request = require('request');
const fs = require('fs');

if (!process.env.PORT) {
  require('dotenv').config();
}

const server_port = process.env.PORT || 8080;
const MYNLU_RASA_URL = process.env.MYNLU_RASA_URL;
const MYNLU_RASA_TOKEN = process.env.MYNLU_RASA_TOKEN;

const Promise = require('bluebird');
const formidable = require("express-formidable");

const app = require('express')();
const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(formidable());
// Register '.mustache' extension with The Mustache Express

app.get("/", function (req, res) {
  console.log("get");
  res.render('form');
});


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
          console.log(typeof response);
          renderData = {trainingProcesses: response.trainings_under_this_process, showStatus: true};
          break;
      }
      console.log("render data: ", renderData);
      res.render('form', renderData);
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
      if (!error && response.statusCode && response.statusCode == 200) {
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
  const payload = JSON.parse(fs.readFileSync(path, 'utf8'));
  return new Promise(function (resolve, reject) {
    const url = `${MYNLU_RASA_URL}/train?token=${MYNLU_RASA_TOKEN}`;
    request.post({
        url: url,
        json: payload
    }, (err, httpResponse, body) => {
      console.log("train response");
      // console.log(httpResponse.statusCode);
      if (!err && httpResponse && httpResponse.statusCode && httpResponse.statusCode == 200) {
        resolve(JSON.stringify(body));
      } else {
        reject({err, httpResponse, body});
      }
    })
  });
}


function getStatus() {
  return new Promise((resolve, reject) => {
    const url = `${MYNLU_RASA_URL}/status?token=${MYNLU_RASA_TOKEN}`;
    request.get({url}, function (error, response, body) {
      console.log("status response");
      console.log(response.statusCode);
      if (!error && response && response.statusCode && response.statusCode == 200) {
        resolve(JSON.parse(body));
      } else {
        reject({error, response, body});
      }
    });
  });
}
