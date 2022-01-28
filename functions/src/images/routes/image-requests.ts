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
  newLocationUuid?: string;
  comment?: string;
  metadata?: {
    favourite: boolean;
  }
}

export interface IMoveBatchImages {
  imageUids: string[];
  newLocationUid: string;
}
