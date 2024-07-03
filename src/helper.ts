import { v4 as uuidv4 } from "uuid";
export const removeString = (string: string) => {
  return string.replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "");
};
export const genUUID = () => {
  return uuidv4();
};
