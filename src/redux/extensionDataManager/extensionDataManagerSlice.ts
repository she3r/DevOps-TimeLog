import { ErrorHandler } from '../../helpers';
import { apiSlice } from '../apiSlice';
import { GetDocuments, CreateDocument, RemoveDocument, UpdateDocument, SetDocument } from './extensionDataManagerAPI';

const extensionDataEndpoints = apiSlice.injectEndpoints({
  endpoints(builder) {
    return {
      fetchGetDocuments: builder.query<any[], string>({
        keepUnusedDataFor: 0,
        queryFn: async (request) => {
          return { data: await GetDocuments(request) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            ErrorHandler(err);
          });
        },
        providesTags: (result, _error, collectionName) =>
          result
            ? [
                ...result.map(({ id }) => ({ type: 'extensionData' as const, id, collectionName })),
                { type: 'extensionData', id: 'LIST', collectionName },
              ]
            : [{ type: 'extensionData', id: 'LIST', collectionName }],
      }),
      fetchCreateDocument: builder.mutation<any, { collectionName: string; doc: any }>({
        queryFn: async (request) => {
          return { data: await CreateDocument(request.collectionName, request.doc) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            ErrorHandler(err);
          });
        },
        invalidatesTags: (_result, _error, { collectionName }) => [
          { type: 'extensionData', id: 'LIST', collectionName },
        ],
      }),
      fetchRemoveDocument: builder.mutation<void, { collectionName: string; id: string }>({
        queryFn: async (request) => {
          return { data: await RemoveDocument(request.collectionName, request.id) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            ErrorHandler(err);
          });
        },
        invalidatesTags: (_result, _error, { id, collectionName }) => [{ type: 'extensionData', id, collectionName }],
      }),
      fetchUpdateDocument: builder.mutation<any, { collectionName: string; doc: any }>({
        queryFn: async (request) => {
          return { data: await UpdateDocument(request.collectionName, request.doc) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            ErrorHandler(err);
          });
        },
        invalidatesTags: (_result, _error, { doc, collectionName }) => [
          { type: 'extensionData', id: doc.id, collectionName },
        ],
      }),
      fetchSetDocument: builder.mutation<any, { collectionName: string; doc: any }>({
        queryFn: async (request) => {
          return { data: await SetDocument(request.collectionName, request.doc) };
        },
        async onQueryStarted(_request, { queryFulfilled }) {
          await queryFulfilled.catch((err) => {
            ErrorHandler(err);
          });
        },
        invalidatesTags: (_result, _error, { doc, collectionName }) => [
          { type: 'extensionData', id: doc.id, collectionName },
        ],
      }),
    };
  },
});

export const {
  useFetchGetDocumentsQuery,
  useFetchCreateDocumentMutation,
  useFetchRemoveDocumentMutation,
  useFetchSetDocumentMutation,
  useFetchUpdateDocumentMutation,
} = extensionDataEndpoints;
