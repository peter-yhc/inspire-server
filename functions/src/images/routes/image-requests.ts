export interface IUploadImage {
  projectUid: string;
  locationUid: string;
  src: string;
}

export interface IDeleteImages {
  uids: string[]
}