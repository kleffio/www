export type ContainerRequest = {
  projectID: string;
  name: string;
  image: string;
  port: number;
  repoUrl: string;
  branch: string;
  envVariables?: Record<string, string>;
};
