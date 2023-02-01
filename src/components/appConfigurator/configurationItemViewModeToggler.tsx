import React, { FC, ReactNode, useMemo } from 'react';
import { BlockOutlined } from '@ant-design/icons';
import { useAppConfigurator } from '../../providers';
import { PHONE_LG_SIZE_QUERY } from '../../constants/media-queries';
import { useMediaQuery } from 'react-responsive';
import { Divider, Space, Switch, Dropdown, Tag, Typography, MenuProps } from 'antd';
import { ConfigurationItemsViewMode } from '../../providers/appConfigurator/models';

const { Text } = Typography;

export interface IAppEditModeTogglerProps { }

interface IConfigurationItemModeSummary {
  mode: ConfigurationItemsViewMode,
  label: string,
  description?: ReactNode | string,
  color: string,
}
const ConfigurationItemModes: IConfigurationItemModeSummary[] = [
  {
    mode: 'live',
    label: 'Live',
    description: (
      <Text type="secondary">
        <>
          Display only published versions of configuration items.
          <br />
          It's a default view for regular users.
        </>
      </Text>
    ),
    color: '#87d068'
  },
  {
    mode: 'ready',
    label: 'Ready',
    description: 'Display ready versions where available with fallback to live',
    color: '#4DA6FF'
  },
  {
    mode: 'latest',
    label: 'Latest',
    description: 'Display latest versions of configuration items irrespectively of their status',
    color: '#b4b4b4'
  },
];

export const ConfigurationItemViewModeToggler: FC<IAppEditModeTogglerProps> = () => {
  const { 
    configurationItemMode, 
    switchConfigurationItemMode,
    formInfoBlockVisible,
    toggleShowInfoBlock,
  } = useAppConfigurator();

  const hideEdit = useMediaQuery({
    query: PHONE_LG_SIZE_QUERY,
  });

  if (hideEdit)
    return null;

  const menuItems = useMemo<MenuProps['items']>(() => {
    return ConfigurationItemModes.map(item => (
      {
        key: item.mode,
        label: (
          <div>
            <Tag color={item.color} style={{ cursor: "pointer" }}>
              {item.label}
            </Tag>
            {item.description && (
              <>
                <br />
                <Text type="secondary">{item.description}</Text>
              </>
            )}
          </div>
        ),
        onClick: () => { switchConfigurationItemMode(item.mode) },        
      })
    );
  }, [configurationItemMode]);

  const currentMode = useMemo(() => {
    return ConfigurationItemModes.find(m => m.mode === configurationItemMode);
  }, [configurationItemMode]);

  return (
    <Dropdown
      menu={{ items: menuItems, selectable: true, selectedKeys: [configurationItemMode] }}
      className="sha-config-item-mode-toggler"
      trigger={['click']}
      dropdownRender={menu => (
        <div className="dropdown-content">
          {menu}
          <Divider style={{ margin: 0 }} />
          <Space style={{ padding: 8 }}>
            <Switch checked={formInfoBlockVisible} onChange={(checked) => toggleShowInfoBlock(checked)}/> Show form info
          </Space>
        </div>
      )}
    >
      <Tag
        color={currentMode?.color}
        icon={<BlockOutlined />}
        style={{ cursor: "pointer", margin: 0 }}
        title="Click to change view mode"
      >
        { currentMode?.label ?? 'unknown' }
      </Tag>
    </Dropdown>
  );
};

export default ConfigurationItemViewModeToggler;
