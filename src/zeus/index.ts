/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';
export const HOST = "https://graphqlzero.almansi.me/api"



const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json();
};

export const apiFetch = (options: fetchOptions) => (query: string, variables: Record<string, unknown> = {}) => {
  const fetchOptions = options[1] || {};
  if (fetchOptions.method && fetchOptions.method === 'GET') {
    return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  }
  return fetch(`${options[0]}`, {
    body: JSON.stringify({ query, variables }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...fetchOptions,
  })
    .then(handleFetchResponse)
    .then((response: GraphQLResponse) => {
      if (response.errors) {
        throw new GraphQLError(response);
      }
      return response.data;
    });
};




export const apiSubscription = (options: chainOptions) => (query: string) => {
  try {
    const queryString = options[0] + '?query=' + encodeURIComponent(query);
    const wsString = queryString.replace('http', 'ws');
    const host = (options.length > 1 && options[1]?.websocket?.[0]) || wsString;
    const webSocketOptions = options[1]?.websocket || [host];
    const ws = new WebSocket(...webSocketOptions);
    return {
      ws,
      on: (e: (args: any) => void) => {
        ws.onmessage = (event: any) => {
          if (event.data) {
            const parsed = JSON.parse(event.data);
            const data = parsed.data;
            return e(data);
          }
        };
      },
      off: (e: (args: any) => void) => {
        ws.onclose = e;
      },
      error: (e: (args: any) => void) => {
        ws.onerror = e;
      },
      open: (e: () => void) => {
        ws.onopen = e;
      },
    };
  } catch {
    throw new Error('No websockets implemented');
  }
};






export const InternalsBuildQuery = (
  props: AllTypesPropsType,
  returns: ReturnTypesType,
  ops: Operations,
  options?: OperationOptions,
) => {
  const ibb = (k: string, o: InputValueType | VType, p = '', root = true): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt(props, returns, ops, options?.variables?.values)(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const hasVariables = root && options?.variables?.$params ? `(${options.variables?.$params})` : '';
    const keyForDirectives = o.__directives ? `${k} ${o.__directives}` : k;
    return `${keyForDirectives}${hasOperationName}${hasVariables}{${Object.entries(o)
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false))
      .join('\n')}}`;
  };
  return ibb;
};










export const Thunder = (fn: FetchFunction) => <
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
) => <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions) =>
  fullChainConstruct(fn)(operation)(o as any, ops) as Promise<InputType<GraphQLTypes[R], Z>>;

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder = (fn: SubscriptionFunction) => <
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
) => <Z extends ValueTypes[R]>(o: Z | ValueTypes[R], ops?: OperationOptions) =>
  fullSubscriptionConstruct(fn)(operation)(o as any, ops) as SubscriptionToGraphQL<Z, GraphQLTypes[R]>;

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>
>(
  operation: O,
  o: Z | ValueTypes[R],
  ops?: OperationOptions,
) => InternalsBuildQuery(AllTypesProps, ReturnTypes, Ops, ops)(operation, o as any);
export const Selector = <T extends keyof ValueTypes>(key: T) => ZeusSelect<ValueTypes[T]>();

export const Gql = Chain(HOST);






export const fullChainConstruct = (fn: FetchFunction) => (t: 'query' | 'mutation' | 'subscription') => (
  o: Record<any, any>,
  options?: OperationOptions,
) => {
  const builder = InternalsBuildQuery(AllTypesProps, ReturnTypes, Ops, options);
  return fn(builder(t, o), options?.variables?.values);
};






export const fullSubscriptionConstruct = (fn: SubscriptionFunction) => (t: 'query' | 'mutation' | 'subscription') => (
  o: Record<any, any>,
  options?: OperationOptions,
) => {
  const builder = InternalsBuildQuery(AllTypesProps, ReturnTypes, Ops, options);
  return fn(builder(t, o));
};





export type AllTypesPropsType = {
  [x: string]:
    | undefined
    | boolean
    | {
        [x: string]:
          | undefined
          | string
          | {
              [x: string]: string | undefined;
            };
      };
};

export type ReturnTypesType = {
  [x: string]:
    | {
        [x: string]: string | undefined;
      }
    | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
      [x: string]: ZeusArgsType;
    }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string | undefined>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, any>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  variables?: VariableInput;
  operationName?: string;
};
export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;


