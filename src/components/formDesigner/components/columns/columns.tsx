import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { SplitCellsOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import ColumnsSettings from './columnsSettings';
import ComponentsContainer from '../../componentsContainer';
import { useForm } from '../../../../providers';
import { nanoid } from 'nanoid/non-secure';

export interface IColumnProps {
  id: string;
  flex: number;
  offset: number;
  push: number;
  pull: number;
  components: IConfigurableFormComponent[];
}

export interface IColumnsComponentProps extends IConfigurableFormComponent {
  columns: IColumnProps[];
  gutterX?: number;
  gutterY?: number;
}

const ColumnsComponent: IToolboxComponent<IColumnsComponentProps> = {
  type: 'columns',
  name: 'Columns',
  icon: <SplitCellsOutlined />,
  factory: model => {
    const { isComponentHidden } = useForm();
    const { columns, gutterX = 0, gutterY = 0 } = model as IColumnsComponentProps;

    if (isComponentHidden(model)) return null;

    return (
      <Row gutter={[gutterX, gutterY]}>
        {columns &&
          columns.map((col, index) => (
            <Col
              key={index}
              md={col.flex}
              offset={col.offset}
              pull={col.pull}
              push={col.push}
              className="sha-designer-column"
            >
              <ComponentsContainer
                containerId={col.id}
                style={{ display: 'unset' }}
                dynamicComponents={
                  model?.isDynamic ? col?.components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []
                }
              />
            </Col>
          ))}
      </Row>
    );
  },
  initModel: model => {
    const tabsModel: IColumnsComponentProps = {
      ...model,
      name: 'custom Name',
      columns: [
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
      ],
      gutterX: 12,
      gutterY: 12,
    };

    return tabsModel;
  },
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <ColumnsSettings
        readOnly={readOnly}
        model={model as IColumnsComponentProps}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
  customContainerNames: ['columns'],
};

export default ColumnsComponent;
