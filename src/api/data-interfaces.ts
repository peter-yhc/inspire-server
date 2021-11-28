/* eslint-disable no-unused-vars */
export enum DatabaseCollections {
  Projects = 'Projects',
  ProjectRoleMappings = 'ProjectRoleMappings',
  Images = 'Images'
}

export interface IFocus {
  name: string;
  uid: string;
}

export interface ICollection {
  name: string;
  uid: string;
  focuses: IFocus[];
}

export interface IProject {
  name: string;
  uid: string;
  collections: ICollection[]
}

export interface IProjectRoleMapping {
  userId: string;
  projectUid: string;
  role: string;
}

export interface IImage {
  projectUid: string;
  locationUid: string;
  src: string;
  uid: string;
  addedDate: string;
  comment?: string;
  metadata?: {
    favourite: boolean;
  }
}

export type ProjectRole = 'Owner' | 'Editor' | 'Observer';
