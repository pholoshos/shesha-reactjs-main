import React, { FC } from 'react';
import { Collapse, Skeleton } from 'antd';
import { CollapseProps } from 'antd/lib/collapse';
import classNames from 'classnames';

const { Panel } = Collapse;

export interface ICollapsiblePanelProps extends CollapseProps {
  isActive?: boolean;
  header?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  showArrow?: boolean;
  forceRender?: boolean;
  disabled?: boolean;
  extra?: React.ReactNode;
  noContentPadding?: boolean;
  loading?: boolean;
}

export const CollapsiblePanel: FC<ICollapsiblePanelProps> = ({
  expandIconPosition = 'right',
  onChange,
  header,
  extra,
  children,
  noContentPadding,
  loading,
  className,
  style,
}) => {
  // Prevent the CollapsiblePanel from collapsing every time you click anywhere on the extra and header
  const onContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event?.stopPropagation();

  return (
    <Collapse
      defaultActiveKey={['1']}
      onChange={onChange}
      expandIconPosition={expandIconPosition}
      className={classNames('sha-collapsible-panel', className, { 'no-content-padding': noContentPadding })}
      style={style}
    >
      <Panel
        header={
          <span className={`ant-collapse-header-text`} onClick={onContainerClick}>
            {header || ' '}
          </span>
        }
        key="1"
        extra={<span onClick={onContainerClick}>{extra}</span>}
      >
        <Skeleton loading={loading}>{children}</Skeleton>
      </Panel>
    </Collapse>
  );
};

export default CollapsiblePanel;
