import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { AppliedCustomFilters, IAppliedCustomFiltersProps } from './';
import { ICustomFilterOptions } from '../../providers/dataTable/interfaces';

const appliedCustomFilters: ICustomFilterOptions[] = [
  {
    id: 'Id_1',
    name: 'Name_1',
    isApplied: false,
  },
  {
    id: 'Id_2',
    name: 'Name_2',
    isApplied: false,
  },
  {
    id: 'Id_3',
    name: 'Name_3',
    isApplied: false,
  },
  {
    id: 'Id_4',
    name: 'Name_4',
    isApplied: false,
  },
];

export default {
  title: 'Components/AppliedCustomFilters',
  component: AppliedCustomFilters,
  argTypes: {
    label: {
      description: 'Overwritten description',
      table: {
        type: {
          summary: 'Something short',
          detail: 'Something really really long',
        },
      },
      control: {
        type: null,
      },
    },
  },
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IAppliedCustomFiltersProps> = args => (
  <AppliedCustomFilters appliedCustomFilterOptions={appliedCustomFilters} />
);

// Reuse that template for creating different stories
export const Primary = Template.bind({});
Primary.args = { listName: 'Gender', listNamespace: 'Shesha.Core', width: 200, base: '' };
