"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const fs_1 = require("fs");
const path_1 = require("path");
const runConfig_1 = require("./runConfig");
const uuid_1 = require("uuid");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let input = new runConfig_1.RunConfig(tl.getInput("tabName", true), tl.getInput("artifactName", true), tl.getInput("htmlEntrypoint", true));
            console.log("input: ", input);
            let uuid = (0, uuid_1.v4)();
            let filePath = (0, path_1.resolve)(`${uuid}.json`);
            let jsonConfig = JSON.stringify(input);
            (0, fs_1.writeFileSync)(filePath, jsonConfig);
            tl.addAttachment("report-html", `${input.TabName}.${input.ArtifactName}.${input.HtmlEntrypoint}`, filePath);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
