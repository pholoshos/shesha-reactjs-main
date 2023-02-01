import TextField from '../../../components/formDesigner/components/textField/textField';
import NumberField from '../../../components/formDesigner/components/numberField/numberField';
import DateField from '../../../components/formDesigner/components/dateField/dateField';
import Tabs from '../../../components/formDesigner/components/tabs';
import Wizard from '../../../components/formDesigner/components/wizard';
import Columns from '../../../components/formDesigner/components/columns/columns';
import SectionSeprator from '../../../components/formDesigner/components/sectionSeprator/sectionSeprator';
import TextArea from '../../../components/formDesigner/components/textArea/textArea';
import Autocomplete from '../../../components/formDesigner/components/autocomplete/autocomplete';
import Dropdown from '../../../components/formDesigner/components/dropdown/dropdown';
import Checkbox from '../../../components/formDesigner/components/checkbox/checkbox';
import CheckboxGroup from '../../../components/formDesigner/components/checkboxGroup/checkboxGroup';
import Radio from '../../../components/formDesigner/components/radio/radio';
import FileUpload from '../../../components/formDesigner/components/fileUpload';
import Image from '../../../components/formDesigner/components/image';
import AttachmentsEditor from '../../../components/formDesigner/components/attachmentsEditor/attachmentsEditor';
import Button from '../../../components/formDesigner/components/button/button';
import KeyValueEditor from '../../../components/formDesigner/components/labelValueEditor/labelValueEditorComponent';
import CollapsiblePanel from '../../../components/formDesigner/components/collapsiblePanel/collapsiblePanelComponent';
import Alert from '../../../components/formDesigner/components/alert';
import Notes from '../../../components/formDesigner/components/notes/notesComponent';
import ChildDataTable from '../../../components/formDesigner/components/childDataTable/childDataTableComponent';
import Address from '../../../components/formDesigner/components/address/addressComponent';
import Toolbar from '../../../components/formDesigner/components/dataTable/toolbar/toolbarComponent';
import TableViewSelector from '../../../components/formDesigner/components/dataTable/tableViewSelector/tableViewSelectorComponent';
import QueryBuilderComponent from '../../../components/formDesigner/components/queryBuilder/queryBuilderComponent';
import TableContext from '../../../components/formDesigner/components/dataTable/tableContext/tableContextComponent';
import DataTable from '../../../components/formDesigner/components/dataTable/table/tableComponent';
import TableTemplate from '../../../components/formDesigner/components/dataTable/table/tableTemplateComponent';
import Pager from '../../../components/formDesigner/components/dataTable/pager/pagerComponent';
import QuickSearch from '../../../components/formDesigner/components/dataTable/quickSearch/quickSearchComponent';
import AdvancedFilterButton from '../../../components/formDesigner/components/dataTable/advancedFilterButton/advancedFilterButtonComponent';
import SelectColumnsButton from '../../../components/formDesigner/components/dataTable/selectColumnsButton/selectColumnsButtonComponent';
import ContainerComponent from '../../../components/formDesigner/components/container/containerComponent';
import HierarchicalChecklistComponent from '../../../components/formDesigner/components/hierarchicalChecklist/hierarchicalChecklistComponent';
import Switch from '../../../components/formDesigner/components/switch/switch';
import ValidationErrors from '../../../components/formDesigner/components/validationErrors';
import IconPicker from '../../../components/formDesigner/components/iconPicker';
import { IToolboxComponentGroup } from '../../../interfaces/formDesigner';
import DisplayFormItem from '../../../components/formDesigner/components/basicDisplayFormItem';
import EntityPickerComponent from '../../../components/formDesigner/components/entityPicker';
import Section from '../../../components/formDesigner/components/section';
import TimeField from '../../../components/formDesigner/components/timeField';
import Statistic from '../../../components/formDesigner/components/statistic';
import PropertyAutocomplete from '../../../components/formDesigner/components/propertyAutocomplete';
import CodeEditor from '../../../components/formDesigner/components/codeEditor';
import EditableTagGroup from '../../../components/formDesigner/components/editableTagGroup';
import Paragraph from '../../../components/formDesigner/components/typography/paragraph';
import Text from '../../../components/formDesigner/components/typography/text';
import Title from '../../../components/formDesigner/components/typography/title';
import Divider from '../../../components/formDesigner/components/divider';
import Space from '../../../components/formDesigner/components/space';
import StatusTag from '../../../components/formDesigner/components/statusTag';
import DynamicView from '../../../components/formDesigner/components/dynamicView';
import ChildTable from '../../../components/formDesigner/components/dataTable/childTable';
import ColumnsEditor from '../../../components/formDesigner/components/dataTable/table/columnsEditor/columnsEditorComponent';
import EntityPickerColumnsEditor from '../../../components/formDesigner/components/dataTable/table/entityPickerColumnsEditor/entityPickerColumnsEditorComponent';

