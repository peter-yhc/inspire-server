export interface IUploadImage {
  projectUid: string;
  locationUid: string;
  src: string;
}

export interface IDeleteImages {
  uids: string[]
}

export interface IUpdateImage {
  comment?: string;
  metadata?: {
    favourite: boolean;
  }
}
