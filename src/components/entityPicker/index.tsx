import { EllipsisOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Select, Skeleton } from 'antd';
import { DefaultOptionType } from 'antd/lib/select';
import _, { isEmpty } from 'lodash';
import { nanoid } from 'nanoid/non-secure';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useMedia } from 'react-use';
import { IAnyObject, IEntityReferenceDto } from '../../interfaces';
import { useForm, useGlobalState, useModal } from '../../providers';
import DataTableProvider, { useDataTable } from '../../providers/dataTable';
import { evaluateDynamicFilters, hasDynamicFilter } from '../../providers/dataTable/utils';
import { IModalProps } from '../../providers/dynamicModal/models';
import { useEntitySelectionData } from '../../utils/entity';
import GlobalTableFilter from '../globalTableFilter';
import camelCaseKeys from 'camelcase-keys';
import IndexTable from '../indexTable';
import ReadOnlyDisplayFormItem from '../readOnlyDisplayFormItem';
import TablePager from '../tablePager';
import { IEntityPickerProps, IEntityPickerState } from './models';

const UNIQUE_ID = 'HjHi0UVD27o8Ub8zfz6dH';

export const EntityPicker = ({ displayEntityKey = '_displayName', ...restProps }: IEntityPickerProps) => {
  return restProps.readOnly ? (
    <EntityPickerReadOnly {...restProps} displayEntityKey={displayEntityKey} />
  ) : (
    <EntityPickerEditable {...restProps} displayEntityKey={displayEntityKey} />
  );
};

const getIdFromValue  = (value: string | IEntityReferenceDto) => {
  return (value as IEntityReferenceDto)?.id ?? value as string
}

const getSelectionFromValue = (value: string | string[] | IEntityReferenceDto | IEntityReferenceDto[]) => {
  return Array.isArray(value) 
    ? value.map<string>(item => { return getIdFromValue(item); })
    : getIdFromValue(value)
}

export const EntityPickerReadOnly = (props: IEntityPickerProps) => {
  const { entityType, displayEntityKey, value } = props;

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: getSelectionFromValue(value)
  });
  const selectedItems = selection?.rows;

  const displayText = useMemo(() => {
    return selectedItems?.map(ent => ent[displayEntityKey]).join(', ');
  }, [selectedItems]);

  return selection.loading ? <Skeleton paragraph={false} active /> : <ReadOnlyDisplayFormItem value={displayText} />;
};

