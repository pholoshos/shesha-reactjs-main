import { FONT_SIZES } from './../utils';
import { nanoid } from 'nanoid';
import { DesignerToolbarSettings } from '../../../../../interfaces';

export const settingsFormMarkup = new DesignerToolbarSettings()
  .addSectionSeparator({
    id: 'cbbb6bb1-4080-4074-83de-a9009923ed44',
    name: 'separator1',
    parentId: 'root',
    label: 'Display',
    title: '',
  })
  .addTextArea({
    id: 'b9857800-eb4d-4303-b1ac-6f9bc7f140ad',
    name: 'content',
    parentId: 'root',
    label: 'Content',
    validate: {
      required: true,
    },
  })
  .addDropdown({
    id: '6d29cf2c-96fe-40ce-be97-32e9f5d0fe40',
    name: 'contentType',
    parentId: 'root',
    label: 'Color',
    values: [
      {
        label: 'Secondary',
        value: 'secondary',
        id: '32ebcc5b-6775-4b34-b856-d7ed42f33c3b',
      },
      {
        label: 'Success',
        value: 'success',
        id: 'f3622f5e-3dc3-452b-aa57-2273f65b9fdc',
      },
      {
        label: 'Warning',
        value: 'warning',
        id: '3e6a5ac8-bf51-48fb-b5c1-33ba455a1246',
      },
      {
        label: 'Danger',
        value: 'danger',
        id: '4b3830fa-6b2a-4493-a049-2a4a5be4b0a4',
      },
      {
        label: '(Custom Color)',
        value: 'custom',
        id: nanoid(),
      },
    ],
    dataSourceType: 'values',
  })
  .addColorPicker({
    id: nanoid(),
    name: 'color',
    label: 'Custom Color',
    title: 'Pick Content Color',
    customVisibility: "return data.contentType === 'custom'",
  })
  .addDropdown({
    id: nanoid(),
    name: 'fontSize',
    parentId: 'root',
    label: 'Font Size',
    values: Object.keys(FONT_SIZES).map(key => ({ id: nanoid(), value: key, label: key })),
    dataSourceType: 'values',
  })
  .addCheckbox({
    id: '3cd922a6-22b2-435f-8a46-8cca9fba8bea',
    name: 'code',
    parentId: 'root',
    label: 'Code style?',
  })
  .addCheckbox({
    id: 'aa17f452-0b07-473a-9c7a-986dfc2d37d9',
    name: 'italic',
    parentId: 'root',
    label: 'Italic',
  })
  .addCheckbox({
    id: '883498f1-1e05-479d-b119-d038cb7d398d',
    name: 'copyable',
    parentId: 'root',
    label: 'Copyable?',
  })
  .addCheckbox({
    id: '27cc9d42-1d07-4f70-a17c-50711d03acc5',
    name: 'keyboard',
    parentId: 'root',
    label: 'Keyboard style?',
  })
  .addCheckbox({
    id: '96f479b7-8ebc-4cda-a0b8-ecb4c7fe3a5d',
    name: 'delete',
    parentId: 'root',
    label: 'Delete?',
  })
  .addCheckbox({
    id: '3a97e341-7f20-4479-9fa6-d8086e8b9a17',
    name: 'ellipsis',
    parentId: 'root',
    label: 'Ellipsis?',
  })
  .addCheckbox({
    id: '23f1f1d7-7eb8-440b-8620-bb059b6938e4',
    name: 'mark',
    parentId: 'root',
    label: 'Marked style?',
  })
  .addCheckbox({
    id: '33b16438-9563-438b-a375-8c5f4ccdd727',
    name: 'strong',
    parentId: 'root',
    label: 'Strong?',
  })
  .addCheckbox({
    id: '9a94a3ad-c833-438d-9ea8-1196f2ae1c64',
    name: 'underline',
    parentId: 'root',
    label: 'Underline?',
  })
  .addSectionSeparator({
    id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
    name: 'sectionStyle',
    parentId: 'root',
    label: 'Style',
    title: 'Style',
  })
  .addCodeEditor({
    id: '06ab0599-914d-4d2d-875c-765a495472f8',
    name: 'style',
    label: 'Style',
    parentId: 'root',
    validate: {},
    settingsValidationErrors: [],
    description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
    exposedVariables: [
      { name: 'data', description: 'Form values', type: 'object', id: '6befdd49-41aa-41d6-a29e-76fa00590b76' },
    ],
    mode: 'dialog',
  })

  .toJson();
