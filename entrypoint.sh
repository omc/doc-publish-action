#!/bin/bash
# Usage: entrypoint.sh DOC_COMMAND DOC_PATH BUCKET
# Summary: Builds the project documentation and uploads the HTML output to S3
set -e

# Expects the arguments:
DOC_COMMAND=$1
DOC_PATH=$2
BUCKET=$3
PROJECT_NAME=$4

# Run the doc command
# $DOC_COMMAND

aws s3 ls "s3://${BUCKET}"

# Copy the contents
echo "aws s3 cp --recursive $DOC_PATH 's3://${BUCKET}/${PROJECT_NAME}'"
aws s3 cp --recursive $DOC_PATH "s3://${BUCKET}/${PROJECT_NAME}"

# TODO: How to generate/update the bucket's index.html file?
# Ideas: Could use a lambda triggered on S3 content :thinking_face:
