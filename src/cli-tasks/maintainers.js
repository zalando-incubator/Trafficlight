var client,
  trafficLightConfig,
  gh_client,
  github = require("../github"),
  utill = require("./utill"),
  Table = require("cli-table2");

//config for the CLI
var config = {
  repo: "",
  org: ""
};

var askForProjectDetails = function(ctx, args, cb) {
  ctx.log("Maintainer stats for repos");
  ctx.log("---------------------------");
  ctx.log("");

  if (args.repo) {
    config = utill.parseRepositoryString(args.repo);
  }

  ctx.prompt(
    [
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
        name: "repo",
        message: "Specific repository to query?:   ",
        when: function() {
          return !config.repo;
        }
      }
    ],
    function(answers) {
      config = { ...config, ...answers };
      config.repos = [];

      queryRepositories(ctx, cb);
    }
  );
};

var queryRepositories = function(ctx, cb) {
  ctx.log("Querying repositories");
  ctx.log("---------------------------");
  ctx.log("");

  if (config.repo) {
    gh_client.getRepo(config.org, config.repo).then(function(repo) {
      config.repos.push(repo);
      listRepositoryStats(ctx, cb);
    });
  } else {
    gh_client.getRepos(config.org).then(function(repos) {
      config.repos = repos;
      listRepositoryStats(ctx, cb);
    });
  }
};

var listRepositoryStats = function(ctx, cb) {
  var table = new Table({
    head: [
      "Repository",
      "Teams (admin/readonly)",
      "Maintainers",
      "Collaborators (outside/direct)"
    ]
  });

  var result = config.repos.map(repo => {
    var values = [];
    values.push(repo.name);

    return gh_client.getRepoTeams(config.org, repo.name).then(function(teams) {
      var adminTeams = teams.filter(
        team =>
          team && (team.permission === "admin" || team.permission === "push")
      );
      var readTeams = teams.length - adminTeams.length;

      values.push(adminTeams.length + "/" + readTeams);

      return gh_client
        .getRepoMaintainers(config.org, repo.name, false)
        .then(function(maintainers) {
          var maintainers = maintainers.length;
          values.push(maintainers);

          return gh_client
            .getRepoCollaborators(config.org, repo.name, "outside")
            .then(function(collabs) {
              var collab = collabs.length;

              return gh_client
                .getRepoCollaborators(config.org, repo.name, "direct")
                .then(function(total) {
                  collab += "/" + total.length;
                  values.push(collab);

                  return values;
                });
            });
        });
    });
  });

  Promise.all(result).then(function(result) {
    for (const res of result) {
      table.push(res);
    }

    config = {};
    console.log(table.toString());
    cb();
  });
};

module.exports = function(config) {
  trafficLightConfig = config;
  client = require("../client")(trafficLightConfig);
  gh_client = github(trafficLightConfig.credentials);

  return function(ctx, args, cb) {
    askForProjectDetails(ctx, args, cb);
  };
};
