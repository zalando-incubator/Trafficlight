const vorpal = require("vorpal")();
const _trafficLightConfigFile = require("./.trafficlight");
const utill = require("./cli-tasks/utill");
const github = require("./github")(_trafficLightConfigFile.credentials);

github.getUserOrgs().then(function(orgs) {
  _trafficLightConfigFile.organisations = orgs.map(x => x.login).sort();

  //Tasks
  const create = require("./cli-tasks/create")(_trafficLightConfigFile);
  const migrate = require("./cli-tasks/migrate")(_trafficLightConfigFile);
  const validate = require("./cli-tasks/validate")(_trafficLightConfigFile);

  vorpal.command("create [repo]").action(function(args, cb) {
    create(this, args, cb);
  });

  vorpal.command("migrate [repo]").action(function(args, cb) {
    migrate(this, args, cb);
  });

  vorpal.command("validate [repo]").action(function(args, cb) {
    validate(this, args, cb);
  });

  //Display start-up message
  utill.welcome();

  vorpal.delimiter(" 🚦 > ").show();
});
