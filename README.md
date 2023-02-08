# Martian exploration

The surface of Mars can be modelled by a rectangular grid around which robots are
able to move according to instructions provided from Earth. You are to write a program
that determines each sequence of robot positions and reports the final position of the
robot.
A robot position consists of a grid coordinate (a pair of integers: x-coordinate followed
by y-coordinate) and an orientation (N, S, E, W for north, south, east, and west). A robot
instruction is a string of the letters "L", "R", and "F" which represent, respectively, the
instructions:

-   Left: the robot turns left 90 degrees and remains on the current grid point.
-   Right: the robot turns right 90 degrees and remains on the current grid point.
-   Forward: the robot moves forward one grid point in the direction of the current
    orientation and maintains the same orientation.
    The direction North corresponds to the direction from grid point (x, y) to grid point (x,
    y+1).
    There is also a possibility that additional command types may be required in the future
    and provision should be made for this.
    Since the grid is rectangular and bounded (...yes Mars is a strange planet), a robot that
    moves "off" an edge of the grid is lost forever. However, lost robots leave a robot "scent"
    that prohibits future robots from dropping off the world at the same grid point. The scent
    is left at the last grid position the robot occupied before disappearing over the edge. An
    instruction to move "off" the world from a grid point from which a robot has been
    previously lost is simply ignored by the current robot.

## Prerequisites

As this project has been built with NodeJS and Typescript, these packages are required:

NodeJS
npm

## Settings

You can use a .env in the root with the same structure as .env.sample.

```
DB_PROTOCOL=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_HOST=

API_PORT=

JWT_SECRET=

poststENCRYPTION_KEY=
ALGORITHM=
SALT=
IV=
```

## Deployment

Install dependencies

`npm install --production`

Start the server in production mode
`npm run start:prod`

## Deployment with docker

`docker-compose up -d`

If you want to attach the application logs run

`docker-compose logs -f api`

## API Documentation

Once the App is deployed, you can access to OpenApi3.0 (swagger) documentation at:
http(s)://<deployment_url>/api-docs

Private endpoints are usable with a bearer token received when creating a robot or login as one.

## Features

The features implemented can be accessed as REST API endpoints:

-   Create planet
-   Create robot
-   Move robot
-   Log in as robot

## Development

If you want to contribute or check out the development tools, you need to install all the dependencies, not just the production ones.

`npm install`

Run tests (with Mocha and Chai):

`npm run test`

If you are using powershell

`npm run test:powershell`
