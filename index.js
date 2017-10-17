#! /usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');

const sfcc = require('./sfcc/');

const detectCodeVersion = async () => {
  console.log(`Attempting to detect code versions on ${process.env.SFCC_DOMAIN}`);

  const codeVersions = await sfcc.codeVersions();

  const answers = await inquirer.prompt({
    type: 'list',
    name: 'codeVersion',
    message: 'Select the code version to import:',
    choices: codeVersions,
  });

  return answers.codeVersion;
};

program
  .command('import [codeVersion]')
  .description(`
    Detect code versions on your instance and select one to import to your local /cartridges.
    You can also specify a code version directly.
  `)
  .action(async (codeVersion) => {
    try {
      sfcc.checkEnv();

      if (!codeVersion) {
        codeVersion = await detectCodeVersion();
      }

      if (fs.existsSync('./cartridges')) {
        const answers = await inquirer.prompt({
          type: 'confirm',
          name: 'confirm',
          message: `Importing ${codeVersion} will remove what you currently have in /cartridges. Is this OK?`,
        });

        if (!answers.confirm) {
          return;
        }
      }

      await sfcc.import(codeVersion);
    } catch (error) {
      console.log(error.message);
    }
  });

program
  .command('watch [codeVersion]')
  .description('Watch file changes in /cartridges, and upload into the specified code version')
  .action(async (codeVersion) => {
    try {
      sfcc.checkEnv();

      if (!codeVersion) {
        codeVersion = await detectCodeVersion();
      }

      sfcc.watch(codeVersion);
    } catch (error) {
      console.log(error.message);
    }
  });

program.parse(process.argv);
