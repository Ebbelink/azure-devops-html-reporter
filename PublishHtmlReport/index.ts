import * as tl from 'azure-pipelines-task-lib/task';
import { writeFileSync } from 'fs';
import { resolve } from "path";
import { RunConfig } from "./runConfig";

async function run() {
  try {
    let input = new RunConfig(
      tl.getInput("tabName", true),
      tl.getInput("reportDir", true),
      tl.getInput("artifactName", true),
      tl.getInput("htmlEntrypoint", true));

    console.log("input: ", input);

    let fileName = "task-parameters-config-file.json";
    let filePath = resolve(fileName);
    console.log(filePath);
    writeFileSync(filePath, JSON.stringify(input))
    tl.addAttachment('report-html', `${input.TabName}.${input.ArtifactName}.${input.HtmlEntrypoint}`, filePath)
  }
  catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();

