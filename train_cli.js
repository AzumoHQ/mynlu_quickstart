const trainer = require('./train');
require('dotenv').config();

function train() {
  trainer('./model/demo_rasa.json').then((response)=> {
    console.log(`Train complete: ${JSON.stringify(response)}`);
  }).catch((reason) => {
    console.error(`Train failed: ${JSON.stringify(reason)}`);
  });
}

train();