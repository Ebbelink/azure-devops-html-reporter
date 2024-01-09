export class RunConfig {
  constructor(
    tabName: string | undefined,
    reportDir: string | undefined,
    artifactName: string | undefined,
    htmlEntrypoint: string | undefined) {
    this.TabName = tabName;
    this.ReportDir = reportDir;
    this.ArtifactName = artifactName;
    this.HtmlEntrypoint = htmlEntrypoint;
  }

  public TabName: string | undefined;
  public ReportDir: string | undefined;
  public ArtifactName: string | undefined;
  public HtmlEntrypoint: string | undefined;
}