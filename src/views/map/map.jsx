import config from 'config';
import filter from 'lodash-es/filter';
import partial from 'lodash-es/partial';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Map, View } from '@collmot/ol-react';
import Drone from '~/../assets/img/drone-x-black-32x32.png';
// import { showNotification } from '~/features/snackbar/slice';
// import { MessageSemantics } from '~/features/snackbar/types';
// import * as Condition from './conditions';
// import {
//   SelectNearestFeature,
//   ShowContextMenu,
//   TrackNearestFeature,
//   TransformFeatures,
// } from './interactions';
import { Layers, stateObjectToLayer } from './layers';
// import DrawingToolbar from './DrawingToolbar';
// import MapContextMenu from './MapContextMenu';
import MapReferenceRequestHandler from './MapReferenceRequestHandler';
// import MapToolbar from './MapToolbar';
// import { isDrawingTool, Tool, toolToDrawInteractionProps } from './tools';

// import Widget from '~/components/Widget';
import { handleError } from '~/error-handling';
import {
  addFeature,
  showDetailsForFeatureInTooltipOrGivenFeature,
} from '~/features/map-features/actions';
import NearestItemTooltip from '~/features/session/NearestItemTooltip';
import { setFeatureIdForTooltip } from '~/features/session/slice';
import mapViewManager from '~/mapViewManager';
import {
  //   canLayerTriggerTooltip,
  getVisibleSelectableLayers,
  //   isLayerVisibleAndSelectable,
} from '~/model/layers';
import {
  createFeatureFromOpenLayers,
  handleFeatureUpdatesInOpenLayers,
  isFeatureTransformable,
} from '~/model/openlayers';
import {
  updateMapViewSettings,
  updateCurrentFrameTime,
} from '~/features/map/view';
import {
  addToSelection,
  setSelection,
  removeFromSelection,
} from '~/features/map/selection';
import { getSelectedTool } from '~/features/map/tools';
import { getSelectedFeatureIds } from '~/features/map-features/selectors';
import { getVisibleLayersInOrder } from '~/selectors/ordered';
// import { getExtendedCoordinateFormatter } from '~/selectors/formatting';
import {
  getMapViewCenterPosition,
  getMapViewRotationAngle,
  getCurrentFrameTime,
} from '~/selectors/map';
import { getSelection } from '~/selectors/selection';
// import { hasFeature } from '~/utils/configuration';
import {
  mapViewCoordinateFromLonLat,
  findFeaturesById,
  lonLatFromMapViewCoordinate,
} from '~/utils/geography';
import { toDegrees } from '~/utils/math';
import 'ol/ol.css';
import { ImageLayer } from './layers/image';
import { closeOnLoadImage } from '~/features/show/slice';
import store from '~/store';
import { useSelector, useDispatch } from 'react-redux';
import VideoComponent from './VideoComponent';
/* ********************************************************************** */

/**
 * React component that renders the layers of the map in the main window.
 *
 * @returns {JSX.Node[]}  the layers of the map
 */
const locData = [
  { lat: 12.949013, lon: 80.141617 },
  { lat: 12.949079, lon: 80.141681 },
  { lat: 12.949133, lon: 80.141734 },
  { lat: 12.94918, lon: 80.141786 },
  { lat: 12.94914, lon: 80.141864 },
  { lat: 12.949069, lon: 80.14182 },
];
const MapViewLayersPresentation = ({
  layers,
  onFeaturesModified,
  selectedTool,
  zoom,
  // currentFrameTime,
}) => {
  let zIndex = 0;
  const renderedLayers = [];

  const [loc, setLoc] = useState({
    lat: locData[1].lat,
    lon: locData[0].lon,
  });

  // useEffect(() => {
  //   let index = 1;
  //   const intervalId = setInterval(() => {
  //     setLoc(locData[index]);
  //     index = (index + 1) % locData.length;
  //   }, 1000);

  //   // Clean up the interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, []);

  for (const layer of layers) {
    if (layer.type in Layers) {
      renderedLayers.push(
        stateObjectToLayer(layer, {
          onFeaturesModified,
          selectedTool,
          zIndex,
        })
      );
      zIndex++;
    }
  }

  const Cutomlayer = {
    parameters: {
      image: {
        data: Drone,
      },
      transform: {
        position: { lat: loc.lat, lon: loc.lon },
        angle: 0,
        scale: zoom < 13 ? 500000 / (zoom * 2) : 50000 / (zoom * 50),
      },
    },
  };
  renderedLayers.push(<ImageLayer layer={Cutomlayer} zIndex={6} />);

  return renderedLayers;
};

