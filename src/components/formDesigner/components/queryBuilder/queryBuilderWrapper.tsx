import React, { FC } from 'react';
import { QueryBuilderProvider, useMetadataFields } from '../../../../providers';

export const QueryBuilderWrapper: FC = ({ children }) => {
  const fields = useMetadataFields();

  return (
    <QueryBuilderProvider fields={fields} id="QueryBuilderWrapper">
      {children}
    </QueryBuilderProvider>
  );
};
