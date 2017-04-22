const trainer = require('./train');
require('dotenv').config();

function train() {
  trainer('./model/demo_rasa.json').then((response)=> {
    console.log(`Train complete: ${response}`);
  }).catch((reason) => {
    console.error(`Train failed: ${reason}`);
  });
}

train();