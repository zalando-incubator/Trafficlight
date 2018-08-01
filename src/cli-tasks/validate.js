var compliance, trafficLightConfig;
utill = require("./utill");

//config for this task
var config = {
  repo: "",
  org: ""
};

var askForProjectDetails = function(ctx, args, cb) {
  ctx.log("Validate repository");
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

      validateProject(ctx, cb);
    }
  );
};

var validateProject = function(ctx, cb) {
  client.validate(config.org, config.repo).then(function() {
    config = {};
    cb();
  });
};

module.exports = function(config) {
  trafficLightConfig = config;
  client = require("../client")(trafficLightConfig);

  return function(ctx, args, cb) {
    askForProjectDetails(ctx, args, cb);
  };
};
