# trafficlight

Node.js CLI for creating and migrating Github projects, ensuring that it follows an consistent
model for permissions, teams and boilerplate files.

* Creates a new repository

  * Sets up a team of maintainers under the parent team "Project Teams"
  * Assigns maintainers to the team
  * Protects the master branch
  * Checks in required boilerplate files

* Migrate an existing repository

  * Checks the current repository team members
  * Moves team members to a new team named "Team [reponame]"
  * Moves the old teams under the parent team "Legacy Teams"

* Validates an existing repository

  * Work in progress
  * Mocha test suite to perform integration testing on repositories
  * Will test that our compliance rules pass
    * Licensing
    * Repository files
    * Number of Maintainers
    * Workflows, locked branches etc. 


## Getting started

* Clone repository
* run `npm install`
* create a `.trafficlight.js` file (see below)
* run `npm start`

Available commands: `create`, `migrate` and `validate`

## Configuration

Trafficlight expects a .trafficlight.js file to be available in the root of the folder, this file needs to
include your github login and token.

```
module.exports = {
  credentials: {
    login: "username",
    token: "35e3e21c87776hhhaTOKENbe8cb241930e6"
  }
};
```

You can also override how the tool looks for teams and migrates them, and the source for its boilerplate files by adding the following:

```

  boilerplate: {
    org: "yourorg",
    repo: "new-project"
  },
  teams: {
    projectsTeamName: "Project Teams",
    legacyTeamName: "Legacy Teams"
  }

```

## Todo:

* Add a configuration option to avoid depending on .trafficlight.js file
* Create a first issue in the project with a list of tasks to complete
* Enable as a global path script (npm install -g)
* Open source and publish to npm
