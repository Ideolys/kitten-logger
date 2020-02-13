module.exports = {
  isEnabled (namespace) {
    for (let i = 0, len = exports.enables.length; i < len; i++) {
      if (exports.enables[i].test(namespace)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Filter namespaces
   */
  filter () {
    exports.enables = [];

    let _filter  = process.env.KITTEN_LOGGER;
    let _split   = _filter.split(/[\s,]+/);
    for (var i = 0, _len = _split.length; i < _len; i++) {
      // ignore empty strings
      if (!_split[i]) {
        continue;
      }

      _filter = _split[i].replace(/\*/g, '.*?');
      exports.enables.push(new RegExp('^' + _filter + '$'));
    }
  }
};

exports.enables = [];
