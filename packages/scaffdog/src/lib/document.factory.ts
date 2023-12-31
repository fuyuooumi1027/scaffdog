import merge from 'deepmerge';
import isPlainObject from 'is-plain-obj';
import type { PartialDeep } from 'type-fest';
import type { Document } from './document.js';

export const createDocument = (props: PartialDeep<Document> = {}): Document =>
  merge(
    {
      name: '',
      root: '',
      output: '',
      ignore: [],
      questions: new Map(),
      path: '',
      templates: [],
      variables: new Map(),
    },
    props as any,
    {
      isMergeableObject: isPlainObject,
    },
  );
