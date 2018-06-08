const fs = require("fs");
const path = require("path");
const replace = require("replace-in-file");

var mkdir = function(dir) {
  // making directory without exception if exists
  try {
    fs.mkdirSync(dir, 0755);
  } catch (e) {
    if (e.code != "EEXIST") {
      throw e;
    }
  }
};

var rmdir = function(dir) {
  if (fs.existsSync(dir)) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
      var filename = path.join(dir, list[i]);
      var stat = fs.statSync(filename);

      if (filename == "." || filename == "..") {
        // pass these files
      } else if (stat.isDirectory()) {
        // rmdir recursively
        rmdir(filename);
      } else {
        // rm fiilename
        fs.unlinkSync(filename);
      }
    }
    fs.rmdirSync(dir);
  } else {
    console.warn("warn: " + dir + " not exists");
  }
};

var copyDir = function(src, dest) {
  mkdir(dest);
  var files = fs.readdirSync(src);
  for (var i = 0; i < files.length; i++) {
    var current = fs.lstatSync(path.join(src, files[i]));
    if (current.isDirectory()) {
      copyDir(path.join(src, files[i]), path.join(dest, files[i]));
    } else if (current.isSymbolicLink()) {
      var symlink = fs.readlinkSync(path.join(src, files[i]));
      fs.symlinkSync(symlink, path.join(dest, files[i]));
    } else {
      copy(path.join(src, files[i]), path.join(dest, files[i]));
    }
  }
};

var copy = function(src, dest) {
  var oldFile = fs.createReadStream(src);
  var newFile = fs.createWriteStream(dest);
  oldFile.pipe(newFile);
};

var templateFiles = function(repoData, path) {
  var maintainers = repoData.maintainers
    .map(x => `${x.name} <${x.email}>`)
    .join("\r\n");

  var codeowners = repoData.maintainers.map(x => `@${x.login}`).join(" ");

  var projectname = repoData.name;
  var projectdescription = repoData.description;

  const options = {
    files: [path + "/.github/*", path + "/*"],
    from: [
      /_projectname_/g,
      /_projectdescription_/g,
      /_maintainers_/g,
      /_codeowners_/g
    ],
    to: [projectname, projectdescription, maintainers, codeowners]
  };

  //Special rule for maintainers file
  if (fs.existsSync(path + "/MAINTAINERS")) {
    fs.writeFileSync(path + "/MAINTAINERS", maintainers);
  }

  replace.sync(options);
};

module.exports = {
  rmdir,
  mkdir,
  copy,
  copyDir,
  templateFiles
};
