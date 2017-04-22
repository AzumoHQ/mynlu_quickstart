const trainer = require('./train');
require('dotenv').config();

function train() {
  trainer('./model/demo_rasa.json');
}

train();