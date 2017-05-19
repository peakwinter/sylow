# Sylow
[![Build Status](https://travis-ci.org/peakwinter/sylow.svg?branch=master)](https://travis-ci.org/peakwinter/sylow)
[![Test Coverage](https://codeclimate.com/github/peakwinter/sylow/badges/coverage.svg)](https://codeclimate.com/github/peakwinter/sylow/coverage)
[![Code Climate](https://codeclimate.com/github/peakwinter/sylow/badges/gpa.svg)](https://codeclimate.com/github/peakwinter/sylow)

An efficient, simple, encrypted personal data store and sharing system.

In development. For more information, [check out the Wiki](https://github.com/peakwinter/sylow/wiki).

## Getting Started

### Development

To run Sylow locally you need to install [nvm](https://github.com/creationix/nvm), [MongoDB](https://www.mongodb.com/) and [Yarn](https://yarnpkg.com/en/docs/install). Then you can run:

```bash
git clone https://github.com/peakwinter/sylow
cd sylow
nvm use
cp .env.example .env
yarn install
yarn start
```

### Using Docker

You can also use the provided docker-compose configuration. You must first install both [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/) on your system. Then, starting the server is as simple as:

```bash
git clone https://github.com/peakwinter/sylow
cd sylow
./bin/development.sh
```

### Testing

Tests can be launched for the Docker version using `./bin/test.sh`, or for the manual version using `yarn test`.

### Notes

A precommit hook runs before every commit, to make sure all tests pass and that code coverage is not too low.

The development server uses a live reload system, meaning changes you make to server-side files should cause the server to restart, whether you use Docker or a manual installation.

If you use both the local and the Docker versions alternately, you may also need to change the `precommit` hook in your `package.json` to use either the local method of testing or the Dockerized one.
