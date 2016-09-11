module.exports.default = class {
  dispatch(request, response) {
    response.end("Hello world");
  }

  boot() {
    return Promise.resolve();
  }
}