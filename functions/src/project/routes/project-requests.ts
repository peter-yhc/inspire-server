import {
  ICollection, IFocus, IProject, ProjectRole,
} from '../../api/data-interfaces';

export interface ICreateProject {
  name: string;
}

export interface ICreateCollection {
  name: string;
}

export interface ICreateFocus {
  name: string;
}

export interface IAddUserToProject {
  userEmail: string;
  role: ProjectRole;
}

export interface IRemoveUserFromProject {
  userEmail: string;
}

export interface IFocusResponse extends Omit<IFocus, 'createdAt'> {
  createdAt: Date;
  lastActive: Date | null;
  imageCount: number;
}

export interface ICollectionResponse extends Omit<ICollection, 'createdAt' | 'focuses'> {
  createdAt: Date;
  lastActive: Date | null;
  imageCount: number;
  focuses: IFocusResponse[];
}

export interface IProjectResponse extends Omit<IProject, 'createdAt' | 'collections'> {
  createdAt: Date;
  collections: ICollectionResponse[]
}
