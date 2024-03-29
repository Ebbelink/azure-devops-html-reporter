import "./htmlReporter.scss";

import { Buffer } from "buffer";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";

import { getClient } from "azure-devops-extension-api";
import { Build, BuildRestClient, Attachment, BuildArtifact, ArtifactResource } from "azure-devops-extension-api/Build";

import { ObservableValue, ObservableObject } from "azure-devops-ui/Core/Observable";
import { ObservedMembers, Observer } from "azure-devops-ui/Observer";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";

import * as JSZip from 'jszip';

import { RunConfig } from "../PublishHtmlReport/runConfig";

const ATTACHMENT_TYPE = "report-html";

SDK.init()
SDK.ready()
  .then(() => {
    try {
      let config = SDK.getConfiguration();
      config.onBuildChanged((build: Build) => {
        let buildAttachmentClient = new BuildAttachmentClient(build);

        buildAttachmentClient.init()
          .then(() => {
            displayReports(buildAttachmentClient);
          }).catch(error => {
            throw error;
          });
      })
    } catch (error) {
      throw error;
    }
  });

function displayReports(attachmentClient: AttachmentClient) {
  ReactDOM.render(<TaskAttachmentPanel attachmentClient={attachmentClient} />, document.getElementById("html-report-container"))
}

class AttachmentWithContent implements Attachment {
  _links: any;
  name: string;
  content: string;

  constructor(attachment: Attachment) {
    this._links = attachment._links;
    this.name = attachment.name;
  }

  public async download(client: AttachmentClient) {
    this.content = await client.getAttachmentContent(this.name);
  }
}

class BuildArtifactContentReadable implements BuildArtifact {
  id: number;
  name: string;
  resource: ArtifactResource;
  source: string;
  private zipBuffer: ArrayBuffer | undefined = undefined;

  private authHeaders: Object = undefined;

  constructor(artifact: BuildArtifact) {
    this.id = artifact.id;
    this.name = artifact.name;
    this.resource = artifact.resource;
    this.source = artifact.source;
  }

  public async getFileContentsFromZip(fileLocation: string) {
    let result: JSZip = (await JSZip.loadAsync(this.download(this.resource.downloadUrl)));

    let fileResult = result.file(fileLocation);

    let fileContents = await fileResult.async("string");

    return fileContents;
  }

  private async download(url: string): Promise<ArrayBuffer> {
    if (this.zipBuffer !== undefined) {
      return this.zipBuffer;
    }

    if (this.authHeaders === undefined) {
      console.log('Retrieve access token');
      let accessToken = await SDK.getAccessToken();
      let base64encodedAuth = Buffer.from(':' + accessToken).toString('base64');
      this.authHeaders = { headers: { 'Authorization': 'Basic ' + base64encodedAuth } };
    }

    let response = await fetch(url, this.authHeaders);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    let responseBuffer: ArrayBuffer = await response.arrayBuffer();

    this.zipBuffer = responseBuffer;
    return this.zipBuffer;
  }
}

abstract class AttachmentClient {
  protected attachments: AttachmentWithContent[] = [];
  protected artifacts: BuildArtifactContentReadable[] = [];
  protected authHeaders: Object = undefined;
  protected reportHtmlContent: string = undefined;
  constructor() { }

  public getAttachments(): AttachmentWithContent[] {
    return this.attachments;
  }

  public getArtifacts(): BuildArtifactContentReadable[] {
    return this.artifacts;
  }

  public getDownloadableAttachment(attachmentName: string): AttachmentWithContent {
    let attachment = this.attachments.find((attachment) => { return attachment.name === attachmentName });
    if (!(attachment && attachment._links && attachment._links.self && attachment._links.self.href)) {
      throw new Error("Attachment " + attachmentName + " is not downloadable");
    }
    return attachment;
  }