export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');




const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (typeof propsP1 === 'boolean' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'object') {
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = (
  props: AllTypesPropsType,
  returns: ReturnTypesType,
  ops: Operations,
  variables?: Record<string, unknown>,
) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (a.startsWith('$') && variables?.[a.slice(1)]) {
        return a;
      }
      const checkType = ResolveFromPath(props, returns, ops)(p);
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};




export const resolverFor = <X, T extends keyof ValueTypes, Z extends keyof ValueTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ValueTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : any,
) => fn as (args?: any, source?: any) => any;


export type SelectionFunction<V> = <T>(t: T | V) => T;
export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;




export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
type IsArray<T, U> = T extends Array<infer R> ? InputType<R, U>[] : InputType<T, U>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string;

type IsInterfaced<SRC extends DeepAnify<DST>, DST> = FlattenArray<SRC> extends ZEUS_INTERFACES | ZEUS_UNIONS
  ? {
      [P in keyof SRC]: SRC[P] extends '__union' & infer R
        ? P extends keyof DST
          ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P]>
          : Record<string, unknown>
        : never;
    }[keyof DST] &
      {
        [P in keyof Omit<
          Pick<
            SRC,
            {
              [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
            }[keyof DST]
          >,
          '__typename'
        >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? SRC[P] : IsArray<SRC[P], DST[P]>;
      }
  : {
      [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver ? SRC[P] : IsArray<SRC[P], DST[P]>;
    };

export type MapType<SRC, DST> = SRC extends DeepAnify<DST> ? IsInterfaced<SRC, DST> : never;
export type InputType<SRC, DST> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
      [P in keyof R]: MapType<SRC, R[P]>[keyof MapType<SRC, R[P]>];
    } &
      MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>>
  : MapType<SRC, IsPayLoad<DST>>;
export type SubscriptionToGraphQL<Z, T> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z>; errors?: string[] }) => void) => void;
  open: () => void;
};


export const useZeusVariables = <T>(variables: T) => <
  Z extends {
    [P in keyof T]: unknown;
  }
>(
  values: Z,
) => {
  return {
    $params: Object.keys(variables)
      .map((k) => `$${k}: ${variables[k as keyof T]}`)
      .join(', '),
    $: <U extends keyof Z>(variable: U) => {
      return (`$${variable}` as unknown) as Z[U];
    },
    values,
  };
};

export type VariableInput = {
  $params: ReturnType<ReturnType<typeof useZeusVariables>>['$params'];
  values: Record<string, unknown>;
};


type ZEUS_INTERFACES = never
type ZEUS_UNIONS = never

