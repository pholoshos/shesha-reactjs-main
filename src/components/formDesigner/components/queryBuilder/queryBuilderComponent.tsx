import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FilterOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import QueryBuilderField from './queryBuilderField';
import { useForm, useQueryBuilder, useTableViewSelectorConfigurator } from '../../../../providers';
import { validateConfigurableComponentSettings, evaluateString } from '../../../../providers/form/utils';
import { Alert, Typography } from 'antd';
import { QueryBuilderWithModelType } from './queryBuilderWithModelType';

export interface IQueryBuilderProps extends IConfigurableFormComponent {
  jsonExpanded?: boolean;
  useExpression?: boolean | string;
  modelType?: string;
  fieldsUnavailableHint?: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const QueryBuilderComponent: IToolboxComponent<IQueryBuilderProps> = {
  type: 'queryBuilder',
  name: 'Query Builder',
  icon: <FilterOutlined />,
  //dataTypes: [DataTypes.string],
  factory: (model: IQueryBuilderProps) => {
    const { formMode } = useForm();
    return (<QueryBuilder {...model} readOnly={ formMode ==='readonly' }></QueryBuilder>);
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

const QueryBuilder: FC<IQueryBuilderProps> = props => {
  const queryBuilder = useQueryBuilder(false);

  return queryBuilder ? (
    <QueryBuilderComponentRenderer {...props}></QueryBuilderComponentRenderer>
  ) : (
    <QueryBuilderWithModelType modelType={props.modelType}>
      <QueryBuilderComponentRenderer {...props}></QueryBuilderComponentRenderer>
    </QueryBuilderWithModelType>
  );
};

export const QueryBuilderComponentRenderer: FC<IQueryBuilderProps> = props => {
  const { formMode, formData } = useForm();
  const { fieldsUnavailableHint, useExpression: _useExpression } = props;
  const { selectedItemId, items } = useTableViewSelectorConfigurator(false) ?? {}; // note: it should be outside the QueryBuilder component!

  // TODO: implement combined components which support both expressions/functions and custom values like date/datetime and remove the `useExpression` property
  const useExpression =
    _useExpression === true ||
    (typeof _useExpression === 'string' && evaluateString(_useExpression, { data: formData }) === 'true') ||
    items?.find(({ id }) => id === selectedItemId)?.useExpression === true;

  const queryBuilder = useQueryBuilder(false);

  const fieldsAvailable = Boolean(queryBuilder);

  if (!fieldsAvailable && formMode === 'designer' && !fieldsUnavailableHint)
    return (
      <Alert
        className="sha-designer-warning"
        message="Fields are not available. Wrap Query Builder with a QueryBuilderProvider/MetadataProvider or specify `Model Type`"
        type="warning"
      />
    );

  const fields = queryBuilder?.fields || [];
  const fetchFields = queryBuilder?.fetchFields;

  return !fieldsAvailable && fieldsUnavailableHint ? (
    <ConfigurableFormItem model={props}>
      <Typography.Text type="secondary">{fieldsUnavailableHint}</Typography.Text>
    </ConfigurableFormItem>
  ) : (
    <ConfigurableFormItem model={props}>
      <QueryBuilderField
        fields={fields}
        fetchFields={fetchFields}
        jsonExpanded={props.jsonExpanded}
        useExpression={useExpression}
        readOnly={props.readOnly}
      />
    </ConfigurableFormItem>
  );
};

export default QueryBuilderComponent;