export const EntityPickerEditableInner = (props: IEntityPickerProps) => {
  const {
    entityType,
    displayEntityKey,
    filters,
    onChange,
    disabled,
    loading,
    value,
    useRawValues,
    mode,
    size,
    useButtonPicker,
    pickerButtonProps,
    onSelect,
    defaultValue,
    title = 'Select Item',
    addNewRecordsProps,
    configurableColumns,
    width,
  } = props;

  const [modalId] = useState(nanoid()); // use generated value because formId was changed. to be reviewed
  const [state, setState] = useState<IEntityPickerState>({
    showModal: false,
  });
  const isSmall = useMedia('(max-width: 480px)');

  const {
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    registerConfigurableColumns,
    setPredefinedFilters,
  } = useDataTable();
  const { globalState } = useGlobalState();
  const { formData } = useForm();
  const selectRef = useRef(undefined);

  useEffect(() => {
    registerConfigurableColumns(modalId, configurableColumns);
  }, [configurableColumns]);

  const showPickerDialog = () => setState(prev => ({ ...prev, showModal: true }));

  const hidePickerDialog = () => setState(prev => ({ ...prev, showModal: false }));

  const selection = useEntitySelectionData({
    entityType: entityType,
    propertyName: displayEntityKey,
    selection: getSelectionFromValue(value)
  });
  const selectedItems = selection?.rows;

  const modalProps: IModalProps = {
    id: modalId,
    isVisible: false,
    formId: addNewRecordsProps?.modalFormId,
    title: addNewRecordsProps?.modalTitle,
    showModalFooter: addNewRecordsProps?.showModalFooter,
    submitHttpVerb: addNewRecordsProps?.submitHttpVerb,
    onSuccessRedirectUrl: addNewRecordsProps?.onSuccessRedirectUrl,
    width: addNewRecordsProps?.modalWidth,
    onSubmitted: (localValue: any) => {
      if (onDblClick) {
        onDblClick(localValue);
      }
    },
  };

  const dynamicModal = useModal(modalProps);

  const selectedMode = mode === 'single' ? undefined : mode;

  const isMultiple = mode === 'multiple';

  const hasFilters = filters?.length > 0;

  const foundDynamicFilter = hasDynamicFilter(filters);

  const hasFormData = !isEmpty(formData);
  const hasGlobalState = !isEmpty(formData);

  const evaluateDynamicFiltersHelper = () => {
    const data = !isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    const evaluatedFilters = evaluateDynamicFilters(filters, [
      {
        match: 'data',
        data: data,
      },
      {
        match: 'globalState',
        data: globalState,
      },
      {
        match: '', // For backward compatibility. It's also important that the empty one is the last one as it's a fallback
        data,
      },
    ]);

    let parsedFilters = evaluatedFilters;

    const firstElement = evaluatedFilters[0];

    firstElement.defaultSelected = true;
    firstElement.selected = true;

    evaluatedFilters[0] = firstElement;

    if (hasFormData || hasGlobalState) {
      // Here we know we have evaluated our filters

      // TODO: Deal with the situation whereby the expression value evaluated to empty string because the action GetData will fail
      setPredefinedFilters(parsedFilters);
    } else if (!foundDynamicFilter) {
      // Here we do not need dynamic filters
      setPredefinedFilters(parsedFilters);
    }
  };

  useEffect(() => {
    if (hasFilters) {
      evaluateDynamicFiltersHelper();
    }
  }, [filters, formData, globalState]);

  useEffect(() => {
    const { showModal } = state;
    if (showModal) {
      if (selectedStoredFilterIds?.length && selectedStoredFilterIds?.includes(UNIQUE_ID)) {
        changeSelectedStoredFilterIds([]);
      }
    }
  }, [state?.showModal]);

  if (!entityType) {
    throw new Error('Please make sure that either entityType is configured for the entity picker to work properly');
  }

  const onAddNew = () => {
    if (addNewRecordsProps.modalFormId) {
      dynamicModal.open();
    } else console.warn('Modal Form is not specified');
  };

  const onDblClick = (row: IAnyObject) => {
    if (!row) return;

    if (onSelect) {
      onSelect(row);
    } else {
      if (isMultiple) {
        const selectedItems = value && Array.isArray(value) ? value : [];
        if (!selectedItems.includes(row.id)) 
          selectedItems.push(
            useRawValues
            ? row.id
            : { id: row.id, _displayName: row[displayEntityKey], _className: props.entityType }
          );

        onChange(selectedItems, null);
      } else {
        onChange(
          useRawValues
          ? row.id
          : { id: row.id, _displayName: row[displayEntityKey], _className: props.entityType }
          , null);
      }
    }

    hidePickerDialog();
  };

  const onSelectRow = (_index: number, row: IAnyObject) => {
    handleOnChange(row);
  };

  const handleOnChange = (row: IAnyObject) => {
    if (onChange && !_.isEmpty(row)) {
      onChange(row && (row.id || row.Id), row);
    }
  };

  const handleMultiChange = selectedValues => {
    if (onChange) onChange(selectedValues, null);
  };
  const onModalOk = () => {
    if (onSelect && state?.selectedRow) {
      onSelect(state?.selectedRow);
    }

    hidePickerDialog();
  };

  const handleCancel = () => {
    hidePickerDialog();
  };

  const handleButtonPickerClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event?.stopPropagation();

    showPickerDialog();
  };

  const options = useMemo<DefaultOptionType[]>(() => {
    let result: DefaultOptionType[] = null;
    if (selection.loading) {
      const items = value ? (Array.isArray(value) ? value : [value]) : [];

      result = items.map(item => ({ label: 'loading...', value: getIdFromValue(item), key: item }));
    } else {
      result = (selectedItems ?? []).map(ent => ({ label: ent[displayEntityKey], value: ent.id, key: ent.id }));
    }

    return result;
  }, [selectedItems]);

  const canAddNew = Boolean(addNewRecordsProps) && addNewRecordsProps.modalFormId;

  const footer = (
    <Fragment>
      {canAddNew && (
        <Button type="primary" onClick={onAddNew} size={size}>
          Add New
        </Button>
      )}
      <Button onClick={handleCancel} size={size}>
        Close
      </Button>
    </Fragment>
  );

  return (
    <div className="entity-picker-container">
      <div>
        {useButtonPicker ? (
          <Button onClick={handleButtonPickerClick} size={size} {...(pickerButtonProps || {})}>
            {title}
          </Button>
        ) : (
          <Input.Group style={{ width: '100%' }}>
            <Select
              size={size}
              onFocus={() => {
                selectRef.current.blur();
                showPickerDialog();
              }}
              value={selection.loading ? undefined : getSelectionFromValue(value)}
              placeholder={selection.loading ? 'Loading...' : undefined}
              notFoundContent={''}
              defaultValue={defaultValue}
              disabled={disabled || selection.loading}
              ref={selectRef}
              allowClear
              mode={selectedMode}
              options={options}
              showArrow={false}
              onChange={handleMultiChange}
              style={{ width: 'calc(100% - 32px)' }}
              loading={selection.loading}
            >
              {''}
            </Select>
            <Button
              onClick={showPickerDialog}
              className="picker-input-group-ellipsis"
              disabled={disabled}
              loading={loading ?? false}
              size={size}
              icon={<EllipsisOutlined />}
            />
          </Input.Group>
        )}
      </div>

      <Modal
        title={title || 'Select Item'}
        className="entity-picker-modal"
        open={state?.showModal}
        onOk={onModalOk}
        onCancel={handleCancel}
        width={isSmall ? '90%' : width}
        okText="Select"
        footer={footer}
      >
        <>
          <GlobalTableFilter
            searchProps={{ size: 'middle', autoFocus: true, placeholder: 'Search by Title, Type or Keyword...' }}
          />

          <div className="entity-picker-modal-pager-container">
            <TablePager />
          </div>

          <IndexTable onSelectRow={onSelectRow} onDblClick={onDblClick} options={{ omitClick: true }} />
        </>
      </Modal>
    </div>
  );
};

export const EntityPickerEditable = (props: IEntityPickerProps) => {
  const { parentEntityId, entityType, displayEntityKey } = props;

  return (
    <DataTableProvider parentEntityId={parentEntityId} entityType={entityType}>
      <EntityPickerEditableInner {...props} displayEntityKey={displayEntityKey} />
    </DataTableProvider>
  );
};

export default EntityPicker;