export type ValueTypes = {
    ["Query"]: AliasType<{
	_?:boolean | `@${string}`,
albums?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["AlbumsPage"]],
album?: [{	id: string},ValueTypes["Album"]],
comments?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["CommentsPage"]],
comment?: [{	id: string},ValueTypes["Comment"]],
photos?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["PhotosPage"]],
photo?: [{	id: string},ValueTypes["Photo"]],
posts?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["PostsPage"]],
post?: [{	id: string},ValueTypes["Post"]],
todos?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["TodosPage"]],
todo?: [{	id: string},ValueTypes["Todo"]],
users?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["UsersPage"]],
user?: [{	id: string},ValueTypes["User"]],
		__typename?: boolean | `@${string}`
}>;
	["PageQueryOptions"]: {
	paginate?: ValueTypes["PaginateOptions"] | undefined | null,
	slice?: ValueTypes["SliceOptions"] | undefined | null,
	sort?: Array<ValueTypes["SortOptions"] | undefined | null> | undefined | null,
	operators?: Array<ValueTypes["OperatorOptions"] | undefined | null> | undefined | null,
	search?: ValueTypes["SearchOptions"] | undefined | null
};
	["PaginateOptions"]: {
	page?: number | undefined | null,
	limit?: number | undefined | null
};
	["SliceOptions"]: {
	start?: number | undefined | null,
	end?: number | undefined | null,
	limit?: number | undefined | null
};
	["SortOptions"]: {
	field?: string | undefined | null,
	order?: ValueTypes["SortOrderEnum"] | undefined | null
};
	["SortOrderEnum"]:SortOrderEnum;
	["OperatorOptions"]: {
	kind?: ValueTypes["OperatorKindEnum"] | undefined | null,
	field?: string | undefined | null,
	value?: string | undefined | null
};
	["OperatorKindEnum"]:OperatorKindEnum;
	["SearchOptions"]: {
	q?: string | undefined | null
};
	["AlbumsPage"]: AliasType<{
	data?:ValueTypes["Album"],
	links?:ValueTypes["PaginationLinks"],
	meta?:ValueTypes["PageMetadata"],
		__typename?: boolean | `@${string}`
}>;
	["Album"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	user?:ValueTypes["User"],
photos?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["PhotosPage"]],
		__typename?: boolean | `@${string}`
}>;
	["User"]: AliasType<{
	id?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	username?:boolean | `@${string}`,
	email?:boolean | `@${string}`,
	address?:ValueTypes["Address"],
	phone?:boolean | `@${string}`,
	website?:boolean | `@${string}`,
	company?:ValueTypes["Company"],
posts?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["PostsPage"]],
albums?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["AlbumsPage"]],
todos?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["TodosPage"]],
		__typename?: boolean | `@${string}`
}>;
	["Address"]: AliasType<{
	street?:boolean | `@${string}`,
	suite?:boolean | `@${string}`,
	city?:boolean | `@${string}`,
	zipcode?:boolean | `@${string}`,
	geo?:ValueTypes["Geo"],
		__typename?: boolean | `@${string}`
}>;
	["Geo"]: AliasType<{
	lat?:boolean | `@${string}`,
	lng?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["Company"]: AliasType<{
	name?:boolean | `@${string}`,
	catchPhrase?:boolean | `@${string}`,
	bs?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PostsPage"]: AliasType<{
	data?:ValueTypes["Post"],
	links?:ValueTypes["PaginationLinks"],
	meta?:ValueTypes["PageMetadata"],
		__typename?: boolean | `@${string}`
}>;
	["Post"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	body?:boolean | `@${string}`,
	user?:ValueTypes["User"],
comments?: [{	options?: ValueTypes["PageQueryOptions"] | undefined | null},ValueTypes["CommentsPage"]],
		__typename?: boolean | `@${string}`
}>;
	["CommentsPage"]: AliasType<{
	data?:ValueTypes["Comment"],
	links?:ValueTypes["PaginationLinks"],
	meta?:ValueTypes["PageMetadata"],
		__typename?: boolean | `@${string}`
}>;
	["Comment"]: AliasType<{
	id?:boolean | `@${string}`,
	name?:boolean | `@${string}`,
	email?:boolean | `@${string}`,
	body?:boolean | `@${string}`,
	post?:ValueTypes["Post"],
		__typename?: boolean | `@${string}`
}>;
	["PaginationLinks"]: AliasType<{
	first?:ValueTypes["PageLimitPair"],
	prev?:ValueTypes["PageLimitPair"],
	next?:ValueTypes["PageLimitPair"],
	last?:ValueTypes["PageLimitPair"],
		__typename?: boolean | `@${string}`
}>;
	["PageLimitPair"]: AliasType<{
	page?:boolean | `@${string}`,
	limit?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["PageMetadata"]: AliasType<{
	totalCount?:boolean | `@${string}`,
		__typename?: boolean | `@${string}`
}>;
	["TodosPage"]: AliasType<{
	data?:ValueTypes["Todo"],
	links?:ValueTypes["PaginationLinks"],
	meta?:ValueTypes["PageMetadata"],
		__typename?: boolean | `@${string}`
}>;
	["Todo"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	completed?:boolean | `@${string}`,
	user?:ValueTypes["User"],
		__typename?: boolean | `@${string}`
}>;
	["PhotosPage"]: AliasType<{
	data?:ValueTypes["Photo"],
	links?:ValueTypes["PaginationLinks"],
	meta?:ValueTypes["PageMetadata"],
		__typename?: boolean | `@${string}`
}>;
	["Photo"]: AliasType<{
	id?:boolean | `@${string}`,
	title?:boolean | `@${string}`,
	url?:boolean | `@${string}`,
	thumbnailUrl?:boolean | `@${string}`,
	album?:ValueTypes["Album"],
		__typename?: boolean | `@${string}`
}>;
	["UsersPage"]: AliasType<{
	data?:ValueTypes["User"],
	links?:ValueTypes["PaginationLinks"],
	meta?:ValueTypes["PageMetadata"],
		__typename?: boolean | `@${string}`
}>;
	["Mutation"]: AliasType<{
	_?:boolean | `@${string}`,
createAlbum?: [{	input: ValueTypes["CreateAlbumInput"]},ValueTypes["Album"]],
updateAlbum?: [{	id: string,	input: ValueTypes["UpdateAlbumInput"]},ValueTypes["Album"]],
deleteAlbum?: [{	id: string},boolean | `@${string}`],
createComment?: [{	input: ValueTypes["CreateCommentInput"]},ValueTypes["Comment"]],
updateComment?: [{	id: string,	input: ValueTypes["UpdateCommentInput"]},ValueTypes["Comment"]],
deleteComment?: [{	id: string},boolean | `@${string}`],
createPhoto?: [{	input: ValueTypes["CreatePhotoInput"]},ValueTypes["Photo"]],
updatePhoto?: [{	id: string,	input: ValueTypes["UpdatePhotoInput"]},ValueTypes["Photo"]],
deletePhoto?: [{	id: string},boolean | `@${string}`],
createPost?: [{	input: ValueTypes["CreatePostInput"]},ValueTypes["Post"]],
updatePost?: [{	id: string,	input: ValueTypes["UpdatePostInput"]},ValueTypes["Post"]],
deletePost?: [{	id: string},boolean | `@${string}`],
createTodo?: [{	input: ValueTypes["CreateTodoInput"]},ValueTypes["Todo"]],
updateTodo?: [{	id: string,	input: ValueTypes["UpdateTodoInput"]},ValueTypes["Todo"]],
deleteTodo?: [{	id: string},boolean | `@${string}`],
createUser?: [{	input: ValueTypes["CreateUserInput"]},ValueTypes["User"]],
updateUser?: [{	id: string,	input: ValueTypes["UpdateUserInput"]},ValueTypes["User"]],
deleteUser?: [{	id: string},boolean | `@${string}`],
		__typename?: boolean | `@${string}`
}>;
	["CreateAlbumInput"]: {
	title: string,
	userId: string
};
	["UpdateAlbumInput"]: {
	title?: string | undefined | null,
	userId?: string | undefined | null
};
	["CreateCommentInput"]: {
	name: string,
	email: string,
	body: string
};
	["UpdateCommentInput"]: {
	name?: string | undefined | null,
	email?: string | undefined | null,
	body?: string | undefined | null
};
	["CreatePhotoInput"]: {
	title: string,
	url: string,
	thumbnailUrl: string
};
	["UpdatePhotoInput"]: {
	title?: string | undefined | null,
	url?: string | undefined | null,
	thumbnailUrl?: string | undefined | null
};
	["CreatePostInput"]: {
	title: string,
	body: string
};
	["UpdatePostInput"]: {
	title?: string | undefined | null,
	body?: string | undefined | null
};
	["CreateTodoInput"]: {
	title: string,
	completed: boolean
};
	["UpdateTodoInput"]: {
	title?: string | undefined | null,
	completed?: boolean | undefined | null
};
	["CreateUserInput"]: {
	name: string,
	username: string,
	email: string,
	address?: ValueTypes["AddressInput"] | undefined | null,
	phone?: string | undefined | null,
	website?: string | undefined | null,
	company?: ValueTypes["CompanyInput"] | undefined | null
};
	["AddressInput"]: {
	street?: string | undefined | null,
	suite?: string | undefined | null,
	city?: string | undefined | null,
	zipcode?: string | undefined | null,
	geo?: ValueTypes["GeoInput"] | undefined | null
};
	["GeoInput"]: {
	lat?: number | undefined | null,
	lng?: number | undefined | null
};
	["CompanyInput"]: {
	name?: string | undefined | null,
	catchPhrase?: string | undefined | null,
	bs?: string | undefined | null
};
	["UpdateUserInput"]: {
	name?: string | undefined | null,
	username?: string | undefined | null,
	email?: string | undefined | null,
	address?: ValueTypes["AddressInput"] | undefined | null,
	phone?: string | undefined | null,
	website?: string | undefined | null,
	company?: ValueTypes["CompanyInput"] | undefined | null
};
	["CacheControlScope"]:CacheControlScope;
	/** The `Upload` scalar type represents a file upload. */
["Upload"]:unknown
  }

export type ModelTypes = {
    ["Query"]: {
		_?: number | undefined,
	albums?: GraphQLTypes["AlbumsPage"] | undefined,
	album?: GraphQLTypes["Album"] | undefined,
	comments?: GraphQLTypes["CommentsPage"] | undefined,
	comment?: GraphQLTypes["Comment"] | undefined,
	photos?: GraphQLTypes["PhotosPage"] | undefined,
	photo?: GraphQLTypes["Photo"] | undefined,
	posts?: GraphQLTypes["PostsPage"] | undefined,
	post?: GraphQLTypes["Post"] | undefined,
	todos?: GraphQLTypes["TodosPage"] | undefined,
	todo?: GraphQLTypes["Todo"] | undefined,
	users?: GraphQLTypes["UsersPage"] | undefined,
	user?: GraphQLTypes["User"] | undefined
};
	["PageQueryOptions"]: GraphQLTypes["PageQueryOptions"];
	["PaginateOptions"]: GraphQLTypes["PaginateOptions"];
	["SliceOptions"]: GraphQLTypes["SliceOptions"];
	["SortOptions"]: GraphQLTypes["SortOptions"];
	["SortOrderEnum"]: GraphQLTypes["SortOrderEnum"];
	["OperatorOptions"]: GraphQLTypes["OperatorOptions"];
	["OperatorKindEnum"]: GraphQLTypes["OperatorKindEnum"];
	["SearchOptions"]: GraphQLTypes["SearchOptions"];
	["AlbumsPage"]: {
		data?: Array<GraphQLTypes["Album"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Album"]: {
		id?: string | undefined,
	title?: string | undefined,
	user?: GraphQLTypes["User"] | undefined,
	photos?: GraphQLTypes["PhotosPage"] | undefined
};
	["User"]: {
		id?: string | undefined,
	name?: string | undefined,
	username?: string | undefined,
	email?: string | undefined,
	address?: GraphQLTypes["Address"] | undefined,
	phone?: string | undefined,
	website?: string | undefined,
	company?: GraphQLTypes["Company"] | undefined,
	posts?: GraphQLTypes["PostsPage"] | undefined,
	albums?: GraphQLTypes["AlbumsPage"] | undefined,
	todos?: GraphQLTypes["TodosPage"] | undefined
};
	["Address"]: {
		street?: string | undefined,
	suite?: string | undefined,
	city?: string | undefined,
	zipcode?: string | undefined,
	geo?: GraphQLTypes["Geo"] | undefined
};
	["Geo"]: {
		lat?: number | undefined,
	lng?: number | undefined
};
	["Company"]: {
		name?: string | undefined,
	catchPhrase?: string | undefined,
	bs?: string | undefined
};
	["PostsPage"]: {
		data?: Array<GraphQLTypes["Post"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Post"]: {
		id?: string | undefined,
	title?: string | undefined,
	body?: string | undefined,
	user?: GraphQLTypes["User"] | undefined,
	comments?: GraphQLTypes["CommentsPage"] | undefined
};
	["CommentsPage"]: {
		data?: Array<GraphQLTypes["Comment"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Comment"]: {
		id?: string | undefined,
	name?: string | undefined,
	email?: string | undefined,
	body?: string | undefined,
	post?: GraphQLTypes["Post"] | undefined
};
	["PaginationLinks"]: {
		first?: GraphQLTypes["PageLimitPair"] | undefined,
	prev?: GraphQLTypes["PageLimitPair"] | undefined,
	next?: GraphQLTypes["PageLimitPair"] | undefined,
	last?: GraphQLTypes["PageLimitPair"] | undefined
};
	["PageLimitPair"]: {
		page?: number | undefined,
	limit?: number | undefined
};
	["PageMetadata"]: {
		totalCount?: number | undefined
};
	["TodosPage"]: {
		data?: Array<GraphQLTypes["Todo"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Todo"]: {
		id?: string | undefined,
	title?: string | undefined,
	completed?: boolean | undefined,
	user?: GraphQLTypes["User"] | undefined
};
	["PhotosPage"]: {
		data?: Array<GraphQLTypes["Photo"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Photo"]: {
		id?: string | undefined,
	title?: string | undefined,
	url?: string | undefined,
	thumbnailUrl?: string | undefined,
	album?: GraphQLTypes["Album"] | undefined
};
	["UsersPage"]: {
		data?: Array<GraphQLTypes["User"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Mutation"]: {
		_?: number | undefined,
	createAlbum?: GraphQLTypes["Album"] | undefined,
	updateAlbum?: GraphQLTypes["Album"] | undefined,
	deleteAlbum?: boolean | undefined,
	createComment?: GraphQLTypes["Comment"] | undefined,
	updateComment?: GraphQLTypes["Comment"] | undefined,
	deleteComment?: boolean | undefined,
	createPhoto?: GraphQLTypes["Photo"] | undefined,
	updatePhoto?: GraphQLTypes["Photo"] | undefined,
	deletePhoto?: boolean | undefined,
	createPost?: GraphQLTypes["Post"] | undefined,
	updatePost?: GraphQLTypes["Post"] | undefined,
	deletePost?: boolean | undefined,
	createTodo?: GraphQLTypes["Todo"] | undefined,
	updateTodo?: GraphQLTypes["Todo"] | undefined,
	deleteTodo?: boolean | undefined,
	createUser?: GraphQLTypes["User"] | undefined,
	updateUser?: GraphQLTypes["User"] | undefined,
	deleteUser?: boolean | undefined
};
	["CreateAlbumInput"]: GraphQLTypes["CreateAlbumInput"];
	["UpdateAlbumInput"]: GraphQLTypes["UpdateAlbumInput"];
	["CreateCommentInput"]: GraphQLTypes["CreateCommentInput"];
	["UpdateCommentInput"]: GraphQLTypes["UpdateCommentInput"];
	["CreatePhotoInput"]: GraphQLTypes["CreatePhotoInput"];
	["UpdatePhotoInput"]: GraphQLTypes["UpdatePhotoInput"];
	["CreatePostInput"]: GraphQLTypes["CreatePostInput"];
	["UpdatePostInput"]: GraphQLTypes["UpdatePostInput"];
	["CreateTodoInput"]: GraphQLTypes["CreateTodoInput"];
	["UpdateTodoInput"]: GraphQLTypes["UpdateTodoInput"];
	["CreateUserInput"]: GraphQLTypes["CreateUserInput"];
	["AddressInput"]: GraphQLTypes["AddressInput"];
	["GeoInput"]: GraphQLTypes["GeoInput"];
	["CompanyInput"]: GraphQLTypes["CompanyInput"];
	["UpdateUserInput"]: GraphQLTypes["UpdateUserInput"];
	["CacheControlScope"]: GraphQLTypes["CacheControlScope"];
	/** The `Upload` scalar type represents a file upload. */
["Upload"]:any
    }

export type GraphQLTypes = {
    ["Query"]: {
	__typename: "Query",
	_?: number | undefined,
	albums?: GraphQLTypes["AlbumsPage"] | undefined,
	album?: GraphQLTypes["Album"] | undefined,
	comments?: GraphQLTypes["CommentsPage"] | undefined,
	comment?: GraphQLTypes["Comment"] | undefined,
	photos?: GraphQLTypes["PhotosPage"] | undefined,
	photo?: GraphQLTypes["Photo"] | undefined,
	posts?: GraphQLTypes["PostsPage"] | undefined,
	post?: GraphQLTypes["Post"] | undefined,
	todos?: GraphQLTypes["TodosPage"] | undefined,
	todo?: GraphQLTypes["Todo"] | undefined,
	users?: GraphQLTypes["UsersPage"] | undefined,
	user?: GraphQLTypes["User"] | undefined
};
	["PageQueryOptions"]: {
		paginate?: GraphQLTypes["PaginateOptions"] | undefined,
	slice?: GraphQLTypes["SliceOptions"] | undefined,
	sort?: Array<GraphQLTypes["SortOptions"] | undefined> | undefined,
	operators?: Array<GraphQLTypes["OperatorOptions"] | undefined> | undefined,
	search?: GraphQLTypes["SearchOptions"] | undefined
};
	["PaginateOptions"]: {
		page?: number | undefined,
	limit?: number | undefined
};
	["SliceOptions"]: {
		start?: number | undefined,
	end?: number | undefined,
	limit?: number | undefined
};
	["SortOptions"]: {
		field?: string | undefined,
	order?: GraphQLTypes["SortOrderEnum"] | undefined
};
	["SortOrderEnum"]: SortOrderEnum;
	["OperatorOptions"]: {
		kind?: GraphQLTypes["OperatorKindEnum"] | undefined,
	field?: string | undefined,
	value?: string | undefined
};
	["OperatorKindEnum"]: OperatorKindEnum;
	["SearchOptions"]: {
		q?: string | undefined
};
	["AlbumsPage"]: {
	__typename: "AlbumsPage",
	data?: Array<GraphQLTypes["Album"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Album"]: {
	__typename: "Album",
	id?: string | undefined,
	title?: string | undefined,
	user?: GraphQLTypes["User"] | undefined,
	photos?: GraphQLTypes["PhotosPage"] | undefined
};
	["User"]: {
	__typename: "User",
	id?: string | undefined,
	name?: string | undefined,
	username?: string | undefined,
	email?: string | undefined,
	address?: GraphQLTypes["Address"] | undefined,
	phone?: string | undefined,
	website?: string | undefined,
	company?: GraphQLTypes["Company"] | undefined,
	posts?: GraphQLTypes["PostsPage"] | undefined,
	albums?: GraphQLTypes["AlbumsPage"] | undefined,
	todos?: GraphQLTypes["TodosPage"] | undefined
};
	["Address"]: {
	__typename: "Address",
	street?: string | undefined,
	suite?: string | undefined,
	city?: string | undefined,
	zipcode?: string | undefined,
	geo?: GraphQLTypes["Geo"] | undefined
};
	["Geo"]: {
	__typename: "Geo",
	lat?: number | undefined,
	lng?: number | undefined
};
	["Company"]: {
	__typename: "Company",
	name?: string | undefined,
	catchPhrase?: string | undefined,
	bs?: string | undefined
};
	["PostsPage"]: {
	__typename: "PostsPage",
	data?: Array<GraphQLTypes["Post"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Post"]: {
	__typename: "Post",
	id?: string | undefined,
	title?: string | undefined,
	body?: string | undefined,
	user?: GraphQLTypes["User"] | undefined,
	comments?: GraphQLTypes["CommentsPage"] | undefined
};
	["CommentsPage"]: {
	__typename: "CommentsPage",
	data?: Array<GraphQLTypes["Comment"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Comment"]: {
	__typename: "Comment",
	id?: string | undefined,
	name?: string | undefined,
	email?: string | undefined,
	body?: string | undefined,
	post?: GraphQLTypes["Post"] | undefined
};
	["PaginationLinks"]: {
	__typename: "PaginationLinks",
	first?: GraphQLTypes["PageLimitPair"] | undefined,
	prev?: GraphQLTypes["PageLimitPair"] | undefined,
	next?: GraphQLTypes["PageLimitPair"] | undefined,
	last?: GraphQLTypes["PageLimitPair"] | undefined
};
	["PageLimitPair"]: {
	__typename: "PageLimitPair",
	page?: number | undefined,
	limit?: number | undefined
};
	["PageMetadata"]: {
	__typename: "PageMetadata",
	totalCount?: number | undefined
};
	["TodosPage"]: {
	__typename: "TodosPage",
	data?: Array<GraphQLTypes["Todo"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Todo"]: {
	__typename: "Todo",
	id?: string | undefined,
	title?: string | undefined,
	completed?: boolean | undefined,
	user?: GraphQLTypes["User"] | undefined
};
	["PhotosPage"]: {
	__typename: "PhotosPage",
	data?: Array<GraphQLTypes["Photo"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Photo"]: {
	__typename: "Photo",
	id?: string | undefined,
	title?: string | undefined,
	url?: string | undefined,
	thumbnailUrl?: string | undefined,
	album?: GraphQLTypes["Album"] | undefined
};
	["UsersPage"]: {
	__typename: "UsersPage",
	data?: Array<GraphQLTypes["User"] | undefined> | undefined,
	links?: GraphQLTypes["PaginationLinks"] | undefined,
	meta?: GraphQLTypes["PageMetadata"] | undefined
};
	["Mutation"]: {
	__typename: "Mutation",
	_?: number | undefined,
	createAlbum?: GraphQLTypes["Album"] | undefined,
	updateAlbum?: GraphQLTypes["Album"] | undefined,
	deleteAlbum?: boolean | undefined,
	createComment?: GraphQLTypes["Comment"] | undefined,
	updateComment?: GraphQLTypes["Comment"] | undefined,
	deleteComment?: boolean | undefined,
	createPhoto?: GraphQLTypes["Photo"] | undefined,
	updatePhoto?: GraphQLTypes["Photo"] | undefined,
	deletePhoto?: boolean | undefined,
	createPost?: GraphQLTypes["Post"] | undefined,
	updatePost?: GraphQLTypes["Post"] | undefined,
	deletePost?: boolean | undefined,
	createTodo?: GraphQLTypes["Todo"] | undefined,
	updateTodo?: GraphQLTypes["Todo"] | undefined,
	deleteTodo?: boolean | undefined,
	createUser?: GraphQLTypes["User"] | undefined,
	updateUser?: GraphQLTypes["User"] | undefined,
	deleteUser?: boolean | undefined
};
	["CreateAlbumInput"]: {
		title: string,
	userId: string
};
	["UpdateAlbumInput"]: {
		title?: string | undefined,
	userId?: string | undefined
};
	["CreateCommentInput"]: {
		name: string,
	email: string,
	body: string
};
	["UpdateCommentInput"]: {
		name?: string | undefined,
	email?: string | undefined,
	body?: string | undefined
};
	["CreatePhotoInput"]: {
		title: string,
	url: string,
	thumbnailUrl: string
};
	["UpdatePhotoInput"]: {
		title?: string | undefined,
	url?: string | undefined,
	thumbnailUrl?: string | undefined
};
	["CreatePostInput"]: {
		title: string,
	body: string
};
	["UpdatePostInput"]: {
		title?: string | undefined,
	body?: string | undefined
};
	["CreateTodoInput"]: {
		title: string,
	completed: boolean
};
	["UpdateTodoInput"]: {
		title?: string | undefined,
	completed?: boolean | undefined
};
	["CreateUserInput"]: {
		name: string,
	username: string,
	email: string,
	address?: GraphQLTypes["AddressInput"] | undefined,
	phone?: string | undefined,
	website?: string | undefined,
	company?: GraphQLTypes["CompanyInput"] | undefined
};
	["AddressInput"]: {
		street?: string | undefined,
	suite?: string | undefined,
	city?: string | undefined,
	zipcode?: string | undefined,
	geo?: GraphQLTypes["GeoInput"] | undefined
};
	["GeoInput"]: {
		lat?: number | undefined,
	lng?: number | undefined
};
	["CompanyInput"]: {
		name?: string | undefined,
	catchPhrase?: string | undefined,
	bs?: string | undefined
};
	["UpdateUserInput"]: {
		name?: string | undefined,
	username?: string | undefined,
	email?: string | undefined,
	address?: GraphQLTypes["AddressInput"] | undefined,
	phone?: string | undefined,
	website?: string | undefined,
	company?: GraphQLTypes["CompanyInput"] | undefined
};
	["CacheControlScope"]: CacheControlScope;
	/** The `Upload` scalar type represents a file upload. */
["Upload"]: any
    }
export const enum SortOrderEnum {
	ASC = "ASC",
	DESC = "DESC"
}
export const enum OperatorKindEnum {
	GTE = "GTE",
	LTE = "LTE",
	NE = "NE",
	LIKE = "LIKE"
}
export const enum CacheControlScope {
	PUBLIC = "PUBLIC",
	PRIVATE = "PRIVATE"
}