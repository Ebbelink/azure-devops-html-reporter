"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunConfig = void 0;
class RunConfig {
    constructor(tabName, artifactName, htmlEntrypoint) {
        this.TabName = tabName;
        this.ArtifactName = artifactName;
        this.HtmlEntrypoint = htmlEntrypoint;
    }
}
exports.RunConfig = RunConfig;
