import { BaseType, EllipsisConfig } from 'antd/lib/typography/Base';
import { CSSProperties } from 'react';

export interface ITypographyProps {
  code?: boolean;
  copyable?: boolean;
  delete?: boolean;
  ellipsis?: boolean | Omit<EllipsisConfig, 'rows' | 'expandable' | 'onExpand'>;
  mark?: boolean;
  underline?: boolean;
  keyboard?: boolean;
  italic?: boolean;
  type?: BaseType;
  style?: CSSProperties;
}
