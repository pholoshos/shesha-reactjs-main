import React, { FC, useState } from "react";
import { Config } from 'react-awesome-query-builder';
import { SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth } from "../domUtils";
import { PropertyAutocomplete } from "../../propertyAutocomplete/propertyAutocomplete";
import { IPropertyMetadata } from "../../../interfaces/metadata";
import { useQueryBuilder } from "../../..";
import { getPropertyFullPath, propertyMetadata2QbProperty } from "../../../providers/queryBuilder/utils";

export interface IFieldSelectProps {
    config: Config,
    customProps?: { [key: string]: any },
    items: [],
    placeholder?: string,
    selectedKey?: string,
    selectedKeys?: [],
    selectedPath?: [],
    selectedLabel?: string,
    selectedAltLabel?: string,
    selectedFullLabel?: string,
    selectedOpts?: object,
    readonly?: boolean,
    //actions
    setField: (key: string) => void,
}

export const FieldAutocomplete: FC<IFieldSelectProps> = (props) => {
    const { fields, setFields } = useQueryBuilder();
    const [text, setText] = useState(props.selectedKey);
    const onSelect = (key, _propertyMetadata: IPropertyMetadata) => {
        // check fields and expand if needed
        if (typeof (key) === 'string')
            props.setField(key);
    };

    const onChange = (key) => {
        setText(key);
    }

    const onPropertiesLoaded = (properties: IPropertyMetadata[], prefix: string) => {
        const missingFields = properties
            .filter(p => !props.config.fields[getPropertyFullPath(p.path, prefix)])
            .map(p => {
                const qbProp = propertyMetadata2QbProperty(p);
                qbProp.propertyName = getPropertyFullPath(p.path, prefix);
                return qbProp;
            });

        if (missingFields.length > 0){
            console.log('add missing fields', missingFields)
            const newFields = [...fields, ...missingFields];
            setFields(newFields);
        }
    }

    const {
        config, customProps, /*items,*/ placeholder,
        selectedKey, selectedLabel, /*selectedOpts,*/ selectedAltLabel, selectedFullLabel, /*readonly,*/
    } = props;
    const { showSearch } = customProps || {};

    const selectText = text || selectedLabel || placeholder;
    const selectWidth = calcTextWidth(selectText);
    const isFieldSelected = !!selectedKey;

    const width = isFieldSelected && !showSearch ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;

    let tooltipText = selectedAltLabel || selectedFullLabel;
    if (tooltipText == selectedLabel)
        tooltipText = null;

    const readOnly = config.settings.immutableFieldsMode === true;

    return (
        <PropertyAutocomplete
            readOnly={readOnly}
            value={text}
            onChange={onChange}
            showFillPropsButton={false}
            mode="single"
            style={{ width }}
            size={config.settings.renderSize == 'medium' ? 'middle' : config.settings.renderSize}
            onSelect={onSelect}
            onPropertiesLoaded={onPropertiesLoaded}
        />
    );
}