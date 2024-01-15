import * as tl from 'azure-pipelines-task-lib/task';
import { writeFileSync } from 'fs';
import { resolve } from "path";
import { RunConfig } from "./runConfig";
import {v4 as uuidv4} from 'uuid';


async function run() {
  try {
    let input = new RunConfig(
      tl.getInput("tabName", true),
      tl.getInput("artifactName", true),
      tl.getInput("htmlEntrypoint", true));

    console.log("input: ", input);

    let uuid = uuidv4();

    let filePath = resolve(`${uuid}.json`);

    let jsonConfig = JSON.stringify(input);

    writeFileSync(filePath, jsonConfig);
    tl.addAttachment("report-html", `${input.TabName}.${input.ArtifactName}.${input.HtmlEntrypoint}`, filePath);
  }
  catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();

