import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { GroupOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import ComponentsContainer from '../../componentsContainer';
import { useForm } from '../../../../providers/form';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';

export type ContainerDirection = 'horizontal' | 'vertical';
export type AlignItems =
  | 'baseline'
  | 'center'
  | 'end'
  | 'flex-end'
  | 'flex-start'
  | 'inherit'
  | 'initial'
  | 'normal'
  | 'revert'
  | 'self-end'
  | 'self-start'
  | 'start'
  | 'stretch'
  | 'unset';

export type JustifyContent =
  | 'center'
  | 'left'
  | 'right'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch';

export type JustifyItems =
  | 'baseline'
  | 'center'
  | 'end'
  | 'flex-end'
  | 'flex-start'
  | 'inherit'
  | 'initial'
  | 'left'
  | 'legacy'
  | 'normal'
  | 'revert'
  | 'right'
  | 'self-end'
  | 'self-start'
  | 'start'
  | 'stretch'
  | 'unset';

export interface IContainerComponentProps extends IConfigurableFormComponent {
  direction?: ContainerDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  justifyItems?: JustifyItems;
  className?: string;
  wrapperStyle?: string;
  components: IConfigurableFormComponent[]; // Only important for fluent API
}

const settingsForm = settingsFormJson as FormMarkup;

const ContainerComponent: IToolboxComponent<IContainerComponentProps> = {
  type: 'container',
  name: 'Container',
  icon: <GroupOutlined />,
  factory: (model: IContainerComponentProps) => {
    const { isComponentHidden, formData } = useForm();

    if (isComponentHidden(model)) return null;

    return (
      <ComponentsContainer
        containerId={model.id}
        direction={model.direction}
        justifyContent={model.direction === 'horizontal' ? model?.justifyContent : null}
        alignItems={model.direction === 'horizontal' ? model?.alignItems : null}
        justifyItems={model.direction === 'horizontal' ? model?.justifyItems : null}
        className={model.className}
        wrapperStyle={getStyle(model?.wrapperStyle, formData)}
        style={getStyle(model?.style, formData)}
        dynamicComponents={model?.isDynamic ? model?.components?.map(c => ({ ...c, readOnly: model?.readOnly })) : []}
      />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: (model: IContainerComponentProps) => {
    const customProps: IContainerComponentProps = {
      ...model,
      direction: 'vertical',
      justifyContent: 'left',
    };

    return customProps;
  },
};

export default ContainerComponent;
