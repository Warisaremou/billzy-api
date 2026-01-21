import { TransformFnParams } from "class-transformer";

export const lowerCaseTransformer = (params: TransformFnParams) => {
  return params.value?.toLowerCase().trim();
};
