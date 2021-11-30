import { ProjectRole } from '../../api/data-interfaces';

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
