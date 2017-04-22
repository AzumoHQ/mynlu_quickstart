/**
 * Created by Alvaro & JP Lorandi on 4/21/17.
 */

// add request module to communicate with the HEROKU Add-on service myNLU-RASA
const request = require('request');

// get the param of the app as the sentence to parse
const sentence = process.argv[2];

/**
 *
 * IMPORTANT
 * =========
 * Remember to set MYNLU_RASA_URL and MYNLU_RASA_TOKE with the values obtained from HEROKU
 */
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
  var url = `${MYNLU_RASA_URL}/parse?token=${MYNLU_RASA_TOKEN}`;
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
      console.log('error', error);
      console.log('response.statusCode', response.statusCode);
      console.log('body', body);
    }
  })

}

// Call the parse funciton with the sentence to parse, the second param defines de callback function
parseSentence(sentence, function (result) {
  console.log("Response received:");
  console.log(result); // the result received is a JSON object
});
