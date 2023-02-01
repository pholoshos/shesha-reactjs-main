import React, { FC } from 'react';
import ConfigurableFormRenderer from './configurableFormRenderer';
import { IConfigurableFormProps } from './models';
import { FormProvider } from '../../providers/form';
import ConfigurableComponent from '../appConfigurator/configurableComponent';
import EditViewMsg from '../appConfigurator/editViewMsg';
import { useAppConfigurator, useShaRouting, useSheshaApplication } from '../../providers';
import classNames from 'classnames';
import { FormPersisterConsumer, FormPersisterProvider } from '../../providers/formPersisterProvider';
import { FormMarkupConverter } from '../../providers/formMarkupConverter';
import { FormIdentifier, FormRawMarkup, IFormSettings } from '../../providers/form/models';
import { convertToMarkupWithSettings } from '../../providers/form/utils';
import { Card } from 'antd';
import { IPersistedFormProps } from '../../providers/formPersisterProvider/models';
import { ConfigurationItemVersionStatusMap, FORM_STATUS_MAPPING } from '../../utils/configurationFramework/models';
import { getFormFullName } from '../../utils/form';
import StatusTag from '../statusTag';
import HelpTextPopover from '../helpTextPopover';
import { BlockOutlined, CloseOutlined } from '@ant-design/icons';

export const ConfigurableForm: FC<IConfigurableFormProps> = props => {
  const { formId, markup, mode, actions, sections, context, formRef, refetchData, formProps, ...restProps } = props;
  const { switchApplicationMode, formInfoBlockVisible, toggleShowInfoBlock } = useAppConfigurator();
  const app = useSheshaApplication();

  const canConfigure = Boolean(app.routes.formsDesigner) && Boolean(formId);
  const { router } = useShaRouting(false) ?? {};

  const getDesignerUrl = (fId: FormIdentifier) => {
    return typeof fId === 'string'
      ? `${app.routes.formsDesigner}?id=${fId}`
      : Boolean(fId?.name)
      ? `${app.routes.formsDesigner}?module=${fId.module}&name=${fId.name}`
      : null;
  };
  const formDesignerUrl = getDesignerUrl(formId);
  const openInDesigner = () => {
    if (formDesignerUrl && router) {
      router.push(formDesignerUrl).then(() => switchApplicationMode('live'));
    }
  };

  const markupWithSettings = convertToMarkupWithSettings(markup);

  const renderWithMarkup = (
    providedMarkup: FormRawMarkup,
    formSettings: IFormSettings,
    persistedFormProps?: IPersistedFormProps
  ) => {
    if (!providedMarkup) return null;

    const formStatusInfo = persistedFormProps?.versionStatus
      ? ConfigurationItemVersionStatusMap[persistedFormProps.versionStatus]
      : null;

    const showFormInfo = Boolean(persistedFormProps) && formInfoBlockVisible && formStatusInfo;

    return (
      <FormMarkupConverter markup={providedMarkup}>
        {flatComponents => (
          <FormProvider
            name="Form"
            flatComponents={flatComponents}
            formSettings={formSettings}
            mode={mode}
            form={restProps.form}
            actions={actions}
            sections={sections}
            context={context}
            formRef={formRef}
            onValuesChange={restProps.onValuesChange}
            refetchData={refetchData}
            isActionsOwner={props.isActionsOwner}
          >
            {showFormInfo && (
              <Card
                className="sha-form-info-card"
                bordered
                title={
                  <>
                    {persistedFormProps.id && (
                      <a target="_blank" href={getDesignerUrl(persistedFormProps.id)}>
                        <BlockOutlined title="Click to open this form in the designer" />
                      </a>
                    )}
                    <span className="sha-form-info-card-title">
                      Form: {getFormFullName(persistedFormProps.module, persistedFormProps.name)} v
                      {persistedFormProps.versionNo}
                    </span>
                    {false && <HelpTextPopover content={persistedFormProps.description}></HelpTextPopover>}
                    <StatusTag
                      value={persistedFormProps.versionStatus}
                      mappings={FORM_STATUS_MAPPING}
                      color={null}
                    ></StatusTag>
                  </>
                }
                extra={<CloseOutlined onClick={() => toggleShowInfoBlock(false)} title="Click to hide form info" />}
                size="small"
              ></Card>
            )}
            <ConfigurableFormRenderer {...restProps} />
          </FormProvider>
        )}
      </FormMarkupConverter>
    );
  };

  return (
    <ConfigurableComponent canConfigure={canConfigure} onStartEdit={openInDesigner}>
      {(componentState, BlockOverlay) => (
        <div className={classNames(componentState.wrapperClassName, props?.className)}>
          <BlockOverlay>
            <EditViewMsg />
          </BlockOverlay>
          {markup ? (
            renderWithMarkup(markupWithSettings.components, markupWithSettings.formSettings, formProps)
          ) : (
            <FormPersisterProvider formId={formId}>
              <FormPersisterConsumer>
                {persister => renderWithMarkup(persister.markup, persister.formSettings, persister.formProps)}
              </FormPersisterConsumer>
            </FormPersisterProvider>
          )}
        </div>
      )}
    </ConfigurableComponent>
  );
};

export default ConfigurableForm;
