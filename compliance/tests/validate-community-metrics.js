var assert = require("chai").assert;
var github = require("../../github");

var repo, org, config, metrics;

describe("Validating Community Metrics", function() {
  before(async function() {
    // runs before all tests in this block
    org = global.tl_compliance_org;
    repo = global.tl_compliance_repo;
    config = global.tl_compliance_config;
    const gh_client = github(config.credentials);
    metrics = await gh_client.getCommunityMetrics(org, repo);
  });

  it("Has a community score over 70", async function() {
    assert.isAbove(metrics.health_percentage, 70);
  });

  it("Has a repository description", async function() {
    assert.isNotEmpty(metrics.description);
  });

  it("Has a contribution.md file", async function() {
    assert.isNotNull(metrics.files.contributing, "Contribution.md exists");

    //TODO check for lenght and content quality?
  });

  it("Has a readme.md file", async function() {
    assert.isNotNull(metrics.files.readme, "readme.md exists");

    //TODO check for lenght and content quality?
  });

  it("Has a MIT license", async function() {
    assert.equal(metrics.files.license.key, "mit", "License is a MIT License");
  });
});
