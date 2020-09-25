const core = require('@actions/core');
const exec = require('@actions/exec');
const AWS = require('aws-sdk');
const glob = require('@actions/glob');
const fs = require('fs');
const path = require('path');

async function buildDocs() {
  const docCommand = core.getInput('doc_command');
  // execute the desired command, and wait for it to complete
  await exec.exec(docCommand);
}

async function uploadDocs() {
  const bucket = core.getInput('bucket');
  const projectName = core.getInput('project_name');
  const docPath = core.getInput('doc_path');

  const workDir = process.env.GITHUB_WORKSPACE;
  core.debug(`workDir: ${workDir}`);
  let docDir = path.join(workDir, docPath);
  console.log('docDir', docDir);


  // Configure AWS
  let key = core.getInput('aws_access_key_id');
  let secret = core.getInput('aws_secret_access_key');
  AWS.config.credentials = new AWS.Credentials(key, secret);
  AWS.config.region = core.getInput('aws_default_region');

  // Upload the contents
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
  var s3 = new AWS.S3();
  // enumerate all files in a given directory
  core.debug(`Uploading files from '${docPath}' to '${bucket}'`)
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
      // Add 1 to remove the last / so I can add it on later.
      let keyPath = file.slice(docDir.length + 1);
      console.log('Key', keyPath);
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      let promise =  s3.putObject({
        Body: fileContent,
        Bucket: bucket,
        Key: `${projectName}/${keyPath}`
      });
      promises.push(promise.on('success', function(response){
        console.log('File',file,'Success');
      }).send());
    }
  }

  console.log('Waiting for', promises.length, 'promises to complete');
  let results = await Promise.all(promises);
  console.log('results:', results);
}


async function run() {
  try {
    core.startGroup('buildDocs');
    await buildDocs();
    core.endGroup();

    core.startGroup('uploadDocs');
    await uploadDocs();
    core.endGroup();
  } catch (e) {
    core.setFailed(e.message);
  }
  console.log('done');
}

if (__filename.endsWith('index.js')) { run() }
