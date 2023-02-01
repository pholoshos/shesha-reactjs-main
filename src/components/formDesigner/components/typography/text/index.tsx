import { FileTextOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
import { TextProps } from 'antd/lib/typography/Text';
import React from 'react';
import { ColorResult } from 'react-color';
import { validateConfigurableComponentSettings } from '../../../../../formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../../../interfaces/formDesigner';
import { useForm, useSubForm } from '../../../../../providers';
import { evaluateString, getStyle } from '../../../../../providers/form/utils';
import { getFontSizeStyle, TypographyFontSize } from '../utils';
import { settingsFormMarkup } from './settings';

const { Text } = Typography;

export interface ITextProps extends IConfigurableFormComponent {
  content: string;
  contentType: 'secondary' | 'success' | 'warning' | 'danger' | 'custom';
  color?: ColorResult;
  fontSize?: TypographyFontSize;
  code?: boolean;
  italic?: boolean;
  copyable?: boolean;
  keyboard?: boolean;
  delete?: boolean;
  ellipsis?: boolean;
  mark?: boolean;
  strong?: boolean;
  underline?: boolean;
}

const TextComponent: IToolboxComponent<ITextProps> = {
  type: 'text',
  name: 'Text',
  icon: <FileTextOutlined />,
  tooltip: "Deprecated! Please use 'Text (Full)'",
  factory: ({ fontSize, contentType, color, ...model }: ITextProps) => {
    const { formData, formMode } = useForm();
    const { value } = useSubForm();

    const data = value || formData;

    const fontSizeStyle = fontSize ? getFontSizeStyle(fontSize) : {};

    const props: TextProps = {
      code: model?.code,
      copyable: model?.copyable,
      delete: model?.delete,
      ellipsis: model?.ellipsis,
      mark: model?.mark,
      underline: model?.underline,
      keyboard: model?.keyboard,
      strong: model?.strong,
      italic: model?.italic,
      type: contentType !== 'custom' ? contentType : null,
      style: {
        margin: 'unset',
        ...fontSizeStyle,
        ...(getStyle(model.style, data) || {}),
        color: contentType === 'custom' && color ? color.hex : null,
      },
    };

    const content = evaluateString(model?.content, data);

    if (!content && formMode === 'designer') {
      return <Alert type="warning" message="Please make sure you enter the content to be displayed here!" />;
    }

    return <Text {...props}>{content}</Text>;
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
    keyboard: false,
    strong: false,
    ...model,
  }),
};

export default TextComponent;
