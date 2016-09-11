// This file is implemented in JavaScript rather than TypeScript, because when
// we start the server we use Node's fork() method to evaluate it. In tests,
// where we use ts-node's require hook, fork() doesn't seem to go through the
// normal require() path and doesn't transpile the source correctly.

const dns = require("native-dns");

let server = dns.createServer();

server.on("request", function(req, res) {
  res.answer.push(dns.A({
    name: req.question[0].name,
    address: "127.0.0.1",
    ttl: 1
  }));

  res.send();
});

server.serve(8538);