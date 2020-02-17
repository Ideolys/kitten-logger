const httpStart = require('./formatter_http_start');
const httpEnd   = require('./formatter_http_end');

const formatters = {};

formatters[httpStart.namespace] = httpStart.fn;
formatters[httpEnd.namespace]   = httpEnd.fn;

module.exports = formatters;