  public async getAttachmentContent(attachmentName: string): Promise<string> {
    if (this.authHeaders === undefined) {
      console.log('Retrieve access token');
      let accessToken = await SDK.getAccessToken();
      let base64encodedAuth = Buffer.from(':' + accessToken).toString('base64');
      this.authHeaders = { headers: { 'Authorization': 'Basic ' + base64encodedAuth } };
    }
    console.log("Get attachment: ", attachmentName);
    let attachment = this.getDownloadableAttachment(attachmentName);
    let response = await fetch(attachment._links.self.href, this.authHeaders);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    let responseText = await response.text();
    return responseText;
  }

  public getArtifactContent(artifactName: string): BuildArtifactContentReadable {
    return this.artifacts.find(art => art.name === artifactName);
  }
}

class BuildAttachmentClient extends AttachmentClient {
  private build: Build

  constructor(build: Build) {
    super()
    this.build = build
  }

  public async init() {
    let buildClient: BuildRestClient = getClient(BuildRestClient);
    let attachmentsMetadata = await buildClient.getAttachments(this.build.project.id, this.build.id, ATTACHMENT_TYPE);
    this.attachments = attachmentsMetadata.map(att => new AttachmentWithContent(att));

    await Promise.all(this.attachments.map(async attachment => await attachment.download(this)));
    console.log("attachments:", this.attachments);

    let artifactsMetadata = await buildClient.getArtifacts(this.build.project.id, this.build.id);
    this.artifacts = await Promise.all(artifactsMetadata.map(art => new BuildArtifactContentReadable(art)));
    console.log("artifacts metadata:", this.artifacts);
  }
}

interface TaskAttachmentPanelProps {
  attachmentClient: AttachmentClient
}

export default class TaskAttachmentPanel extends React.Component<TaskAttachmentPanelProps> {
  private selectedTabId: ObservableValue<string>
  private tabContents: ObservableObject<string>
  private tabNoContent: string = '<p>No artifacts where found that could be matched</p>';
  private tabToManyArtifactsContent: string = '<p>To many artifacts match name inputted in pipeline task</p>';

  constructor(props: TaskAttachmentPanelProps) {
    super(props);
    this.selectedTabId = new ObservableValue(props.attachmentClient.getArtifacts()[0].name)
    this.tabContents = new ObservableObject()
  }

  public render() {
    let attachments = this.props.attachmentClient.getAttachments()
    if (attachments.length == 0) {
      return (null)
    } else {
      let tabs = []
      
      for (let attachment of attachments) {
        let taskConfig: RunConfig = JSON.parse(attachment.content);
        
        tabs.push(<Tab name={taskConfig.TabName} id={taskConfig.ArtifactName} key={taskConfig.ArtifactName} url={taskConfig.ArtifactName} />);

        let artifacts = this.props.attachmentClient.getArtifacts().filter(art => art.name === taskConfig.ArtifactName);
        if (artifacts.length < 1) {
          this.tabContents.add(taskConfig.ArtifactName, this.tabNoContent);
        } else if (artifacts.length > 1) {
          this.tabContents.add(taskConfig.ArtifactName, this.tabToManyArtifactsContent);
        } else {
          artifacts[0].getFileContentsFromZip(`${taskConfig.ArtifactName}/${taskConfig.HtmlEntrypoint}`)
            .then((fileContents: string) => {
              this.tabContents.add(taskConfig.ArtifactName, fileContents);
            });
        }
      }
      
      return (
        <div className="flex-column">
          <div></div>
          {
            attachments.length > 0 ?
              <TabBar
                onSelectedTabChanged={this.onSelectedTabChanged}
                selectedTabId={this.selectedTabId}
                tabSize={TabSize.Tall}>
                {tabs}
              </TabBar>
              : null
          }
          <Observer myObservableValue={this.selectedTabId} tabContents={this.tabContents}>
            {
              (props: { myObservableValue: string }) => {
                return <iframe className="full-fill" srcDoc={this.tabContents.get(props.myObservableValue)}></iframe>;
              }
            }
          </Observer>
        </div >
      );
    }
  }

  private onSelectedTabChanged = (newTabId: string) => {
    this.selectedTabId.value = newTabId;
  }
}
