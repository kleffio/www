export type ProjectRequestModel = {
  name: string;
  description?: string;
  repositoryUrl?: string;
  branch?: string;
  dockerComposePath?: string;
};
