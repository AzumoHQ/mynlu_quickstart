# myNLU Rasa in 3 minutes
You will need to have installed command line versions of:
`heroku`
`node`
`npm`
`git`

## Get the myNLU Rasa quickstart and configure it

From the command line clone the repository into a mynlu-qs directory:
```sh
git clone https://github.com/AzumoHQ/mynlu_quickstart.git mynlu-qs`
```

Go into that directory:
```sh
cd mynlu-qs
```


Install node dependencies:
```sh
npm install
```

Setup the application with the name `mynlu-qs-test` (you WILL need to choose another name):
```sh
npm run setup -- mynlu-qs-test
```


This final step will check that you have heroku, npm, node, git installed, create a Heroku app with the name 
`mynlu-qs-test`, provision the mynlu-rasa add-on, and create a local `.env` file with the settings for your 
`mynlu-rasa` access. TL;DR: you’re good to go!

## Starting your app locally
From the command line run:
```sh
npm run start
```

Now point your browser to: `http://localhost:3000`

You'll be able to see this:
TODO insert image here

You need to train your model (it's under `model/demo_rasa.json`) by pushing the train button.

After you've trained your model at least once, you can type on the text box and either press enter or click on the Parse button:
TODO insert image here

The app will call your `mynlu-rasa` instance and show the results below.

## Grooming your model

You need to edit your model at: `./model/demo_rasa.json`. You can check out the rasa tutorial at: (TODO: insert link here)

After you do it, you can train via the button on your app, or via command line:
```sh
npm run train
```

## Final words
You can deploy your new app to Heroku via git, check out this tutorial here: (TODO: insert link)




