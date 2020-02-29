# Braytech
_The source code of braytech.org_

© Bungie, Inc. All rights reserved. Destiny, the Destiny Logo, Bungie and the Bungie logo are among the trademarks of Bungie, Inc.

## Contributing translations

1.  Create a pull request

2.  Find translations at [/public/static/locales](https://github.com/justrealmilk/braytech.org/tree/master/public/static/locales)

3.  Add translations by removing the ##### symbols from keys and adding translated equivalents to values

4.  Submit pull request

## Running the dev build

Before you can build this project, you must install and configure the following dependencies on your machine:

1.  https://nodejs.org: We use Node to run a development web server and build the project.
    Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).
```
npm install
```
2.  Configure enviromental variables by renaming `.env.example` to `.env`

3.  Visit [Bungie.net](https://www.bungie.net/en/Application/Create) and create your own applicaiton credentials and use them to fill the blanks in `.env`
```
SET   OAuth Client Type   Confidential
SET   Redirect URL        https://localhost:3000/settings
SET   Scope               [x]
                          [x]
                          [x]
                          [x]
                          [ ]
SET   Origin Header       https://localhost:3000
```
4.  To start the app running on the default port of 3000 run 
```
npm start
```
5.  Join the [Discord server](https://discordapp.com/invite/Y68xDsG)
