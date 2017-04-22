const Promise = require('bluebird');
const request = require('request');
const fs = require('fs');

function train(modelFile) {
  const payload = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
  const MYNLU_RASA_URL = process.env.MYNLU_RASA_URL;
  const MYNLU_RASA_TOKEN = process.env.MYNLU_RASA_TOKEN;
  return new Promise((resolve, reject) => {
    var url = `${MYNLU_RASA_URL}/train?token=${MYNLU_RASA_TOKEN}`;
    return request.post({
      url: url,
      json: payload
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        // if there is no error and statusCode is 200 every goes fine so call the callback
        resolve(body);
      } else {
        // some error has happened so show data to debug.

        reject({error: error, statusCode: response.statusCode, body: body});
      }
    });

  });
}


module.exports = exports = train;

