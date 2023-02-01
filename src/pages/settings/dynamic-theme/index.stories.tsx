import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ConfigurableThemePage, { IConfigurableThemePageProps } from '.';
import StoryApp from '../../../components/storyBookApp';

export default {
  title: 'Pages/ConfigurableThemePage',
  component: ConfigurableThemePage,
  argTypes: {},
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IConfigurableThemePageProps> = args => (
  <StoryApp>
    <ConfigurableThemePage {...args} />
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

Basic.args = {};
