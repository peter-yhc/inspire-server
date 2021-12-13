export interface IUploadImage {
  projectUid: string;
  locationUid: string;
  fileName: string;
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
