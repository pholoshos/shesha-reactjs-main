import React, { CSSProperties, FC, Fragment, ReactNode } from 'react';
import ConfigurableFormComponent from './configurableFormComponent';
import { useForm } from '../../providers/form';
import {
  IConfigurableFormComponent,
  TOOLBOX_COMPONENT_DROPPABLE_KEY,
  TOOLBOX_DATA_ITEM_DROPPABLE_KEY,
} from '../../providers/form/models';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { joinStringValues } from '../../utils';
import DynamicComponent from './components/dynamicView/dynamicComponent';
import { useFormDesigner } from '../../providers/formDesigner';

export type Direction = 'horizontal' | 'vertical';

export interface IComponentsContainerProps {
  containerId: string;
  direction?: Direction;
  justifyContent?: string;
  alignItems?: string;
  justifyItems?: string;
  className?: string;
  render?: (components: JSX.Element[]) => ReactNode;
  itemsLimit?: number;
  plainWrapper?: boolean;
  readOnly?: boolean;
  dynamicComponents?: IConfigurableFormComponent[];
  wrapperStyle?: CSSProperties;
  style?: CSSProperties;
}
const ComponentsContainer: FC<IComponentsContainerProps> = props => {
  const { formMode } = useForm();
  const designer = useFormDesigner(false);

  // containers with dynamic components is not configurable, draw them as is
  if (props.dynamicComponents?.length) {
    return (
      <Fragment>
        {props.dynamicComponents?.map(m => (
          <DynamicComponent model={{ ...m, isDynamic: true }} />
        ))}
      </Fragment>
    );
  }

  const useDesigner = formMode === 'designer' && Boolean(designer);
  return useDesigner ? <ComponentsContainerDesigner {...props} /> : <ComponentsContainerLive {...props} />;
};

type AlignmentProps = Pick<IComponentsContainerProps, 'direction' | 'justifyContent' | 'alignItems' | 'justifyItems'>;
const getAlignmentStyle = ({
  direction = 'vertical',
  justifyContent,
  alignItems,
  justifyItems,
}: AlignmentProps): CSSProperties => {
  const style: CSSProperties = {};
  if (direction === 'horizontal' && justifyContent) {
    style['justifyContent'] = justifyContent;
    style['alignItems'] = alignItems;
    style['justifyItems'] = justifyItems;
  }
  return style;
};

const ComponentsContainerDesigner: FC<IComponentsContainerProps> = props => {
  const {
    containerId,
    children,
    direction = 'vertical',
    className,
    render,
    itemsLimit = -1,
    wrapperStyle,
    style: incomingStyle,
  } = props;

  const { getChildComponents } = useForm();
  const {
    updateChildComponents,
    addComponent,
    addDataProperty,
    startDragging,
    endDragging,
    readOnly,
  } = useFormDesigner();

  const components = getChildComponents(containerId);

  const componentsMapped = components.map<ItemInterface>(c => ({
    id: c.id,
  }));

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    if (!isNaN(itemsLimit) && itemsLimit && newState?.length === Math.round(itemsLimit) + 1) {
      return;
    }

    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newDataItemIndex = newState.findIndex(item => item['type'] === TOOLBOX_DATA_ITEM_DROPPABLE_KEY);
      if (newDataItemIndex > -1) {
        // dropped data item
        const draggedItem = newState[newDataItemIndex];

        addDataProperty({
          propertyMetadata: draggedItem.metadata,
          containerId,
          index: newDataItemIndex,
        });
      } else {
        const newComponentIndex = newState.findIndex(item => item['type'] === TOOLBOX_COMPONENT_DROPPABLE_KEY);
        if (newComponentIndex > -1) {
          // add new component
          const toolboxComponent = newState[newComponentIndex];

          addComponent({
            containerId,
            componentType: toolboxComponent.id.toString(),
            index: newComponentIndex,
          });
        } else {
          // reorder existing components
          const newIds = newState.map<string>(item => item.id.toString());
          updateChildComponents({ containerId, componentIds: newIds });
        }
      }
    }
    return;
  };

  const onDragStart = () => {
    startDragging();
  };

  const onDragEnd = _evt => {
    endDragging();
  };

  const renderComponents = () => {
    const renderedComponents = components.map((c, index) => (
      <ConfigurableFormComponent id={c.id} index={index} key={c.id} />
    ));

    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  };

  const style = getAlignmentStyle(props);

  return (
    <div className={joinStringValues(['sha-components-container', direction, className])} style={wrapperStyle}>
      <>
        {components.length === 0 && <div className="sha-drop-hint">Drag and Drop form component</div>}
        <ReactSortable
          disabled={readOnly}
          onStart={onDragStart}
          onEnd={onDragEnd}
          list={componentsMapped}
          setList={onSetList}
          fallbackOnBody={true}
          swapThreshold={0.5}
          group={{
            name: 'shared',
          }}
          sort={true}
          draggable=".sha-component"
          animation={75}
          ghostClass="sha-component-ghost"
          emptyInsertThreshold={20}
          handle=".sha-component-drag-handle"
          scroll={true}
          bubbleScroll={true}
          direction={direction}
          className={`sha-components-container-inner`}
          style={{ ...style, ...incomingStyle }}
        >
          {renderComponents()}
        </ReactSortable>
      </>

      {children}
    </div>
  );
};

const ComponentsContainerLive: FC<IComponentsContainerProps> = props => {
  const {
    containerId,
    children,
    direction = 'vertical',
    className,
    render,
    plainWrapper = false,
    wrapperStyle,
    style: incomingStyle,
  } = props;
  const { getChildComponents } = useForm();

  const components = getChildComponents(containerId);

  const renderComponents = () => {
    const renderedComponents = components.map((c, index) => (
      <ConfigurableFormComponent id={c.id} index={index} key={c.id} />
    ));

    return typeof render === 'function' ? render(renderedComponents) : renderedComponents;
  };

  const style = { ...getAlignmentStyle(props), ...incomingStyle };

  return plainWrapper ? (
    <>{renderComponents()}</>
  ) : (
    <div className={joinStringValues(['sha-components-container', direction, className])} style={wrapperStyle}>
      <div className="sha-components-container-inner" style={style}>
        {renderComponents()}
      </div>
      {children}
    </div>
  );
};

export default ComponentsContainer;
