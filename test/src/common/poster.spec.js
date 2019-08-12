import {getKalturaPoster} from '../../../src/common/poster';
import * as TestUtils from '../utils/test-utils';
import {setup} from '../../../src/setup';
import {ProviderEnum, register} from '../../../src/common/provider-manager';
import {registerPlugin} from '@playkit-js/playkit-js';
import {KavaStub} from '../mock-data/kava.stub';
import {Provider} from '../mock-data/provider.stub';

const targetId = 'player-placeholder_ovp/poster.spec';

describe('getKalturaPoster', function() {
  it('should append width and height to kaltura poster', function() {
    const mediaSources = {poster: 'https//my/kaltura/poster'};
    const playerSources = {poster: 'https//my/kaltura/poster'};
    const poster = getKalturaPoster(ProviderEnum.OVP, playerSources, mediaSources, {width: 640, height: 360});
    'https//my/kaltura/poster/height/360/width/640'.should.equal(poster);
  });

  it('should not append width and height to kaltura poster', function() {
    const mediaSources = {poster: 'https//my/kaltura/poster'};
    const playerSources = {poster: 'https//my/non/kaltura/poster'};
    const poster = getKalturaPoster(ProviderEnum.OVP, playerSources, mediaSources, {width: 640, height: 360});
    'https//my/non/kaltura/poster'.should.equal(poster);
  });

  describe('Poster Integration', function() {
    let config, kalturaPlayer, sandbox;
    const myCustomPosterUrl = 'https://www.elastic.co/assets/bltada7771f270d08f6/enhanced-buzz-1492-1379411828-15.jpg';
    const entryId = '0_wifqaipd';
    const alterEntryId = '0_4ktof5po';
    const partnerId = 1091;
    const env = {
      cdnUrl: 'http://qa-apache-php7.dev.kaltura.com/',
      serviceUrl: 'http://qa-apache-php7.dev.kaltura.com/api_v3'
    };

    before(function() {
      TestUtils.createElement('DIV', targetId);
      registerPlugin('kava', KavaStub);
      register(ProviderEnum.OVP, Provider);
    });

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
      config = {
        targetId: targetId,
        log: {playerVersion: false},
        provider: {
          partnerId: partnerId,
          env: env,
          type: ProviderEnum.OVP
        },
        sources: {}
      };
    });

    afterEach(function() {
      sandbox.restore();
      kalturaPlayer.destroy();
      kalturaPlayer = null;
      TestUtils.removeVideoElementsFromTestPage();
    });

    after(function() {
      TestUtils.removeElement(targetId);
    });

    it('should choose configured poster', function(done) {
      config.sources.poster = myCustomPosterUrl;
      kalturaPlayer = setup(config);
      sandbox.stub(kalturaPlayer._provider, 'getMediaConfig').resolves(JSON.parse(JSON.stringify(mediaConfig1)));
      kalturaPlayer
        .loadMedia({entryId: entryId})
        .then(() => {
          try {
            kalturaPlayer.config.sources.poster.should.equal(myCustomPosterUrl);
            done();
          } catch (e) {
            done(e);
          }
        })
        .catch(e => {
          done(e);
        });
    });

    it('should choose backend poster', function(done) {
      kalturaPlayer = setup(config);
      sandbox.stub(kalturaPlayer._provider, 'getMediaConfig').resolves(JSON.parse(JSON.stringify(mediaConfig1)));
      kalturaPlayer
        .loadMedia({entryId: entryId})
        .then(() => {
          try {
            kalturaPlayer.config.sources.poster.should.have.string(mediaConfig1.sources.poster);
            done();
          } catch (e) {
            done(e);
          }
        })
        .catch(e => {
          done(e);
        });
    });

    it('should choose backend poster on change media', function(done) {
      kalturaPlayer = setup(config);
      sandbox.stub(kalturaPlayer._provider, 'getMediaConfig').resolves(JSON.parse(JSON.stringify(mediaConfig1)));
      kalturaPlayer
        .loadMedia({entryId: entryId})
        .then(() => {
          try {
            kalturaPlayer.config.sources.poster.should.have.string(mediaConfig1.sources.poster);
          } catch (e) {
            done(e);
            return;
          }
          sandbox.restore();
          sandbox.stub(kalturaPlayer._provider, 'getMediaConfig').resolves(JSON.parse(JSON.stringify(mediaConfig2)));
          kalturaPlayer
            .loadMedia({entryId: alterEntryId})
            .then(() => {
              try {
                kalturaPlayer.config.sources.poster.should.have.string(mediaConfig2.sources.poster);
                done();
              } catch (e) {
                done(e);
              }
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });

    it('should choose configured poster on change media', function(done) {
      kalturaPlayer = setup(config);
      sandbox.stub(kalturaPlayer._provider, 'getMediaConfig').resolves(JSON.parse(JSON.stringify(mediaConfig1)));
      kalturaPlayer
        .loadMedia({entryId: entryId})
        .then(() => {
          try {
            kalturaPlayer.config.sources.poster.should.have.string(mediaConfig1.sources.poster);
          } catch (e) {
            done(e);
            return;
          }
          kalturaPlayer.reset();
          kalturaPlayer.configure({
            sources: {
              poster: myCustomPosterUrl
            }
          });
          kalturaPlayer
            .loadMedia({entryId: alterEntryId})
            .then(() => {
              try {
                kalturaPlayer.config.sources.poster.should.equal(myCustomPosterUrl);
                done();
              } catch (e) {
                done(e);
              }
            })
            .catch(e => {
              done(e);
            });
        })
        .catch(e => {
          done(e);
        });
    });
  });
});

const mediaConfig1 = {
  session: {
    isAnonymous: true,
    partnerId: 1234,
    ks: '1234'
  },
  sources: {
    hls: [
      {
        id: '0_wifqaipd_861,applehttp',
        url: 'http://myDomain.com/a.m3u8',
        mimetype: 'application/x-mpegURL'
      }
    ],
    dash: [],
    progressive: [
      {
        id: '0_wifqaipd_861,applehttp',
        url: 'http://myDomain.com/b.mp4',
        mimetype: 'video/mp4'
      }
    ],
    id: '0_wifqaipd',
    duration: 741,
    type: 'Vod',
    poster: 'http://cdntesting.qa.mkaltura.com/p/1091/sp/109100/thumbnail/entry_id/0_wifqaipd/version/100042',
    dvr: false,
    vr: null,
    metadata: {
      name: 'MPEG Dash with MultiAudio New Transcoding',
      description: '',
      tags: '',
      MediaType: 'Movie',
      WatchPermissionRule: 'Parrent Allowed'
    },
    captions: []
  },
  plugins: {}
};
const mediaConfig2 = {
  session: {
    isAnonymous: true,
    partnerId: 12345,
    ks: '12345'
  },
  sources: {
    hls: [
      {
        id: '0_4ktof5po_861,applehttp',
        url: 'http://myDomain.com/b.m3u8',
        mimetype: 'application/x-mpegURL'
      }
    ],
    dash: [],
    progressive: [
      {
        id: '0_4ktof5po_861,applehttp',
        url: 'http://myDomain.com/b.mp4',
        mimetype: 'video/mp4'
      }
    ],
    id: '0_4ktof5po',
    duration: 741,
    type: 'Vod',
    poster: 'http://cdntesting.qa.mkaltura.com/p/1091/sp/109100/thumbnail/entry_id/0_4ktof5po/version/100042',
    dvr: false,
    vr: null,
    metadata: {
      name: 'MPEG Dash with MultiAudio New Transcoding',
      description: '',
      tags: '',
      MediaType: 'Movie',
      WatchPermissionRule: 'Parrent Allowed'
    },
    captions: []
  },
  plugins: {}
};
