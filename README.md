# Sylow
[![Build Status](https://travis-ci.org/SylowTech/sylow.svg?branch=master)](https://travis-ci.org/SylowTech/sylow)
[![Test Coverage](https://codeclimate.com/github/SylowTech/sylow/badges/coverage.svg)](https://codeclimate.com/github/SylowTech/sylow/coverage)
[![Code Climate](https://codeclimate.com/github/SylowTech/sylow/badges/gpa.svg)](https://codeclimate.com/github/SylowTech/sylow)

An efficient, simple, encrypted personal data store and sharing system.

In development. For more information, [check out the Wiki](https://github.com/SylowTech/sylow/wiki).

## Getting Started

### Development

There is a provided docker-compose configuration to get started developing with Sylow. You must first install both [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/) on your system. Then, starting the server is as simple as:

```bash
git clone https://github.com/SylowTech/sylow
cd sylow
cp .env.example .env
./bin/development.sh
```

### Development (non-Docker)

To run Sylow locally you need to install [nvm](https://github.com/creationix/nvm), [MongoDB](https://www.mongodb.com/) (3.4 and higher) and [Yarn](https://yarnpkg.com/en/docs/install).
* Make sure MongoDB is started. For example, on Linux, you can run: ```sudo systemctl start mongod```

Then you can run:

```bash
git clone https://github.com/SylowTech/sylow
cd sylow
nvm use
cp .env.example .env
yarn install
yarn start
```

### Creating a test entity

You will need to manually create an admin entity before you can start using the Sylow server and its administration interface. To do so, run `cli/sylow new-entity [name] [domain]` with your desired username and domain name. The command will ask you for your password, and will encrypt and save it along with the entity.

### Testing

Tests can be launched for the Docker version using `./bin/test.sh`, or for the manual version using `yarn test`.

### Notes

The development server uses a live reload system, meaning changes you make to server-side files should cause the server to restart, whether you use Docker or a manual installation.

A precommit hook runs before every push, to make sure all tests pass and that code coverage is not too low. If you use both the local and the Docker versions alternately, you may also need to change the `prepush` hook in your `package.json` to use either the local method of testing or the Dockerized one.
