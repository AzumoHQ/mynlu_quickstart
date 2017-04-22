/**
 * Sets up a Heroku app with the given name, adds mynlu-rasa to it, and binds the remote.
 * Sanity checks that the cli programs are available: heroku, git, node, npm
 * @author JP Lorandi (jp@azumo.co)
 */

const Promise = require('bluebird');

const exec = require('child_process').exec;

const appName = process.argv[2];

function execP(command) {
  return new Promise(function (resolve, reject) {
    exec(command, (error, stdout, stderr) => {
      const rval = {
        error: error,
        stdout: stdout,
        stderr: stderr
      };

      if (error) {
        reject(rval);
      } else {
        resolve(rval);
      }
    });
  });
}

function setup(appName) {
  Promise.coroutine(function *() {
    //TODO: verify heroku, git, node, npm are installed.
    const herokuInstalled = yield execP('heroku --version');
    console.log(`Heroku installed: ${herokuInstalled.stdout}`);
    const npmInstalled = yield execP('npm --version');
    console.log(`NPM installed: ${npmInstalled.stdout}`);
    const nodeInstalled = yield execP('node --version');
    console.log(`Node installed: ${nodeInstalled.stdout}`);
    const gitInstalled = yield execP('git --version');
    console.log(`Git installed: ${gitInstalled.stdout}`);

    const createApp = yield execP(`heroku create ${appName}`);
    console.log(`Created app ${appName}`);
    const createAddOn = yield execP(`heroku addons:create mynlu-rasa --app ${appName}`);
    console.log(`Provisioned mynlu-rasa to app ${appName}`);
    const bindGitRemote = yield execP(`heroku git:remote -a ${appName}`);
    console.log(`Bound heroku git remote to app ${appName}`);
    console.log(`Installing dependencies...`);
    const installDependencies = yield execP(`npm install`);
    console.log(`Dependencies installed`);



  })().then(()=> {
    console.log(`Application ${appName} set up.`);
  }).catch((reason)=> {
    console.error(`Couldn't install application ${appName}`);
    console.error(`Trace: ${reason.error} ${reason.stderr} ${reason.stdout}`);
  });

}



setup(appName);