import { DocStatusEnum } from "./StatusEnum";
import { User } from "./User";

export interface Document {
  "creator": User,
  "id": string,
  "name": string,
  "status": DocStatusEnum,
  "fileUrl": string,
  "updatedAt": string,
  "createdAt": string
}