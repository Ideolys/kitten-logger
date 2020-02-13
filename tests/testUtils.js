module.exports = {
  replaceStdout : (callback) => {
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write      = (chunk, encoding, callbackStdout) => {
      process.stdout.write = originalStdoutWrite;
      if (callbackStdout) callbackStdout();
      callback(chunk);
    };
  }
};
