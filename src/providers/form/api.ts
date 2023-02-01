import { nanoid } from "nanoid";
import { useEffect, useMemo, useRef, useState } from "react";
import { GetDataError, useGet } from "restful-react";
import { componentsTreeToFlatStructure, IToolboxComponents, removeZeroWidthCharsFromString, useAppConfigurator, useMetadataDispatcher, useSheshaApplication } from "../..";
import { IAjaxResponseBase } from "../../interfaces/ajaxResponse";
import { IErrorInfo } from "../../interfaces/errorInfo";
import { IAbpWrappedGetEntityResponse } from "../../interfaces/gql";
import { IPropertyMetadata } from "../../interfaces/metadata";
import { EntityAjaxResponse, IEntity } from "../../pages/dynamic/interfaces";
import { useConfigurationItemsLoader } from "../configurationItemsLoader";
import { IMetadataDispatcherActionsContext } from "../metadataDispatcher/contexts";
import { FormIdentifier, FormMarkupWithSettings, FormRawMarkup, IFormDto, IFormSettings } from "./models";
import { asFormFullName, asFormRawId, getComponentsFromMarkup, useFormDesignerComponents } from "./utils";
import * as RestfulShesha from '../../utils/fetchers';
import { ConfigurationItemsViewMode } from "../appConfigurator/models";

/**
 * Form configuration DTO
 */
export interface FormConfigurationDto {
    id?: string;
    /**
     * Form path/id is used to identify a form
     */
    moduleId?: string | null;
    /**
     * Form name
     */
    name?: string | null;
    /**
     * Label
     */
    label?: string | null;
    /**
     * Description
     */
    description?: string | null;
    /**
     * Markup in JSON format
     */
    markup?: string | null;
    /**
     * Type of the form model
     */
    modelType?: string | null;
    /**
     * Version number
     */
    versionNo?: number;
    /**
     * Version status
     */
    versionStatus?: number;
    /**
     * Cache MD5, is used for client-side caching
     */
    cacheMd5?: string | null;
}

export interface IFormFetcherProps {
    lazy: boolean;
}
export interface IFormByIdProps {
    id: string;
}
export interface IFormByNameProps {
    module?: string;
    name: string;
    version?: number;
}
export type UseFormConfigurationByIdArgs = IFormByIdProps & IFormFetcherProps;
export type UseFormConfigurationByNameArgs = IFormByNameProps & IFormFetcherProps;
export type UseFormConfigurationArgs = {
    formId: FormIdentifier;
} & IFormFetcherProps;

export interface IUseFormConfigurationProps {
    id?: string;
    module?: string;
    name: string;
    version?: number;
    lazy: boolean;
}

export type FormProperties = Omit<FormConfigurationDto, 'markup'>;

export interface IFormMarkupResponse {
    requestParams: any;
    formConfiguration: IFormDto;
    loading: boolean;
    error: GetDataError<IAjaxResponseBase>;
    refetch: () => Promise<FormMarkupWithSettings>;
}

interface IGetFormByNamePayload {
    module?: string;
    name: string;
    version?: number;
}

interface IGetFormByIdPayload {
    id: string;
}

const getMarkupFromResponse = (data: IAbpWrappedGetEntityResponse<FormConfigurationDto>): FormMarkupWithSettings => {
    const markupJson = data?.result?.markup;
    return markupJson
        ? JSON.parse(markupJson) as FormMarkupWithSettings
        : null;
}

/**
 * Load form markup from the back-end
 */
export const useFormConfiguration = (args: UseFormConfigurationArgs): IFormMarkupResponse => {

    const { configurationItemMode } = useAppConfigurator();

    const requestParams = useMemo(() => {
        const formRawId = asFormRawId(args.formId);
        const formFullName = asFormFullName(args.formId);

        if (formRawId)
            return {
                url: '/api/services/Shesha/FormConfiguration/Get',
                queryParams: { id: formRawId }
            };

        if (formFullName)
            return {
                url: '/api/services/Shesha/FormConfiguration/GetByName',
                queryParams: { name: formFullName.name, module: formFullName.module, version: formFullName.version }
            };

        return null;
    }, [args.formId, configurationItemMode]);

    const canFetch = Boolean(requestParams && requestParams.url);
    const fetcher = useGet<IAbpWrappedGetEntityResponse<FormConfigurationDto>, IAjaxResponseBase, IGetFormByIdPayload | IGetFormByNamePayload>(
        requestParams?.url ?? '',
        { queryParams: requestParams?.queryParams, lazy: !args.lazy || !canFetch }
    );

    useEffect(() => {
        if (fetcher.data && canFetch)
            reFetcher();
    }, [configurationItemMode]);

    const formConfiguration = useMemo<IFormDto>(() => {
        if (fetcher?.data?.result) {
            const markupWithSettings = getMarkupFromResponse(fetcher?.data);
            return {
                ...fetcher?.data?.result,
                markup: markupWithSettings?.components,
                settings: markupWithSettings?.formSettings
            };
        } else
            return null;
    }, [args.formId, fetcher?.data]);

    const reFetch = () => {
        return fetcher.refetch({ path: requestParams.url, queryParams: requestParams.queryParams });
    }

    const reFetcher = () => {
        return canFetch
            ? reFetch().then(response => {
                return getMarkupFromResponse(response);
            })
            : Promise.reject('Can`t fetch form due to internal state');
    };

    const result: IFormMarkupResponse = {
        formConfiguration: formConfiguration,
        loading: fetcher.loading,
        error: fetcher.error,
        refetch: reFetcher,
        requestParams: requestParams
    };
    return result;
}

