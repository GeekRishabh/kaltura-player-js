// @flow
import {Error, EventType as CoreEventType, FakeEvent, loadPlayer, Utils} from 'playkit-js'
import {EventType as UIEventType} from 'playkit-js-ui'
import {Provider} from 'playkit-js-providers'
import getLogger from './common/utils/logger'
import {addKalturaParams} from './common/utils/kaltura-params'
import {evaluatePluginsConfig} from './common/plugins/plugins-config'
import {addKalturaPoster} from 'poster-and-thumbs'
import './assets/style.css'
import {UIWrapper} from './common/ui-wrapper'

export default class KalturaPlayer {
  _player: Player;
  _playerConfigure: Function;
  _provider: Provider;
  _uiWrapper: UIWrapper;
  _logger: any;

  constructor(options: KalturaPlayerOptionsObject) {
    this._player = loadPlayer(options.player);
    this._playerConfigure = this._player.configure.bind(this._player);
    this._logger = getLogger('KalturaPlayer' + Utils.Generator.uniqueId(5));
    this._uiWrapper = new UIWrapper(this._player, options.ui);
    this._provider = new Provider(options.provider, __VERSION__);
    Object.assign(this._player, {
      loadMedia: mediaInfo => this.loadMedia(mediaInfo),
      configure: config => this.configure(config),
      setMedia: mediaConfig => this.setMedia(mediaConfig)
    });
    Object.defineProperty(this._player, 'Event', this.Event);
    return this._player;
  }

  configure(config: Object): void {
    if (!config.player && !config.ui) {
      this._playerConfigure(config);
    } else {
      if (config.player) {
        this._playerConfigure(config.player);
      }
      if (config.ui) {
        this._uiWrapper.setConfig(config.ui);
      }
    }
  }

  loadMedia(mediaInfo: ProviderMediaInfoObject): Promise<*> {
    this._logger.debug('loadMedia', mediaInfo);
    this._player.reset();
    this._player.loadingMedia = true;
    this._uiWrapper.setErrorPresetConfig(mediaInfo);
    this._uiWrapper.setLoadingSpinnerState(true);
    return this._provider.getMediaConfig(mediaInfo)
      .then(mediaConfig => this.setMedia(mediaConfig))
      .catch(e => {
        this._player.dispatchEvent(new FakeEvent(this._player.Event.ERROR, new Error(Error.Severity.CRITICAL, Error.Category.PLAYER, Error.Code.LOAD_FAILED, e)));
      });
  }

  setMedia(mediaConfig: ProviderMediaConfigObject): void {
    this._logger.debug('setMedia', mediaConfig);
    const dimensions = this._player.dimensions;
    this._uiWrapper.setSeekbarConfig(mediaConfig);
    Utils.Object.mergeDeep(mediaConfig.metadata, this._player.config.metadata);
    addKalturaPoster(mediaConfig.metadata, dimensions.width, dimensions.height);
    addKalturaParams(mediaConfig.sources, this._player);
    const playerConfig: PKPlayerOptionsObject = Utils.Object.copyDeep(mediaConfig);
    Utils.Object.mergeDeep(playerConfig.plugins, this._player.config.plugins);
    Utils.Object.mergeDeep(playerConfig.session, this._player.config.session);
    evaluatePluginsConfig(playerConfig);
    this._player.configure(playerConfig);
  }

  get Event(): Object {
    return {
      get: () => ({
        Core: CoreEventType,
        UI: UIEventType,
        // For backward compatibility
        ...CoreEventType
      }),
      set: undefined
    };
  }
}
