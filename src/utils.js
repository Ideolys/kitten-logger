module.exports = {
  /**
   * zero padding
   * @param  {String}  n   string
   * @param  {Integer} len total number of character wanted
   * @return {String}      string
   */
  padlz (n, len) {
    for (n+=''; n.length < len; n = '0' + n) {} // eslint-disable-line
    return n;
  }
};
