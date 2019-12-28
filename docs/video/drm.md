# DRM Playback
ZombieBox `IStatefulVideo` supports supports DRM protected video playback. Support for DRM system varies from platform to platform, however.

To detect platform support `IStatefulVideo` exposes static methods `isDRMSupported(type)` and `canHandleMultiDRM()`. Some common DRM types are listed in zb/device/drm/drm.js as `Type`, but platforms may support additional proprietary types.

Some can have several DRM systems initialised at the same time and choose whichever is appropriate for the stream. `canHandleMultiDRM` detects that.

## DRM initialization
DRM is enabled with `attachDRM` method that accepts `IDRMClient`. Several `IDRMClient`s for different DRM types can be attached on platforms that support multi DRM.

`attachDRM` can only be called in `IDLE` state. `detachDRM` can be called in the same state and no other.

ZombieBox provides `IDRMClient` implementations for most common DRM types and use cases: 
 * `PlayReadyClient` supports reactive PlayReady DRM with optional license acquisition server.

Note that some platforms require explicit media type to enable DRM.
 
### PlayReady
Simplest PlayReady example:

```javascript
import PlayReadyClient from 'zb/device/drm/playready-client';
import {PrepareOption, MediaType} from 'zb/device/interfaces/i-stateful-video';

// Microsoft test assets
const laServer = 'https://test.playready.microsoft.com/service/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1';
const url = 'https://demo.unified-streaming.com/video/tears-of-steel/tears-of-steel-dash-playready.ism/.mpd';

// Create Video instance through Device factory or otherwise
video.attachDRM(new PlayReadyClient(laServer));
video.prepare(url, {
    [PrepareOption.TYPE]: MediaType.DASH
});
video.once(video.EVENT_READY, () => video.play());
```

## Custom `IDRMClient`
To add custom initialization such as addition authentication you can provide your own `IDRMClient` or inherit from its descendand and use `init` and `prepare` methods. `init` is called when client is created and attached to Video instance, `prepare` is called when Video is initialized with a media file. 

## Implementation notes
Internally ZombieBox uses Hook classes to communicate with DRM. Video deals with device specific initialization in non-DRM specific way; Hook is device-specific, DRM-specific but not app/server-specific; Client is device non-specific, DRM-specific and app/server-specific. 
