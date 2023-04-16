const semver = require('semver');
const getGitRef = require('../utils/get-git-ref.function');

const hashRegEx = /((?!-snapshot))(-[\w\d]{8})$/;

/**
 * Add leading 0 to number from 0 to 9
 * @param number {number}
 * @return {string}
 */
function twoCharsNumber(number) {
  return `0${number.toString()}`.slice(-2);
}

class Version {
  /**
   * Current instance version
   * @type {string}
   * @private
   */
  _v;
  /**
   * Initial version
   * @type {string}
   * @private
   * @readonly
   */
  _initialV;

  /**
   * Current version
   * @param currentVersion {string}
   */
  constructor(currentVersion) {
    if (!Version.isValidVersion(currentVersion)) {
      throw new Error(`Invalid version format: ${currentVersion}`);
    }
    this._v = currentVersion;
    this._initialV = currentVersion;
  }

  /**
   * Returns current version. With all ever applied modifications.
   * @returns {string}
   */
  get version() {
    return this._v;
  }

  /**
   * Returns initially provided version. Always stays unchanged.
   * @returns {string}
   */
  get initial() {
    return this._initialV;
  }

  /**
   * Increments Major version
   * @returns {Version}
   */
  major() {
    this._v = semver.inc(this._clean().version, 'major');
    return this;
  }

  /**
   * Increments Minor version (x.N.x)
   * @returns {Version}
   */
  minor() {
    this._v = semver.inc(this._clean().version, 'minor');
    return this;
  }

  patch() {
    this._v = semver.inc(this._clean().version, 'patch');
    return this;
  }

  /**
   * Add "-next" suffix to the version
   * @returns {Version}
   */
  next() {
    this._v = `${this._clean().version}-next`;
    return this;
  }

  /**
   * Add "-snapshot" suffix to the version
   * @returns {Version}
   */
  snapshot() {
    this._v = `${this._clean().version}-snapshot`;
    return this;
  }

  /**
   * Add commit hash suffix to the version
   * @returns {Version}
   */
  addHash() {
    this._v = `${this._v}-${getGitRef()}`;
    return this;
  }

  /**
   * Add "-YYMMDD(HHmm)" (year, moth, day, hour, minutes) date suffix to the version. Hour and minutes
   * are optional and will be added when addTime is set to true.
   * ie: `220214`, `2202141217`
   * @param [addTime] {string} add time `HHmm` to the date
   * @returns {Version}
   */
  addDate(addTime = false) {
    const date = new Date();
    const year = twoCharsNumber(date.getFullYear());
    const month = twoCharsNumber(date.getMonth() + 1);
    const day = twoCharsNumber(date.getDate());
    const hour = twoCharsNumber(date.getHours());
    const minutes = twoCharsNumber(date.getMinutes());
    const time = addTime ? `${hour}${minutes}` : '';
    this._v = `${this._v}-${year}${month}${day}${time}`;
    return this;
  }

  /**
   * Remove commit hash from the end of the provided version if present
   * @returns {Version}
   */
  removeEndHash() {
    this._v = this._v.replace(hashRegEx, '');
    return this;
  }

  /**
   * Removes all version modifiers and returns the version.
   * `1.2.3-next.2` => `1.2.3`
   * @returns {string} ready to use version string
   */
  release() {
    return this._clean().version;
  }

  /**
   * Increases the prerelease number 1.2.3-next.3 if one already exists otherwise
   * cleans version and adds prerelease suffix.
   * @param prerelease suffix 'beta'|'alpha'|'next' (Default: 'next')
   * @returns {string} ready to use version string
   */
  prerelease(prerelease = 'next') {
    this._v = semver.inc(this.version, 'prerelease', prerelease);
    return this.version;
  }

  /**
   * Replace current version by new one if it is valid
   * @param newVersion {string}
   * @param force {boolean} forces setting version even if it is smaller than current
   * @returns {string | null}
   */
  setVersion(newVersion, force = false) {
    if (!!semver.valid(newVersion)) {
      const older = semver.lt(newVersion, this.version);
      if (older && !force) {
        console.error('New version should be greater than the current');
        return null;
      }
      this._v = newVersion;
      return this.version;
    } else {
      console.error(`Invalid version format ${newVersion}`);
    }
    return null;
  }

  /**
   * Remove any extras from the version and keep only MAJOR.MINOR.PATCH format
   * @returns {Version}
   * @private
   */
  _clean() {
    this._v = semver.coerce(this._v).version || this._v;
    return this;
  }

  /**
   * Check if version is semantically valid.
   * @param version {string}
   * @returns {boolean}
   */
  static isValidVersion(version) {
    return !!semver.valid(version);
  }
}

module.exports = Version;
