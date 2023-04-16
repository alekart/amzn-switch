const fs = require('fs');
const path = require('path');
const semver = require('semver');
const yargs = require('yargs').argv;
const loadProjectJson = require('./utils/load-project-json');
const exec = require('./utils/exec');
const Version = require('./utils/version.class');

/**
 * VERSION BUMP NODE SCRIPT
 *
 * Commands:
 * - next: 1.2.3 => 1.3.0-next | 1.2.3-alpha.0 => 1.3.0-next (Removes previous modifiers)
 * - major: 1.2.3 => 2.0.0 | 1.2.3-next => 2.0.0 (Removes previous modifiers)
 * - minor: 1.2.3 => 1.3.0 | 1.2.3-next => 1.3.0 (Removes previous modifiers)
 * - patch: 1.2.3 => 1.2.4 | 1.2.3-next => 1.2.4 (Removes previous modifiers)
 * - release: 1.2.3-next.0-whatever => 1.2.3 (Removes previous modifiers)
 * - snap: 1.2.3 => 1.2.3-snapshot | 1.2.3-next -> 1.2.3-snapshot (Removes previous modifiers)
 * - date: 1.2.3 => 1.2.3-202208141149 Adds date (YYYYMMDDHHmm) (Keeps previous modifiers)
 * - hash: 1.2.3 => 1.2.3-f77b44bd Adds current commit hash (Keeps previous modifiers)
 * - x.x.x => valid semver version can be provided
 *
 * Commands can be chained but the order is important:
 * - `bump-version.js next major` => 1.2.3 => 2.0.0
 * - `bump-version.js major next` => 1.2.3 => 2.0.0-next
 *
 * Flags:
 * - `--nocommit` prevents changes to be committed after bump
 * - `--force` forces version setting, only for `bump-version.js 1.2.3` commands
 * - `--prerelease="alpha" will override any command and set provided prerelease version, default suffix is "next"
 * - `--name="my library"` used to provide specific package name for bump commit
 *
 * Examples:
 * - `bump-version.js next`
 * - `bump-version.js minor`
 * - `bump-version.js patch next`
 * - `bump-version.js release`
 * - `bump-version.js --prerelease`
 * - `bump-version.js --prerelease=alpha`
 * - `bump-version.js snap date hash`
 * - `bump-version.js 2.1.0`
 * - `bump-version.js 2.1.0 next`
 * - `bump-version.js 2.1.0 --prerelease=alpha`
 * - `bump-version.js 1.2.3 --force`
 * - `bump-version.js 1.2.3 --nocommit --force`
 */

/**
 * List of known commands
 * @type {string[]}
 */
const knownCliCommands = ['next', 'major', 'minor', 'patch', 'release', 'snap', 'date', 'hash'];
/**
 * If a valid version is provided via cli command
 * @type string | null
 */
let versionCommand = null;

/**
 * Return true if --nocommit flag is provided
 * @returns {boolean}
 */
function isNoCommit() {
  return !!yargs?.['nocommit'];
}

/**
 * @type {{version: string, [k:any]: any}}
 */
const projectJson = loadProjectJson('package.json');
const currentVersion = projectJson.version;

/**
 * @type Version
 */
let version;
try {
  version = new Version(currentVersion);
} catch (e) {
  console.error('Initial version error.', e);
  process.exit(1);
}

const operations = getOperations();

operations.forEach((op) => applyVersionOperation(version, op));

const files = [
  {path: path.resolve('package.json')},
  {path: path.resolve('src/manifest.json'), version: semver.coerce(version.version).version},
];

if (version.version === version.initial) {
  console.log('Current version is the same as the new version. Nothing to do.');
  process.exit(0);
}

updatePackages(files);

if (!isNoCommit()) {
  let commitMessage;
  const packageName = yargs.name ? ` ${yargs.name} ` : ' ';
  if (operations.includes('next') || operations.includes('snap')) {
    commitMessage = `Bump${packageName}next version to ${version.version}`;
  } else if (operations.includes('release')) {
    commitMessage = `Bump${packageName}release version to ${version.version}`;
  } else {
    commitMessage = `Bump${packageName}release version to ${version.version}`;
  }
  exec(`git commit ${files.map((f) => f.path).join(' ')} src/popup.html -m "${commitMessage}"`);
}

// eslint-disable-next-line no-console
console.log(version.version);

/**
 * Update all packages with provided version string
 * @param files {{path: string; version?: string}[]}
 */
function updatePackages(files) {
  files.forEach((file) => {
    const v = file.version || version.version;
    let packageData = setPackageVersion(loadProjectJson(file.path), v);
    savePackage(packageData, file.path);
  });
}

/**
 * Set Package version in provided package file data and return updated package content
 * @param packageData {{}}
 * @param version {string}
 * @returns {{}}
 */
function setPackageVersion(packageData, version) {
  return {...packageData, version};
}

/**
 * Write updated package file content
 * @param packageData {{}}
 * @param packagePath {string}
 */
function savePackage(packageData, packagePath) {
  const fileContent = `${JSON.stringify(packageData, null, 2)}\n`;
  fs.writeFileSync(packagePath, fileContent, 'utf-8');
}


/**
 * Return a list of operation to apply on version based on provided operation and flags
 * @returns {string[]}
 */
function getOperations() {
  let operations = yargs._?.reduce((accum, command, index) => {
    if (knownCliCommands.includes(command)) {
      accum.push(command);
    } else if (index === 0) {
      versionCommand = semver.valid(command);
      if (versionCommand) {
        accum.unshift('setVersion');
      }
    }
    return accum;
  }, []);
  if (yargs.prerelease) {
    if (operations[0] === 'setVersion') {
      operations = [operations[0]];
    }
    operations.push('prerelease');
  }
  return operations;
}

/**
 *
 * @param version {Version}
 * @param bumpOperation {string}
 * @returns {string} version
 */
function applyVersionOperation(version, bumpOperation) {
  switch (bumpOperation) {
    case 'setVersion':
      if (!version.setVersion(versionCommand, yargs.force)) {
        process.exit(1);
      }
      break;
    case 'next':
      version.next();
      break;
    case 'major':
      version.major();
      break;
    case 'minor':
      version.minor();
      break;
    case 'patch':
      version.patch();
      break;
    case 'release':
      version.release();
      break;
    case 'prerelease':
      const suffix = yargs.prerelease !== true ? yargs.prerelease : undefined;
      version.prerelease(suffix);
      break;
    case 'snap':
      version.snapshot();
      break;
    case 'date':
      version.addDate();
      break;
    case 'hash':
      version.removeEndHash().addHash();
      break;
    default:
  }
}
