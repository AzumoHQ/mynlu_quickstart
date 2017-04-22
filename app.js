/**
 * Created by Alvaro & JP Lorandi on 4/21/17.
 */

// add request module to communicate with the HEROKU Add-on service myNLU-RASA
const request = require('request');

const server_port = process.env.SERVER_PORT || 8080;

const http = require('http');
const fs = require('fs');
const formidable = require("formidable");
const util = require('util');

const server = http.createServer(function (req, res) {
  if (req.method.toLowerCase() == 'get') {
    displayForm(res);
  } else if (req.method.toLowerCase() == 'post') {
    processAllFieldsOfTheForm(req, res);
  }

});

function displayForm(res) {
  fs.readFile('form.html', function (err, data) {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': data.length
    });
    res.write(data);
    res.end();
  });
}

function processAllFieldsOfTheForm(req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    res.writeHead(200, {
      'content-type': 'text/plain'
    });
    res.write('received the data:\n\n');
    res.write(`Sentence: ${fields.sentence}`);
    parseSentence(fields.sentence, function(response) {
      res.end(util.inspect(response));
    });
  });
}

server.listen(server_port);
console.log(`server listening on ${server_port}`);

const MYNLU_RASA_URL = process.env.MYNLU_RASA_URL;
const MYNLU_RASA_TOKEN = process.env.MYNLU_RASA_TOKEN;

/**
 * This function will parse the sentence returning the result
 * @param sentence the sentence to parse
 * @param callback the call back to pass the response from the service
 * @returns {*}
 */
function parseSentence(sentence, callback) {
  // remember to use your own configuration for MYNLU_RASA_URL and MYNLU_RASA_TOKEN
  const url = `${MYNLU_RASA_URL}/parse?token=${MYNLU_RASA_TOKEN}`;
  return request.post({
    url: url,
    json: {
      q: sentence // this is passed as the body of the POST { "q" : "the sentence to parse" }
    }
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      // if there is no error and statusCode is 200 every goes fine so call the callback
      callback(body);
    } else {
      // some error has happened so show data to debug.
      callback({error: error, status: response.statusCode, body: body});
    }
  })

}
