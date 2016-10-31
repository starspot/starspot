# Starspot: Operator Guide

Welcome to Starspot. Starspot is a Node.js framework for building web services.

Out of the box, Starspot includes everything needed to be productive
building modern web APIs, including:

* SSL/TLS
* HTTP2
* Standardized JSON with [JSON:API][json-api]
* Reading and writing to a database with [Knex][knex]
* Scheduling background jobs
* Automated unit and integration tests with [Mocha][mocha]

[json-api]: http://jsonapi.org
[knex]: http://knexjs.org
[mocha]: https://mochajs.org

However, Starspot is completely modular. You can remove or replace any of the
built-in functionality and replace it with something better suited to your
needs.

## Philosophy

### SSL First

Today, there's no excuse for deploying new services without encryption.
Unfortunately, most development tools make you jump through hoops to set up a
local environment that works with SSL.

Starspot makes SSL a first-class part of the development experience, automating
the generation of certificates and the configuration of custom domains.

### HTTP2 First

HTTP2 can dramatically improve the performance of web services, allowing servers
to deliver many items at once without the traditional limit on the number of
concurrent requests. Starspot's routing layer supports HTTP2 out of the box,
with fallback to HTTP 1.1 for older clients.

### Database Agnostic

Starspot ships with built-in support for SQL databases like MySQL and
PostgreSQL. However, if you use something other than (or in addition to!) a SQL
database, Starspot offers a pluggable interface for integrating any Node
libraries into the greater Starspot architecture.

## Installation

To use Starspot, you will need Node v6 or later.

Install Starspot globally using npm:

```sh
npm install starspot -g
```

Once finished, you can verify that it is working by running:

```sh
starspot --version
```

## Creating a New App

To create a new Starspot application, use the `starspot new` command. For example,
to create an app called `my-app`, run:

```sh
starspot new my-app
```

This will create a new directory called `my-app`. Inside the directory, you'll
find that it has automatically configured the `package.json` to contain
everything needed by a Starspot application, as well as a directory structure to
help you organize your files.

If you have `git` installed, Starspot will also automatically initialize your new application
as a Git repository.

