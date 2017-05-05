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
          if (req.files.trainFile.size) {
            console.log("trainFile");
            console.log(req.files.trainFile);
            const response = yield trainFile(req.files.trainFile.path);
            renderData = {trainResult: response, json_text: response.json_text};
          } else if (req.fields.json_text) {
            console.log("json_text");
            console.log(req.fields.json_text);
            const response = yield trainStr(req.fields.json_text);
            renderData = {trainResult: response, json_text: response.json_text};
          } else {
            renderData = {trainResult: "Nothing to parse"};
          }
          break;
        case "parse":
          if (req.fields.sentence) {
            try {
              const response = yield parseSentence(req.fields.sentence);
              renderData = {parseResult: JSON.stringify(response, null, 2)};
            } catch (err) {
              console.log('parse error: ', err);
              renderData = {parseError: `ERROR ${err.statusCode}: ${err.body}`}
            }
          }
          break;
        case "status":
          const response = yield getStatus();
          console.log("response:", response);
          console.log(typeof response);
          renderData = {status: JSON.stringify(response), showStatus: true};
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
  return new Promise( (resolve, reject) => {
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
        reject({error: error, statusCode: response.statusCode, body: body});
      }
    })
  });

}

function trainFile(path) {
  return Promise.coroutine(function *() {
    const strData = yield new Promise( (resolve, reject)=> {
      fs.readFile(path, function (err, strBuffer) {
        if (err) {
          reject(err);
        } else {
          resolve(strBuffer)
        }
      })
    });
    const json_text = strData.toString();
    const result = yield train(json_text);
    result.json_text = json_text;
    return result;
  })();
}

function trainStr(json_text) {
  return Promise.coroutine(function *() {
    const result = yield train(json_text);
    result.json_text = json_text;
    return result;
  })();
}

function train(strData) {


  const jsonData = JSON.parse(strData);
  const url = `${MYNLU_RASA_URL}/train?token=${MYNLU_RASA_TOKEN}`;

  return new Promise(function (resolve, reject){
    request.post({
      uri: url,
      json: jsonData,
      method: "POST"
    }, (err, response, body) => {
      console.log("train response");
      console.log(response.statusCode);
      if (!err && response && response.statusCode == 200) {
        resolve(body);
      } else {
        reject({err, response, body});
      }
    })
  })
}


function getStatus() {
  return new Promise((resolve, reject) => {
    const url = `${MYNLU_RASA_URL}/status?token=${MYNLU_RASA_TOKEN}`;
    request.get({url}, function (error, response, body) {
      console.log("status response");
      console.log(response.statusCode);
      if (!error && response && response.statusCode == 200) {
        resolve(JSON.parse(body));
      } else {
        reject({error, response, body});
      }
    });
  });
}
