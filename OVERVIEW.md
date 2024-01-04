# azure-pipeline-html-reporter
Extension that provides allows users to publish a HTML report and view it in build pipelines.

## Extension
Use the `Publish HTML Report` task to publish the HTML report. This ensures that the tab to view it shows up in the pipeline

### Parameters
`reportDir` | required | Path to report directory
`tabName` | optional | Displayname of the tab in the pipeline

## YAML setup
```YAML
steps:
  - task: PublishHtmlReport@1
    displayName: 'Publish HTML Report'
    inputs:
      reportDir: '$(Build.StagingDirectory)/html-report.html'
```