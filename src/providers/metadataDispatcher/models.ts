import { IModelMetadata } from "../../interfaces/metadata";
import { IMetadataProviderRegistration } from "./contexts";

export interface IProperty {
  name: string;
  displayName: string;
  description?: string;
}

export interface IModelsDictionary {
  [key: string]: Promise<IModelMetadata>;
}

export interface IProvidersDictionary {
  [key: string]: IMetadataProviderRegistration;
}