# azure-pipeline-html-reporter
Extension that provides allows users to publish a HTML report and view it in build pipelines.

## Task
Use the `Publish HTML Report` task to publish the HTML report. This ensures that the tab to view it shows up in the pipeline

### Parameters
param | required? | description
---|---|---
`tabName` | required | Displayname of the tab in the pipeline
`artifactName` | required | The name of the artifact to render a HTML report from
`htmlEntrypoint` | required | Path to html file

## YAML setup
```YAML
steps:
  - task: PublishHtmlReport@1
    displayName: 'Publish HTML Report'
    inputs:
      tabName: 'I am a tab name'
      artifactName: 'html-report-artifact'
      htmlEntrypoint: '/report/index.html'
```

### Building the task
The task needs to be completely self contained. Meaning the directory needs to contain all the node_modules within the directory.
`npm install` in the directory before publishing the extension + task