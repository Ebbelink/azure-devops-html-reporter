"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunConfig = void 0;
class RunConfig {
    constructor(tabName, reportDir, artifactName, htmlEntrypoint) {
        this.TabName = tabName;
        this.ReportDir = reportDir;
        this.ArtifactName = artifactName;
        this.HtmlEntrypoint = htmlEntrypoint;
    }
}
exports.RunConfig = RunConfig;
