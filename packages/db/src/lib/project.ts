import { Primitive } from "./utils/get-custom-fields.js";

export interface Project {
  name: string;
  root: string;
  sourceRoot?: string;
  type: string;
  customFields: Record<string, Primitive>;
  tags: string[];
  targets: string[];
  dependencies: string[];
  implicitDependencies: string[];
  dependedByProjects: string[];
}

export type ProjectsMap = Record<string, Project>;