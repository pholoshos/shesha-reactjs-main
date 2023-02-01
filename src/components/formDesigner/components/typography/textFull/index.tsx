import { LineHeightOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
import { ParagraphProps } from 'antd/lib/typography/Paragraph';
import { TextProps } from 'antd/lib/typography/Text';
import { TitleProps } from 'antd/lib/typography/Title';
import React from 'react';
import { ColorResult } from 'react-color';
import { validateConfigurableComponentSettings } from '../../../../../formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../interfaces/formDesigner';
import { useForm, useSubForm } from '../../../../../providers';
import { evaluateString, getStyle } from '../../../../../providers/form/utils';
import { getFontSizeStyle, TypographyFontSize } from '../utils';
import { ITypographyProps } from './models';
import { settingsFormMarkup } from './settings';

const { Title, Paragraph, Text } = Typography;

declare const TITLE_ELE_LIST: [1, 2, 3, 4, 5];

type LevelType = typeof TITLE_ELE_LIST[number];

export interface ITitleProps extends IConfigurableFormComponent {
  textType: 'span' | 'paragraph' | 'title';
  content: string;
  contentType: 'secondary' | 'success' | 'warning' | 'danger' | 'custom';
  color?: ColorResult;
  level?: LevelType | TypographyFontSize;
  code?: boolean;
  italic?: boolean;
  copyable?: boolean;
  delete?: boolean;
  ellipsis?: boolean;
  mark?: boolean;
  underline?: boolean;
  keyboard?: boolean;
  strong?: boolean;
}

const TypographyComponent: IToolboxComponent<ITitleProps> = {
  type: 'textFull',
  name: 'Text (Full)',
  icon: <LineHeightOutlined />,
  tooltip: 'Complete Typography component that combines Text, Paragraph and Title',
  factory: ({ textType, contentType, color, level, ...model }: ITitleProps) => {
    const { formData, formMode } = useForm();
    const { value } = useSubForm();
    const data = value || formData;

    const fontSizeStyle = typeof level === 'string' ? getFontSizeStyle(level) : {};

    const baseProps: ITypographyProps = {
      code: model?.code,
      copyable: model?.copyable,
      delete: model?.delete,
      ellipsis: model?.ellipsis,
      mark: model?.mark,
      underline: model?.underline,
      keyboard: model?.keyboard,
      italic: model?.italic,
      type: contentType !== 'custom' ? contentType : null,
      style: {
        margin: 'unset',
        ...fontSizeStyle,
        ...(getStyle(model.style, data) || {}),
        color: contentType === 'custom' && color ? color.hex : null,
      },
    };

    const textProps: TextProps = {
      ...baseProps,
      strong: model?.strong,
    };

    const paragraphProps: ParagraphProps = {
      ...baseProps,
      strong: model?.strong,
    };

    const titleProps: TitleProps = {
      ...baseProps,
      level: level ? (Number(level) as LevelType) : 1,
    };

    const content = evaluateString(model?.content, data);

    if (!content && formMode === 'designer') {
      return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
    }

    if (textType === 'span') return <Text {...textProps}>{content}</Text>;

    if (textType === 'paragraph') return <Paragraph {...paragraphProps}>{content}</Paragraph>;

    return <Title {...titleProps}>{content}</Title>;
  },
  settingsFormMarkup,
  validateSettings: model => validateConfigurableComponentSettings(settingsFormMarkup, model),
  initModel: model => ({
    code: false,
    copyable: false,
    delete: false,
    disabled: false,
    ellipsis: false,
    mark: false,
    italic: false,
    underline: false,
    level: 1,
    ...model,
  }),
};

export default TypographyComponent;