MapViewLayersPresentation.propTypes = {
  layers: PropTypes.arrayOf(PropTypes.object),
  onFeaturesModified: PropTypes.func,
  selectedTool: PropTypes.string.isRequired,
  zoom: PropTypes.number,
};

/**
 * Connects the map view layers to the Redux store.
 */
const MapViewLayers = connect(
  // mapStateToProps
  (state) => ({
    layers: getVisibleLayersInOrder(state),
    selectedTool: getSelectedTool(state),
    zoom: state.map.view.zoom,
    // currentFrameTime: getCurrentFrameTime(state),
  })
)(MapViewLayersPresentation);

/* ********************************************************************** */

const MAP_STYLE = {
  // Vector tile based maps assume that there is a light background
  background: '#f8f4f0',
  height: '100%',
  width: '50%',
};
/**
 * React component for the map of the main window.
 */
class MapViewPresentation extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,

    center: PropTypes.arrayOf(PropTypes.number),
    rotation: PropTypes.number,
    selection: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedTool: PropTypes.string,
    zoom: PropTypes.number,

    glContainer: PropTypes.object,
  };

  static defaultProps = {
    center: [19.061951, 47.47334],
    zoom: 17,
  };

  constructor(props) {
    super(props);

    this._onAddFeaturesToSelection = partial(this._onBoxDragEnded, 'add');
    this._onRemoveFeaturesFromSelection = partial(
      this._onBoxDragEnded,
      'remove'
    );
    this._onSetSelectedFeatures = partial(this._onBoxDragEnded, 'set');

    this._map = React.createRef();
    this._mapInnerDiv = React.createRef();
  }

  componentDidMount() {
    const { glContainer } = this.props;
    this.layoutManager = glContainer ? glContainer.layoutManager : undefined;

    mapViewManager.initialize();
    this._disableDefaultContextMenu();
  }

  componentDidUpdate() {
    const { glContainer } = this.props;
    this.layoutManager = glContainer ? glContainer.layoutManager : undefined;
  }

  /**
   * Returns the layout manager that the map view currently participates in.
   * @return {GoldenLayout} the layout manager
   */
  get layoutManager() {
    return this._layoutManager;
  }

  /**
   * Sets the layout manager that the map view currently participates in.
   *
   * @param {GoldenLayout} value  the new layout manager
   */
  set layoutManager(value) {
    if (this._layoutManager === value) {
      return;
    }

    if (this._layoutManager) {
      this._layoutManager.off('stateChanged', this.updateSize, this);
    }

    this._layoutManager = value;

    if (this._layoutManager) {
      this._layoutManager.on('stateChanged', this.updateSize, this);
    }
  }

  render() {
    const { rotation, selectedTool, zoom } = this.props;
    const center = [locData[0].lon, locData[0].lat];
    const view = (
      <View
        center={mapViewCoordinateFromLonLat(center)}
        rotation={(-rotation * Math.PI) / 180}
        zoom={zoom}
        maxZoom={24}
        constrainRotation={false}
      />
    );

    // Note that we use a <div> to wrap the map; this is because Tippy.js
    // tooltips need a ref to a DOM node, but attaching a ref to the Map will
    // give access to the underlying OpenLayers Map object instead.
    return (
      <NearestItemTooltip>
        <div style={{ display: 'flex', height: '100%' }}>
          <Map
            ref={this._map}
            loadTilesWhileInteracting
            id='main-map-view'
            view={view}
            useDefaultControls={false}
            // className={toolClasses[selectedTool]}
            style={MAP_STYLE}
            onMoveEnd={this._onMapMoved}
          >
            <MapReferenceRequestHandler />

            {/* <MapViewToolbars /> */}
            <MapViewLayers onFeaturesModified={this._onFeaturesModified} />

            {/* <MapViewControls /> */}
            {/* <MapViewInteractions
              selectedTool={selectedTool}
              selectedFeaturesProvider={this._getSelectedTransformableFeatures}
              onAddFeaturesToSelection={this._onAddFeaturesToSelection}
              onDrawEnded={this._onDrawEnded}
              onFeaturesTransformed={this._onFeaturesTransformed}
              onNearestFeatureChanged={this._onNearestFeatureChanged}
              onRemoveFeaturesFromSelection={
                this._onRemoveFeaturesFromSelection
                }
                onSetSelectedFeatures={this._onSetSelectedFeatures}
                onSingleFeatureSelected={this._onFeatureSelected}
                /> */}
            {/* OpenLayers interaction that triggers a context menu */}
            {/* <ShowContextMenu
              layers={isLayerVisibleAndSelectable}
              projection='EPSG:4326'
              threshold={40}
              onOpening={this._hideNearestFeatureTooltip}
              selectAction={this._onFeatureSelected}
              > */}
            {/* The context menu that appears on the map when the user right-clicks */}
            {/* <MapContextMenu /> */}
            {/* </ShowContextMenu> */}
          </Map>
          <VideoComponent handleTime={this._onChangeVideoFrame} />
        </div>
      </NearestItemTooltip>
    );
  }

  /**
   * Returns the selected features that can be transformed with a standard
   * transformation interaction in an array. The selection includes not
   * only user-defined features but anything that can be transformed (e.g.,
   * home position objects).
   *
   * @param  {Map} map  the map
   * @return {ol.Feature[]} the selected OpenLayers features
   */
  _getSelectedTransformableFeatures = (map) => {
    return filter(
      findFeaturesById(map, this.props.selection),
      isFeatureTransformable
    );
  };

  /**
   * Event handler that is called when the user finishes a drag-box
   * interaction on the map.
   *
   * @param  {string}  mode  the selection mode; one of 'add', 'remove',
   *         or 'set'
   * @param  {ol.interaction.DragBox.Event} event  the event dispatched by
   *         the drag-box interaction
   */
  _onBoxDragEnded = (mode, event) => {
    const geometry = event.target.getGeometry();
    const extent = geometry.getExtent();
    const features = [];
    const { map } = this._map.current;

    for (const layer of getVisibleSelectableLayers(map)) {
      const source = layer.getSource();
      source.forEachFeatureIntersectingExtent(extent, (feature) => {
        const featureGeometry = feature.getGeometry();
        if (
          featureGeometry.getType() === 'Point' &&
          geometry.intersectsCoordinate(featureGeometry.getCoordinates())
        ) {
          features.push(feature);
        }
      });
    }

    this._onFeaturesSelected(mode, features);
  };

  /**
   * Event handler that is called when the user finishes drawing a new
   * feature on the map in "draw" mode.
   *
   * At this stage, we only have an OpenLayers feature that is not attached
   * to a specific layer yet. This function will dispatch the appropriate
   * action to create a new feature in the Redux store, which will in turn
   * create *another* equivalent feature on the OpenLayers map. The
   * temporary feature in the event will be discarded.
   *
   * @param  {ol.interaction.Draw.Event} event  the event dispatched by the
   *         draw interaction
   */
  _onDrawEnded = (event) => {
    try {
      const [feature] = createFeatureFromOpenLayers(event.feature);
      feature.owner = 'user';
      config.map.features.onCreate(feature);
      this.props.dispatch(addFeature(feature));
    } catch (error) {
      handleError(error);
    }
  };

  /**
   * Event handler that is called when the user activates a feature by
   * double-clicking on it.
   */
  _onFeatureActivated = (feature) => {
    // Okay, so this was a double-click. If we have a tooltip being shown on
    // the map, show the details dialog of the feature whose tooltip we are
    // showing; otherwise show the details dialog of the given feature.
    this.props.dispatch(showDetailsForFeatureInTooltipOrGivenFeature(feature));
  };

  /**
   * Event handler that is called when some features were modified on the
   * map after adding / moving / removing its constituent vertices.
   *
   * @param  {ol.interaction.Modify.Event}  event  the event that was
   *         triggered at the end of the interaction
   * @param  {ol.Feature[]}  event.features  the features that were modified
   */
  _onFeaturesModified = (event) => {
    this._updateFeatures(event.features, { type: 'modify', event });
  };

  /**
   * Event handler that is called when some features were moved on the
   * map by dragging.
   *
   * @param  {TransformFeaturesInteractionEvent}  event  the event that was
   *         triggered at the end of the interaction
   * @param  {ol.Feature[]}  event.features  the features that were moved
   */
  _onFeaturesTransformed = (event) => {
    if (event.hasMoved) {
      this._updateFeatures(event.features, { type: 'transform', event });
    }
  };

  /**
   * Event handler that is called when the user selects a single UAV or
   * feature on the map by clicking.
   *
   * @param  {string}  mode  the selection mode; one of 'add', 'remove',
   *         'clear', 'toggle' or 'set'
   * @param  {ol.Feature}  feature  the selected feature
   */
  _onFeatureSelected = (mode, feature) => {
    const id = feature ? feature.getId() : undefined;
    if (id === undefined && mode !== 'set' && mode !== 'clear') {
      return;
    }

    switch (mode) {
      case 'activate':
        this._onFeatureActivated(feature);
        break;

      case 'toggle':
        mode = this.props.selection.includes(id) ? 'remove' : 'add';
        break;

      case 'clear':
        mode = 'set';
        feature = undefined;
        break;

      default:
        break;
    }

    this._onFeaturesSelected(mode, feature ? [feature] : []);
  };

  /**
   * Event handler that is called when the user selects multiple UAVs or
   * features on the map by clicking or dragging.
   *
   * @param  {string}  mode  the selection mode; one of 'add', 'remove',
   *         or 'set'
   * @param  {ol.Feature[]}  features  the selected features
   */
  _onFeaturesSelected = (mode, features) => {
    const actionMapping = {
      add: addToSelection,
      remove: removeFromSelection,
      set: setSelection,
    };
    const action = actionMapping[mode] || setSelection;
    const ids = features ? features.map((feature) => feature.getId()) : [];
    if (action === setSelection || (ids && ids.length > 0)) {
      this.props.dispatch(action(ids));
    }
  };

  /**
   * Event handler that is called when the user moves the map view. Synchronizes
   * the state of the map view back to the state store.
   */
  _onMapMoved = () => {
    const { map } = this._map.current;
    const view = map ? map.getView() : undefined;

    if (view) {
      const position = lonLatFromMapViewCoordinate(view.getCenter());
      const zoom = view.getZoom();
      const angle = toDegrees(-view.getRotation());

      this.props.dispatch(
        updateMapViewSettings({
          position,
          angle,
          zoom,
        })
      );
    }
  };

  /**
   * Event handler that is called when the user moves the map view. Synchronizes
   * the state of the map view back to the state store.
   */
  _onChangeVideoFrame = (time) => {
    this.props.dispatch(updateCurrentFrameTime(time));
  };

  _onNearestFeatureChanged = (feature) => {
    this.props.dispatch(
      setFeatureIdForTooltip(feature ? feature.getId() : null)
    );
  };

  _hideNearestFeatureTooltip = () => {
    this.props.dispatch(setFeatureIdForTooltip(null));
  };

  /**
   * Common implementation for `_onFeaturesTransformed` and `_onFeaturesModified`.
   *
   * @param  {ol.Feature[]}  features  the features that are to be updated
   */
  _updateFeatures(features, options) {
    handleFeatureUpdatesInOpenLayers(features, this.props.dispatch, options);
  }

  /**
   * Method to disable the browsers default context menu.
   */
  _disableDefaultContextMenu = () => {
    const { map } = this._map.current;
    map.getViewport().addEventListener('contextmenu', (event) => {
      event.preventDefault();
      return false;
    });
  };

  /**
   * Method that must be called whenever the size of the container holding
   * the map view has changed.
   */
  updateSize() {
    const map = this._map.current;
    if (map) {
      map.updateSize();
    }
  }
}

/**
 * Connects the map view to the Redux store.
 */
const MapView = connect(
  // mapStateToProps
  (state) => ({
    center: getMapViewCenterPosition(state),
    rotation: getMapViewRotationAngle(state),
    zoom: state.map.view.zoom,

    selectedFeatures: getSelectedFeatureIds(state),
    selectedTool: getSelectedTool(state),
    selection: getSelection(state),
  })
)(MapViewPresentation);

export default MapView;
