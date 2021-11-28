/* eslint-disable no-unused-vars */
export enum DatabaseCollections {
  Projects = 'Projects',
  ProjectRoleMappings = 'ProjectRoleMappings',
  Images = 'Images'
}

export interface IFocus {
  name: string;
  uuid: string;
}

export interface ICollection {
  name: string;
  uuid: string;
  focuses: IFocus[];
}

export interface IProject {
  name: string;
  uuid: string;
  collections: ICollection[]
}

export interface IProjectRoleMapping {
  userId: string;
  projectUuid: string;
  role: string;
}

export interface IImage {
  parentUuid: string;
  src: string;
  hash: string;
  comment?: string;
  metadata?: {
    favourite: boolean;
  }
  addedDate: Date;
}

export type ProjectRole = 'Owner' | 'Editor' | 'Observer';
