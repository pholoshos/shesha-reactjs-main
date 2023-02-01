import React, { FC, useState } from 'react';
import { SidebarContainer, ConfigurableFormRenderer } from '../../components';
import { Row, Col, Divider, Typography, Space } from 'antd';
import Toolbox from './toolbox';
import FormDesignerToolbar from './formDesignerToolbar';
import ComponentPropertiesPanel from './componentPropertiesPanel';
import ComponentPropertiesTitle from './componentPropertiesTitle';
import { useForm } from '../../providers/form';
import { MetadataProvider } from '../../providers';
import ConditionalWrap from '../conditionalWrapper';
import { useFormPersister } from '../../providers/formPersisterProvider';
import { useFormDesigner } from '../../providers/formDesigner';
import StatusTag from '../statusTag';
import { FORM_STATUS_MAPPING } from '../../utils/configurationFramework/models';
import { getFormFullName } from '../../utils/form';
import HelpTextPopover from '../helpTextPopover';

const { Title } = Typography;

export const FormDesignerRenderer: FC = ({ }) => {
    const [widgetsOpen, setWidgetOpen] = useState(true);
    const [fieldPropertiesOpen, setFieldPropertiesOpen] = useState(true);
    const { formProps } = useFormPersister();

    const toggleWidgetSidebar = () => setWidgetOpen(widget => !widget);

    const toggleFieldPropertiesSidebar = () => setFieldPropertiesOpen(prop => !prop);

    const [formValues, setFormValues] = useState({});
    const { formSettings } = useForm();
    const { isDebug, readOnly } = useFormDesigner();

    const fullName = formProps
        ? getFormFullName(formProps.module, formProps.name)
        : null;
    const title = formProps?.label
        ? `${formProps.label} (${fullName})`
        : fullName;

    return (
        <div className="sha-page">
            <div className="sha-page-heading">
                <div className="sha-page-title" style={{ justifyContent: 'left' }}>
                    <Space>
                        {title && <Title level={4} style={{ margin: 'unset' }}>{title} v{formProps.versionNo}</Title>}
                        <HelpTextPopover content={formProps.description}></HelpTextPopover>
                        <StatusTag value={formProps.versionStatus} mappings={FORM_STATUS_MAPPING} color={null}></StatusTag>
                    </Space>
                </div>
            </div>
            <div className="sha-form-designer">
                <ConditionalWrap
                    condition={Boolean(formSettings.modelType)}
                    wrap={content => (
                        <MetadataProvider id="designer" modelType={formSettings.modelType}>
                            {content}
                        </MetadataProvider>
                    )}
                >
                    <FormDesignerToolbar />
                    <SidebarContainer
                        leftSidebarProps={readOnly
                            ? null
                            : {
                                open: widgetsOpen,
                                onOpen: toggleWidgetSidebar,
                                onClose: toggleWidgetSidebar,
                                title: 'Builder Widgets',
                                content: () => <Toolbox />,
                                placeholder: 'Builder Widgets',
                            }
                        }
                        rightSidebarProps={{
                            open: fieldPropertiesOpen,
                            onOpen: toggleFieldPropertiesSidebar,
                            onClose: toggleFieldPropertiesSidebar,
                            title: () => <ComponentPropertiesTitle />,
                            content: () => <ComponentPropertiesPanel />,
                            placeholder: 'Properties',
                        }}
                    >
                        <ConfigurableFormRenderer
                            onValuesChange={(_changedValues, allvalues) => {
                                setFormValues(allvalues);
                            }}
                        >
                            {isDebug && (
                                <>
                                    <Row>
                                        <Divider />
                                        <Col span={24}>
                                            <pre>{JSON.stringify(formValues, null, 2)}</pre>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </ConfigurableFormRenderer>
                    </SidebarContainer>
                </ConditionalWrap>
            </div>
        </div>
    );
};
