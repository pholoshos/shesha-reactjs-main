import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import EditableTagGroup, { IEditableTagGroupProps } from './';

export default {
  title: 'Components/EditableTagGroup',
  component: EditableTagGroup,
} as Meta;

const INITIAL_VaLUES = ['app:Configurator', 'app:Roles', 'app:Dashboard'];

//#region Default
const BasicTemplate: Story<IEditableTagGroupProps> = args => {
  const [values, setValues] = useState(INITIAL_VaLUES);

  return <EditableTagGroup {...args} value={values} onChange={setValues} />;
};

export const Basic = BasicTemplate.bind({});
//#endregion
