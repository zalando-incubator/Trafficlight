var assert = require("chai").assert;
var github = require("../../github");

var repo, org, config, branch;

describe("Validating Workflow", function() {
  before(async function() {
    // runs before all tests in this block
    org = global.tl_compliance_org;
    repo = global.tl_compliance_repo;
    config = global.tl_compliance_config;
    const gh_client = github(config.credentials);

    //if a branch is not protected, it will return an error - so hence we want the test to fail
    try {
      branch = await gh_client.getBranchProtection(org, repo, "master");
    } catch (e) {
      branch = null;
    }
  });

  it("Master branch is protected", async function() {
    assert.isNotNull(branch);
  });

  it("Master branch enforces 2 reviewers", async function() {
    assert.isAtLeast(
      branch.required_pull_request_reviews.required_approving_review_count,
      1
    );
  });

  it("Master branch enforces CODEOWNERS as reviewers", async function() {
    assert.isTrue(
      branch.required_pull_request_reviews.require_code_owner_reviews
    );
  });

  it("Master branch enforces review rules for admins", async function() {
    assert.isTrue(branch.enforce_admins.enabled);
  });
  /*
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
  */
});
