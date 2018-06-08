const simpleGit = require("simple-git")();
const gitPromise = require("simple-git/promise");

var _auth, _tmpFolder;

var cloneRepo = async function(org, repo) {
  const repoUrl = `github.com/${org}/${repo}`;
  const remote = `https://${_auth.login}:${_auth.token}@${repoUrl}`;
  const git = gitPromise(_tmpFolder);

  await git.silent(true).clone(remote);
};

var cloneRepoFromUrl = async function(url, name) {
  const git = gitPromise(_tmpFolder);
  await git.silent(true).clone(url, name);
};

var commitAndPushRepo = async function(org, repo, pattern = ".") {
  const git = gitPromise(_tmpFolder + "/" + repo + "/");
  const isRepo = await git.checkIsRepo();

  await git.add(pattern);
  await git.commit("Adding boilerplate files");
  await git.push();
};

var ex = function(credentials, tempFolder) {
  _auth = credentials;
  _tmpFolder = tempFolder;

  return {
    cloneRepo,
    cloneRepoFromUrl,
    commitAndPushRepo
  };
};

module.exports = ex;
