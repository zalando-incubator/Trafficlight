var client,
  trafficLightConfig,
  gh_client,
  github = require("../github"),
  utill = require("./utill");

//config for the CLI
var config = {
  maintainers: [],
  repo: "",
  description: "",
  org: ""
};

var askForProjectDetails = function(ctx, args, cb) {
  ctx.log("Creating a new repository");
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
        type: "input",
        name: "description",
        message: "description?:   "
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
      },
      {
        type: "input",
        name: "url",
        message: "Migrate files from another url?:   "
      }
    ],
    function(answers) {
      config = { ...config, ...answers };
      config.maintainers = [];

      askForMaintainer(ctx, cb);
    }
  );
};

var askForMaintainer = function(ctx, cb) {
  ctx.log("Adding a project maintainer");
  ctx.log("---------------------------");
  ctx.log("");

  ctx.prompt(
    [
      {
        type: "input",
        name: "name",
        message: "Maintainer name?   "
      },
      {
        type: "input",
        name: "email",
        message: "Maintainer email?  "
      },
      {
        type: "input",
        name: "login",
        message: "Maintainer github login?   ",
        validate: function(input, answers) {
          var done = this.async();

          gh_client.getUser(input).then(function(result) {
            if (result === null) {
              return done("Github user not found");
            } else {
              done(true);
            }
          });
        }
      }
    ],

    function(result) {
      //add the maintainer to the in-memory list
      if (result.name && result.login && result.email) {
        config.maintainers.push(result);
      }

      ctx.log("------");

      //ask if there is more maintainers
      ctx.prompt(
        [
          {
            type: "expand",
            message: "Add another maintainer?:  ",
            name: "add",
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
          if (result.add === "yes") {
            askForMaintainer(ctx, cb);
          } else {
            createProject(ctx, cb);
          }
        }
      );
    }
  );
};

var createProject = function(ctx, cb) {
  console.log(config);

  //ask if there is more maintainers
  ctx.prompt(
    [
      {
        type: "expand",
        message: "Create project?:  ",
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
        client
          .create(
            config.org,
            config.repo,
            config.description,
            config.maintainers,
            config.url
          )
          .then(function() {
            console.log("############  ALL DONE  #########");
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
