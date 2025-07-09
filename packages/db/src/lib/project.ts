import { Primitive } from "./utils/get-custom-fields.js";

export interface Project {
  name: string;
  root: string;
  sourceRoot: string;
  type: string;
  customFields: Record<string, Primitive>;
  tags: string[];
  targets: string[];
  dependencies: string[];
  implicitDependencies: string[];
  dependedByProjects: string[];
}

export interface FlatProject {
  [key: string]: Primitive,
  name: string;
  root: string;
  sourceRoot: string;
  type: string;
  tags: string[];
  targets: string[];
  dependencies: string[];
  implicitDependencies: string[];
  dependedByProjects: string[];
}

export type ProjectsMap = Record<string, Project>;

export function flattenProject(project: Project): FlatProject {
  const {
    name,
    root,
    sourceRoot,
    type,
    tags,
    targets,
    dependencies,
    implicitDependencies,
    dependedByProjects
  } = project;

  return {
    ...project.customFields,
    name,
    root,
    sourceRoot,
    type,
    tags,
    targets,
    dependencies,
    implicitDependencies,
    dependedByProjects
  };
}