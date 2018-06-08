const octokit = require("@octokit/rest")();

var getRepoTeams = async function(org, repo) {
  const teams = await octokit.repos.getTeams({ owner: org, repo: repo });
  return teams.data;
};

var getUserOrgs = async function() {
  const orgs = await octokit.users.getOrgs({ per_page: 100, page: 1 });
  return orgs.data;
};

var getRepo = async function(org, repo) {
  const result = await octokit.repos.get({ owner: org, repo: repo });
  return result.data;
};

var getUser = async function(username) {
  try {
    const result = await octokit.users.getForUser({ username });
    return result.data;
  } catch (e) {
    return null;
  }
};

var getBranchProtection = async function(org, repo, branch) {
  const result = await octokit.repos.getBranchProtection({
    owner: org,
    repo: repo,
    branch: branch,
    headers: {
      accept: "application/vnd.github.luke-cage-preview+json"
    }
  });
  return result.data;
};

var getCommunityMetrics = async function(org, repo) {
  const metrics = await octokit.repos.getCommunityProfileMetrics({
    owner: org,
    name: repo
  });
  return metrics.data;
};

// returns a string array of all maintainer logins on
// all teams that have write or admin access to the repo
var getRepoMaintainers = async function(org, repo) {
  const teams = await getRepoTeams(org, repo);
  const maintainers = [];

  for (const team of teams) {
    if (
      team.name !== "Team " + repo &&
      (team.permission === "admin" || team.permission === "push")
    ) {
      const members = await octokit.orgs.getTeamMembers({ id: team.id });
      for (const member of members.data) {
        maintainers.push(member);
      }
    }
  }

  return maintainers;
};

// Requires the ID of the old and new team - members are not removed from the old team
var migrateTeamMembers = async function(oldTeamId, newTeamId) {
  const members = await octokit.orgs.getTeamMembers({ id: oldTeamId });
  for (const member of members.data) {
    await octokit.orgs.addTeamMembership({
      id: newTeamId,
      username: member.login,
      role: "maintainer"
    });
  }
};

// Requires a team object with atleast id and name on it, newParentTeamId is an int
var moveTeam = async function(team, newParentTeamId) {
  await octokit.orgs.editTeam({
    id: team.id,
    name: team.name,
    parent_team_id: newParentTeamId
  });
};

var removeRepoFromTeam = async function(team, org, repo) {
  return await octokit.orgs.deleteTeamRepo({
    team_id: team.id,
    owner: org,
    repo: repo
  });
};

var getRepoTeams = async function(org, repo) {
  const teams = await octokit.repos.getTeams({ owner: org, repo: repo });

  var result = teams.data.map(x => {
    if (x.permission === "admin" || x.permission === "push") {
      return x;
    }
  });

  return result;
};

var findTeam = async function(org, team) {
  const teams = await octokit.orgs.getTeams({ org });

  for (const t of teams.data) {
    if (t.name === team) {
      return t;
    }
  }

  return null;
};

var createRepoTeam = async function(org, repo, parentTeam, maintainers = null) {
  try {
    // convert the list of maintainers to github logins
    var mainTainerGithubNames = maintainers
      ? maintainers.map(x => x.login)
      : [];

    var data = {
      org: org,
      name: "Team " + repo,
      description: `Maintainers of the ${repo} project`,
      maintainers: mainTainerGithubNames,
      repo_names: [`${org}/${repo}`],
      privacy: "closed",
      permission: "push",
      headers: {
        accept: "application/vnd.github.hellcat-preview+json"
      }
    };

    var parentTeam = await findTeam(org, parentTeam);
    if (parentTeam) {
      data.parent_team_id = parentTeam.id;
    }

    //create team and assign maintainers
    var result = await octokit.orgs.createTeam(data);

    return result;
  } catch (e) {
    console.error("Could not create team");
    console.error(e);
    throw e;
  }
};

var createRepo = async function(org, repo, description) {
  //create repo
  var result;

  try {
    result = await octokit.repos.createForOrg({
      org: org,
      name: repo,
      description: description,
      homepage: "",
      private: false,
      has_issues: true,
      has_projects: false,
      has_wiki: false,
      auto_init: true,
      license_template: "mit",
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: true
    });
  } catch (e) {
    console.error("Could not create repository");
    console.error(e);

    // If the error isnt about the repo already existing, we will stop the entire process
    if (e.code !== 422) {
      throw e;
    }
  }

  return result;
};

var protectBranch = async function(org, repo, branch = "master") {
  try {
    await octokit.repos.updateBranchProtection({
      owner: org,
      repo: repo,
      branch: branch,

      required_status_checks: {
        strict: true,
        contexts: []
      },

      required_pull_request_reviews: {
        require_code_owner_reviews: true,
        required_approving_review_count: 2,
        dismissal_restrictions: { users: [], teams: [] },
        dismiss_stale_reviews: false
      },

      enforce_admins: true,
      restrictions: null,
      headers: {
        accept: "application/vnd.github.luke-cage-preview+json"
      }
    });

    return true;
  } catch (e) {
    console.error("Could not set review and protection settings");
    console.error(e);
    throw e;
  }
};

const createIssue = async function(owner, repo, title, body) {
  var result;

  try {
    result = await octokit.issues.create({
      owner,
      repo,
      title,
      body
    });
  } catch (e) {
    console.error("Could not create issue", e);
    return e;
  }

  return result;
};

var ex = function(credentials) {
  octokit.authenticate({
    type: "token",
    token: credentials.token
  });

  return {
    createRepo,
    createRepoTeam,
    findTeam,
    getRepo,
    getCommunityMetrics,
    getBranchProtection,
    getRepoTeams,
    getRepoMaintainers,
    getUser,
    getUserOrgs,
    moveTeam,
    removeRepoFromTeam,
    migrateTeamMembers,
    protectBranch,
    createIssue
  };
};

module.exports = ex;
