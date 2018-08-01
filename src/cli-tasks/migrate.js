var client,
  trafficLightConfig,
  gh_client,
  github = require("../github"),
  utill = require("./utill");

//config for this task
var config = {
  repo: "",
  org: ""
};

var askForProjectDetails = function(ctx, args, cb) {
  ctx.log("Migrating repository");
  ctx.log("---------------------------");
  ctx.log("");

  if (args.repo) {
    config = utill.parseRepositoryString(args.repo);
  }

  ctx.prompt(
    [
      {
        type: "input",
        name: "repo",
        message: "repository name?:   ",
        when: function() {
          return !config.repo;
        }
      },
      {
        type: "list",
        name: "org",
        message: "organisation?:   ",
        default: 0,
        choices: trafficLightConfig.organisations,
        when: function() {
          return !config.org;
        }
      }
    ],
    function(answers) {
      config = { ...config, ...answers };

      migrateProject(ctx, cb);
    }
  );
};

var migrateProject = function(ctx, cb) {
  console.log(config);

  ctx.prompt(
    [
      {
        type: "expand",
        message: "Migrate project?:  ",
        name: "create",
        default: 0,
        choices: [
          {
            key: "y",
            name: "yes",
            value: "yes"
          },
          {
            key: "n",
            name: "no",
            value: "no"
          }
        ]
      }
    ],
    function(result) {
      if (result.create === "yes") {
        client.migrate(config.org, config.repo).then(function() {
          console.log("############  Repository migrated  #########");
          cb();
        });
      } else {
        cb();
      }
    }
  );
};

module.exports = function(config) {
  trafficLightConfig = config;
  client = require("../client")(trafficLightConfig);
  gh_client = github(trafficLightConfig.credentials);

  return function(ctx, args, cb) {
    askForProjectDetails(ctx, args, cb);
  };
};
