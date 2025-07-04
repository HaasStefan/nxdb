import { Primitive } from "./utils/get-custom-fields.js";

export interface Project {
  name: string;
  root: string;
  customFields: Record<string, Primitive>;
  tags: string[];
  targetNames: string[];
  dependencies: string[];
  dependedByProjects: string[];
}

export type ProjectsMap = Record<string, Project>;