import ButtonGroup from '../../../components/formDesigner/components/button/buttonGroup/buttonGroupComponent';
import Filter from '../../../components/formDesigner/components/dataTable/filter/filterComponent';
import PermissionedObjectsTree from '../../../components/formDesigner/components/permissions/permissionedObjectsTree/permissionedObjectsTree';
import ScheduledJobExecutionLog from '../../../components/formDesigner/components/scheduledJobExecutionLog/scheduledJobExecutionLog';
import AutocompleteTagGroup from '../../../components/formDesigner/components/autocompleteTagGroup';
import RichTextEditor from '../../../components/formDesigner/components/richTextEditor';
import PasswordCombo from '../../../components/formDesigner/components/passwordCombo';
import PermissionsTree from '../../../components/formDesigner/components/permissions/permissionsTree/permissionsTree';
import PermissionTagGroup from '../../../components/formDesigner/components/permissions/permissionTagGroup';
import List from '../../../components/formDesigner/components/listControl';
import Progress from '../../../components/formDesigner/components/progress';
import Buttons from '../../../components/formDesigner/components/button/buttonGroup/buttonsComponent';
import SubForm from '../../../components/formDesigner/components/subForm';
import Link from '../../../components/formDesigner/components/link';
import Rate from '../../../components/formDesigner/components/rate';
import EventNames from '../../../components/formDesigner/components/eventNamesList';
import ConfigurableActionConfigurator from '../../../components/formDesigner/components/configurableActionsConfigurator';
import FormAutocompleteComponent from '../../../components/formDesigner/components/formAutocomplete';
import ReferenceListAutocompleteComponent from '../../../components/formDesigner/components/referenceListAutocomplete';
import Markdown from '../../../components/formDesigner/components/markdown';
import Drawer from '../../../components/formDesigner/components/drawer';
import ColorPickerComponent from '../../../components/formDesigner/components/colorPicker';
import Typography from '../../../components/formDesigner/components/typography/textFull';
import EndpointsAutocompleteComponent from '../../../components/formDesigner/components/endpointsAutocomplete/endpointsAutocomplete';

export const ToolboxComponents: IToolboxComponentGroup[] = [
  {
    name: 'Basic',
    visible: true,
    components: [
      Autocomplete,
      Button,
      Buttons,
      ButtonGroup,
      Checkbox,
      CheckboxGroup,
      TimeField,
      DateField,
      Dropdown,
      NumberField,
      Radio,
      Switch,
      TextArea,
      TextField,
      Statistic,
      Rate,
    ],
  },
  {
    name: 'Static',
    visible: true,
    components: [Alert, Link, DisplayFormItem, Section, ValidationErrors],
  },
  {
    name: 'Layout',
    visible: true,
    components: [CollapsiblePanel, Columns, ContainerComponent, Drawer, Divider, SectionSeprator, Space, Tabs, Wizard],
  },
  {
    name: 'Custom',
    visible: true,
    components: [
      Address,
      AttachmentsEditor,
      ChildDataTable,
      CodeEditor,
      ColorPickerComponent,
      DynamicView,
      EditableTagGroup,
      EntityPickerComponent,
      FileUpload,
      Image,
      List,
      Filter,
      SubForm,
      HierarchicalChecklistComponent,
      KeyValueEditor,
      Notes,
      IconPicker,
      PasswordCombo,
      PropertyAutocomplete,
      QueryBuilderComponent,
      ScheduledJobExecutionLog,
      AutocompleteTagGroup,
      StatusTag,
      RichTextEditor,
      Progress,
      EventNames,
      ConfigurableActionConfigurator,
      FormAutocompleteComponent,
      EndpointsAutocompleteComponent,
      ReferenceListAutocompleteComponent,
      Markdown,
    ],
  },
  {
    name: 'Permissions',
    visible: true,
    components: [PermissionedObjectsTree, PermissionsTree, PermissionTagGroup],
  },
  {
    name: 'Datatable',
    visible: true,
    components: [
      AdvancedFilterButton,
      ChildTable,
      ColumnsEditor, // Hidden
      EntityPickerColumnsEditor,
      DataTable,
      TableTemplate,
      Pager,
      QuickSearch,
      SelectColumnsButton,
      TableContext,
      TableViewSelector,
      Toolbar,
    ],
  },
  {
    visible: true,
    name: 'Typography',
    components: [Paragraph, Text, Title, Markdown, Typography],
  },

  // {
  //   visible: false,
  //   name: 'Views',
  //   components: [DetailsView, BlankView, TableView, FormView, DashboardView, MasterDetailsView, MenuView],
  // },
];

export default ToolboxComponents;

/*
const duplicates = Components.reduce(function (r, a) {
  r[a.type] = r[a.type] || [];
  r[a.type].push(a);
  return r;
}, Object.create(null));

console.log(duplicates);
*/