export interface UseFormWitgDataArgs {
    formId?: FormIdentifier;
    dataId?: string;
    configurationItemMode?: ConfigurationItemsViewMode;
    onFormLoaded?: (form: IFormDto) => void;
    onDataLoaded?: (data: any) => void;
}
export interface FormWithDataResponse {
    form?: IFormDto;
    fetchedData?: IEntity;
    loadingState: LoadingState;
    loaderHint?: string;
    error?: IErrorInfo;
    dataFetcher?: () => Promise<EntityAjaxResponse | void>;
}
export interface FormWithDataState {
    loaderHint?: string;
    loadingState: LoadingState;
    fetchedData?: IEntity;
    form?: IFormDto;
    error?: IErrorInfo;
    dataFetcher?: () => Promise<EntityAjaxResponse | void>;
}

export type LoadingState = 'waiting' | 'loading' | 'ready' | 'failed';

export const useFormWithData = (args: UseFormWitgDataArgs): FormWithDataResponse => {
    const { formId, dataId, configurationItemMode } = args;
    const { getForm } = useConfigurationItemsLoader();
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const [state, setState] = useState<FormWithDataState>({ loadingState: 'waiting' });
    const { getMetadata, getContainerProperties } = useMetadataDispatcher();
    const toolboxComponents = useFormDesignerComponents();

    const formRequestRef = useRef<string>();

    useEffect(() => {
        const requestId = nanoid();
        formRequestRef.current = requestId;
        if (formId) {
            setState(prev => ({ ...prev, loadingState: 'loading', loaderHint: 'Fetching form...', error: null, dataFetcher: null, form: null, fetchedData: null }));

            getForm({ formId, configurationItemMode: args.configurationItemMode, skipCache: false }).then(form => {
                if (formRequestRef.current !== requestId)
                    return;

                // apply loaded form
                setState(prev => ({ ...prev, form: form }));

                const getDataUrl = (removeZeroWidthCharsFromString(form.settings?.getUrl) || '').trim();

                if (Boolean(getDataUrl)) {
                    //console.log('LOG:getDataUrl', getDataUrl);
                    setState(prev => ({ ...prev, loaderHint: 'Fetching metadata...' }));

                    // fetch meta before the data
                    getGqlFields({
                        formMarkup: form.markup,
                        formSettings: form.settings,
                        toolboxComponents,
                        getContainerProperties,
                        getMetadata,
                    }).then(gqlFieldsList => {
                        //console.log('LOG:gqlFieldsList', gqlFieldsList);

                        if (formRequestRef.current !== requestId)
                            return;

                        var gqlFields = gqlFieldsToString(gqlFieldsList);

                        // fetch data and resolve
                        const queryParams = { properties: gqlFields };
                        if (dataId)
                            queryParams["id"] = dataId;

                        const dataFetcher = () => RestfulShesha.get<EntityAjaxResponse, any, any, any>(
                            getDataUrl,
                            queryParams,
                            { base: backendUrl, headers: httpHeaders }
                        ).then(dataResponse => {
                            if (formRequestRef.current !== requestId)
                                return null; // todo: cancel data request

                            if (dataResponse.success) {
                                setState(prev => ({
                                    ...prev,
                                    loadingState: 'ready',
                                    loaderHint: null,
                                    fetchedData: dataResponse.result,
                                }));
                            } else {
                                setState(prev => ({
                                    ...prev,
                                    loadingState: 'failed',
                                    loaderHint: null,
                                    fetchedData: null,
                                    error: dataResponse.error
                                }));
                            }
                            return dataResponse;
                        })
                            .catch(e => {
                                const error = (e as IAjaxResponseBase)?.error;
                                setState(prev => ({ ...prev, loadingState: 'failed', loaderHint: null, error: error }));
                            });

                        setState(prev => ({ ...prev, loaderHint: 'Fetching data...', dataFetcher: dataFetcher }));
                        dataFetcher();
                    });
                } else {
                    // data loading is not required
                    setState(prev => ({ ...prev, loadingState: 'ready', loaderHint: null }));
                }
            }).catch(e => {
                setState(prev => ({ ...prev, loadingState: 'failed', loaderHint: null, error: e }));
            });
        } else {
            setState(prev => ({
                ...prev,
                loadingState: 'waiting',
                loaderHint: null,
                error: null,
                form: null,
                dataFetcher: null,
                fetchedData: null
            }));
        }
        // return cleanup: clean up form and data
    }, [formId, dataId, configurationItemMode]);

    // todo: return errors

    const result: FormWithDataResponse = {
        loaderHint: state.loaderHint,
        loadingState: state.loadingState,
        form: state.form,
        fetchedData: state.fetchedData,
        error: state.error,
        dataFetcher: state.dataFetcher,
    };

    return result;
}

