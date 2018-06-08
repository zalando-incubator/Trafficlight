module.exports = {
  parseRepositoryString: function(repoString) {
    var result = { repo: "", org: "" };
    var urlA = repoString.split("/");

    //if repo
    if (urlA.length === 1) {
      result.repo = urlA[0];
      return result;
    }

    // if org/repo
    if (urlA.length === 2) {
      result.repo = urlA[1];
      result.org = urlA[0];
      return result;
    }

    //if github.com/org/repo
    if (urlA.length > 2) {
      result.repo = urlA[urlA.length - 1];
      result.org = urlA[urlA.length - 2];
      return result;
    }

    return result;
  },

  welcome: function() {
    console.log(",--,--'      ,_ ,_       .        .   . ");
    console.log("`- | ,-. ,-. |_ |_ . ,-. |  . ,-. |-. |-");
    console.log(" , | |   ,-| |  |  | |   |  | | | | | | ");
    console.log(" `-' '   `-^ |  |  ' `-' `' ' `-| ' ' `'");
    console.log("             '  '              ,|       ");
    console.log("                                `'       ");
    console.log("");
    console.log("");
    console.log("Traffic light helps you create and migrate github projects");
    console.log("Type 'help' to get an overview of available commands");
    console.log("----------------------------------------------------------");
    console.log("");
  }
};
