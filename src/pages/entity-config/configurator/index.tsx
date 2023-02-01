import { DeleteOutlined, MergeCellsOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Checkbox, Col, Form, message, Modal, Row } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import { Autocomplete, ModelConfigurator, Page } from '../../../components';
import IndexToolbar from '../../../components/indexToolbar'
import EntityConfigTree, { IEntityConfigTreeInstance } from '../../../components/entityConfigTree';
import { IToolbarItem, PageWithLayout } from '../../../interfaces';
//import { useShaRouting } from '../../../providers';
import { IModelConfiguratorInstance } from '../../../providers/modelConfigurator/interfaces';
import { EntityConfigDto } from '../../../apis/entityConfig';
import { MetadataSourceType } from '../../../interfaces/metadata';
import { useLocalStorage } from '../../../hooks';
import { modelConfigurationsMerge } from '../../../apis/modelConfigurations';
import { useSheshaApplication, ValidationErrors } from '../../..';

export interface IEntityConfiguratorPageProps {
    id?: string;
}

interface ILoadingState {
    loading?: boolean;
    loadingText?: string;
}

const EntityConfiguratorPage: PageWithLayout<IEntityConfiguratorPageProps> = ({
    id,
}) => {
    const { backendUrl } = useSheshaApplication();
    const configuratorRef = useRef<IModelConfiguratorInstance>();
    const entityConfigTreeRef = useRef<IEntityConfigTreeInstance>();
    const [loadingState, setLoadingState] = useState<ILoadingState>({});
    const [entityConfigId, setEntityConfigId] = useState<string>(id);
    const [entityConfig, setEntityConfig] = useState<EntityConfigDto>(null);
    const [modal, contextHolder] = Modal.useModal();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isDeleteAfterMerge, setIsDeleteAfterMerge] = useLocalStorage('shaEntityConfigPage.isDeleteAfterMerge', false);
    const [autocompleteResult, setAutocompleteResult] = useState(null);
    const [mergeError, setMergeError] = useState(null);

    const onChange = (item: EntityConfigDto) => {
        setEntityConfigId(item.id);
        setEntityConfig(item);
        if (configuratorRef.current) configuratorRef.current.changeModelId(item.id);
    }

    const handleOk = () => {
        const del =  isDeleteAfterMerge && !(entityConfig?.source == MetadataSourceType.ApplicationCode)
        modelConfigurationsMerge({sourceId: entityConfig.id, destinationId: autocompleteResult.id, deleteAfterMerge: del},{ base: backendUrl})
            .then(response => {
                if (response.success) {
                    if (del) entityConfigTreeRef.current.refresh(autocompleteResult.id);
                    onChange(response.result);
                    message.success('Configurations merged successfully');
                    setIsModalOpen(false);
                } else
                    setMergeError(response.error);
            })
            .catch(e => {
                setMergeError({ message: 'Failed to load model', details: e });
            });
    }

    const allowDelete = useMemo(() => {
        return entityConfig && (entityConfig.source == MetadataSourceType.UserDefined || entityConfig.notImplemented);
    }, [entityConfig])

    const toolbarItems: IToolbarItem[] = [
        {
            title: 'Create new entity',
            icon: <PlusOutlined />,
            onClick: () => {
                setEntityConfigId('');
                configuratorRef.current.createNew({source: MetadataSourceType.UserDefined});
            },
        },
        {
            title: 'Merge entity to...',
            icon: <MergeCellsOutlined />,
            disabled: !entityConfig,
            onClick: () => {
                setAutocompleteResult(null);
                setMergeError(null);
                setIsModalOpen(true);
            },
        },
        {
            title: 'Save',
            icon: <SaveOutlined />,
            disabled: entityConfigId == null, // Check only entityConfigId
            onClick: () => {
                if (configuratorRef.current) {
                    setLoadingState({ loading: true, loadingText: 'Saving...' });
                    configuratorRef.current.save()
                        .then((item) => {
                            if (entityConfigId === '') {
                                entityConfigTreeRef.current.refresh(item?.id);
                                setEntityConfigId(item?.id);
                            } else {
                                entityConfigTreeRef.current.update(item);
                            }
                            message.success('Configuration saved successfully');
                        })
                        .catch((error) => {
                            if (!error?.errorFields)
                                message.error('Failed to save configuration');
                        })
                        .finally(() => {
                            setLoadingState({ loading: false, loadingText: null });
                        });
                }
            },
        },
        {
            title: 'Delete',
            icon: <DeleteOutlined />,
            disabled: entityConfigId == null || !allowDelete,
            onClick: () => {
                modal.confirm({
                    content: 'Are you sure want to delete?',
                    onOk: () => {
                        if (configuratorRef.current) {
                            setLoadingState({ loading: true, loadingText: 'Saving...' });
                            configuratorRef.current.delete()
                                .then(() => {
                                    entityConfigTreeRef.current.refresh(null);
                                    setEntityConfigId(null);
                                    message.success('Configuration deleted successfully');
                                })
                                .catch((error) => {
                                    if (!error?.errorFields)
                                        message.error('Failed to delete configuration');
                                })
                                .finally(() => {
                                    setLoadingState({ loading: false, loadingText: null });
                                });
                        }
                    }
                });
            },
        },
    ];

    return (
        <Page
            title="Entity Configuration"
            description=""
            loading={loadingState.loading}
            loadingText={loadingState.loadingText}
        >
            <Row>
                <Col span='6'>
                    <div style={{minHeight: '1000px', maxHeight: '1000px', overflow:'scroll'}}>
                    <EntityConfigTree
                        onChange={onChange}
                        defaultSelected={entityConfigId}
                        entityConfigTreeRef={entityConfigTreeRef}
                    />
                    </div>
                </Col>
                <Col span='18'>
                    <IndexToolbar items={toolbarItems} />
                    <ModelConfigurator id={entityConfigId} configuratorRef={configuratorRef} />
                </Col>
            </Row>
            <div>{contextHolder}</div>
            <Modal title="Merge entity confifurations" open={isModalOpen} onOk={handleOk} onCancel={() => {setIsModalOpen(false)}}>
                <ValidationErrors error={mergeError}/>
                <Row>
                    <Col span='6'>
                        <Form.Item>
                            Merge from:
                        </Form.Item>
                    </Col>
                    <Col span='18'>
                        {entityConfig &&
                        <Form.Item>
                            {entityConfig?.namespace}. {entityConfig?.className}
                        </Form.Item>}
                    </Col>
                </Row>
                <Row>
                    <Col span='6'>
                        <Form.Item>
                            Merge to:
                        </Form.Item>
                    </Col>
                    <Col span='18'>
                        <Form.Item>
                            <Autocomplete dataSourceType={'url'} dataSourceUrl={"/api/services/app/EntityConfig/EntityConfigAutocomplete"} value={autocompleteResult} onChange={setAutocompleteResult}/>
                        </Form.Item>
                    </Col>
                </Row>
                {!(entityConfig?.source == MetadataSourceType.ApplicationCode) &&
                <Row>
                    <Col span='6'>
                        <Form.Item>
                            Delete after merge:
                        </Form.Item>
                    </Col>
                    <Col span='18'>
                        <Form.Item>
                            <Checkbox 
                                checked={isDeleteAfterMerge} 
                                onChange={(e) => {setIsDeleteAfterMerge(e.target.checked);}} />
                        </Form.Item>
                    </Col>
                </Row>
                }
            </Modal>
        </Page>
    );
};

export default EntityConfiguratorPage;