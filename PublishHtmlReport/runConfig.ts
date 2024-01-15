export class RunConfig {
  constructor(
    tabName: string | undefined,
    artifactName: string | undefined,
    htmlEntrypoint: string | undefined) {
    this.TabName = tabName;
    this.ArtifactName = artifactName;
    this.HtmlEntrypoint = htmlEntrypoint;
  }

  public TabName: string | undefined;
  public ArtifactName: string | undefined;
  public HtmlEntrypoint: string | undefined;
}