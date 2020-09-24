const core = require('@actions/core');
const exec = require('@actions/exec');
const AWS = require('aws-sdk');
const glob = require('@actions/glob');
const fs = require('fs');

try {
  const bucket = core.getInput('bucket');
  const projectName = core.getInput('project_name');
  const docPath = core.getInput('doc_path');
  const docCommand = core.getInput('doc_command');

  // execute the desired command, and wait for it to complete
  await exec.exec(docCommand);

  // Upload the contents
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
  var s3 = new AWS.S3();
  // enumerate all files in a given directory
  const patterns = [`${docPath}/**/*`];
  const globber = await glob.create(patterns.join('\n'));
  var promises = [];
  for await (const file of globber.globGenerator()) {
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

  await Promise.all(promises);
} catch (e) {
  core.setFailed(e);
}
