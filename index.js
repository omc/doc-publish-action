const core = require('@actions/core');
const exec = require('@actions/exec');
const AWS = require('aws-sdk');
const glob = require('@actions/glob');
const fs = require('fs');
const { runInContext } = require('vm');

async function buildDocs() {
  const docCommand = core.getInput('doc_command');
  // execute the desired command, and wait for it to complete
  await exec.exec(docCommand);
}

async function uploadDocs() {
  const bucket = core.getInput('bucket');
  const projectName = core.getInput('project_name');
  const docPath = core.getInput('doc_path');

  // Configure AWS
  let key = core.getInput('aws_access_key_id');
  let secret = core.getInput('aws_secret_access_key');
  AWS.config.credentials = new AWS.Credentials(key, secret);
  AWS.config.region = core.getInput('aws_default_region');

  // Upload the contents
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
  var s3 = new AWS.S3();
  // enumerate all files in a given directory
  const patterns = [`${docPath}/**/*`];
  const globber = await glob.create(patterns.join('\n'));
  var promises = [];
  for await (const file of globber.globGenerator()) {
    // if this file exists and is a file
    if(fs.existsSync(file) && fs.lstatSync(file).isFile()) {
      console.log("Uploading file", file);
      // no option, so this is a buffer.
      // if aws no likey, add , 'utf8' to the param args
      let fileContent = fs.readFileSync(file);
      // // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      let promise =  s3.putObject({
        Body: fileContent,
        Bucket: bucket,
        Key: `${projectName}/${file}`
      });
      promises.push(promise);
    }
  }

  await Promise.all(promises);
}


async function run() {
  try {
    await buildDocs();
    await uploadDocs();
  } catch (e) {
    core.setFailed(e.message);
  }
}

if (__filename.endsWith('index.js')) { run() }
