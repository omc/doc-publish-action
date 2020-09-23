# doc-publish-action

An easy way for us to update our documentation repository.

## Example Usage

```yaml
- uses: omc/doc-publish-action@master
  with:
    project_name: <your app's name>
    bucket: api-docs.omc.io # default: api-docs.omc.io
    doc_path: build/docs/javadocs
    doc_command: bin/doc
    aws_access_key_id: ${{ secrets.LIBRARY_AWS_ACCESS_KEY_ID }}
    aws_secret_access_key: ${{ secrets.LIBRARY_AWS_SECRET_ACCESS_KEY }}
```