// just for intrenal use
interface IFieldData {
    name: string;
    child: IFieldData[];
    property: IPropertyMetadata;
}

const getFieldsFromCustomEvents = (code: string) => {
    if (!code) return [];
    const reg = new RegExp('(?<![_a-zA-Z0-9.])data.[_a-zA-Z0-9.]+', 'g');
    const matchAll = code.matchAll(reg);
    if (!matchAll) return [];
    const match = Array.from(matchAll);
    return match.map(item => item[0].replace('data.', ''));
};

const gqlFieldsToString = (fields: IFieldData[]): string => {
    const resf = (items: IFieldData[]) => {
        let s = '';
        items.forEach(item => {
            if (!item.property) return;
                s += s ? ',' + item.name : item.name;
            if (item.child.length > 0) {
                s += '{' + resf(item.child) + '}';
            }
        });

        return s;
    };

    return resf(fields);
};

interface GetFormFieldsPayload {
    formMarkup: FormRawMarkup;
    formSettings: IFormSettings;
    toolboxComponents: IToolboxComponents;
}
const getFormFields = (payload: GetFormFieldsPayload): string[] => {
    const { formMarkup, formSettings, toolboxComponents } = payload;
    if (!formMarkup) return null;

    const components = componentsTreeToFlatStructure(toolboxComponents, getComponentsFromMarkup(formMarkup))
        .allComponents;
    let fieldNames = [];
    for (const key in components) {
        fieldNames.push(components[key].name);
    }

    fieldNames = fieldNames.concat(formSettings?.fieldsToFetch ?? []);

    formMarkup.forEach(item => {
        fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.customEnabled));
        fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.customVisibility));
        fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.onBlurCustom));
        fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.onChangeCustom));
        fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.onFocusCustom));
    });
    fieldNames.push('id');

    fieldNames = [...new Set(fieldNames)];
    fieldNames = fieldNames.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    return fieldNames;
}

interface GetGqlFieldsPayload extends GetFormFieldsPayload {
    getContainerProperties: IMetadataDispatcherActionsContext['getContainerProperties'];
    getMetadata: IMetadataDispatcherActionsContext['getMetadata'];
}
const getGqlFields = (payload: GetGqlFieldsPayload): Promise<IFieldData[]> => {
    const { formMarkup, formSettings, getMetadata, getContainerProperties } = payload;

    if (!formMarkup || !formSettings.modelType)
        return Promise.resolve([]);

    return getMetadata({ modelType: formSettings.modelType }).then(metadata => {
        let fields: IFieldData[] = [];

        const fieldNames = getFormFields(payload);

        // create list of promises
        const promises: Promise<any>[] = [];

        fieldNames.forEach(item => {
            if (item) {
                item = item.trim();
                const pathParts = item.split('.');

                if (pathParts.length == 1) {
                    fields.push({
                        name: item,
                        child: [],
                        property: metadata.properties.find(p => p.path.toLowerCase() == pathParts[0].toLowerCase()),
                    });
                    return;
                }

                let parent: IFieldData = null;
                let containerPath = "";
                pathParts.forEach((part, idx) => {
                    let levelChilds = parent?.child ?? fields;
                    let field = levelChilds.find(f => f.name == part);
                    if (!field) {
                        field = {
                            name: part,
                            child: [],
                            property: idx == 0
                                ? metadata.properties.find(p => p.path.toLowerCase() == part.toLowerCase())
                                : parent?.property?.dataType == 'object'
                                    ? parent.property.properties?.find(p => p.path.toLowerCase() == part.toLowerCase())
                                    : null,
                        };
                        // If property metadata is not set - fetch it using dispatcher.
                        // Note: it's safe to fetch the same container multiple times because the dispatcher returns the same promise for all requests
                        if (!field.property) {
                            const metaPromise = getContainerProperties({ metadata: metadata, containerPath: containerPath }).then(response => {
                                field.property = response.find(p => p.path.toLowerCase() == field.name.toLowerCase());
                            });
                            // add promise to list
                            promises.push(metaPromise);
                        }

                        levelChilds.push(field);
                    }
                    containerPath += (Boolean(containerPath) ? '.' : '') + part;
                    parent = field;
                });
            }
        });

        return new Promise<IFieldData[]>((resolve) => {
            Promise.allSettled(promises).then(() => {
                resolve(fields);
            })
        });
    });
};