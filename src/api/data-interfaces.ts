export interface ISubCollection {
  name: string;
  uuid: string;
}

export interface ICollection {
  name: string;
  uuid: string;
  subCollections: ISubCollection[];
}

export interface IProject {
  name: string;
  uuid: string;
  collections: ICollection[]
}
