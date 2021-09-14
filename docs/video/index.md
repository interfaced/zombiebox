# IStatefulVideo
`IStatefulVideo` is ZombieBox video playback abstraction layer that encapsulates various platforms and provides a uniform, well-structured and stable interface to control video playback across all of them. 

`IStatefulVideo` is event based black box model and does not use Promises in its interface. It's recommended to avoid them and especially chaining commands as it leads to unpredictable results in volatile environment of players.

# Glossary
As terms *Video* and *Player* might refer to several different things to avoid confusion ZombieBox uses the following terminology:

 * **Video** - ZombieBox class implementing `IStatefulVideo`.
 * **Video Object** - an instance of ZombieBox class implementing `IStatefulVideo`.
 * **Engine** - platform-specific media playback API (i.e. HTML5 `<video>` element, Tizen's AVPlay object).
 * **Media file** - a piece of content for playback or live stream.

# State machine
`IStatefulVideo` is a finite non-deterministic state machine. At any given time it maintains one of pre-determined states and can transit between them either as a result of interface method calls or changes in playback status signaled by the engine (this is what makes it non-deterministic).

Additionally, it controls which interface methods can be called in which state and will not allow illegal transitions or calls by raising exceptions.

## State diagram
![Video States](./Video%20States.jpg)

## Transition pseudo-state
Some engines may be synchronous while some asynchronous. As such it's not possible to guarantee every transition to be instantaneous. **All** transitions *may* have a pending stage in which video object has already left the previous state, but has not properly entered the next one. No interface methods can be called in this pseudo state and no transitions can be made beside pending one.  

Synchronous transition will look like this:

* `play()` method is called
* `EVENT_WILL_PLAY` is instantly synchronously fired
* `EVENT_STATE_EXIT` with old state is fired
* Video changes to `PLAYING` state
* State change effects become visible, picture starts moving
* `EVENT_STATE_ENTER` with new state `PLAYING` is fired
* `EVENT_PLAY` is fired

Asynchronous transition will look like this:

* `play()` method is called
* `EVENT_WILL_PLAY` is instantly synchronously fired
* Video stays in previous state
* Visual playback state is not defined and depends on platform. At some point during transition picture will start to move  
* Some time passes
* `EVENT_STATE_EXIT` with old state is fired
* Video changes to `PLAYING` state
* `EVENT_STATE_ENTER` with new state `PLAYING` is fired
* `EVENT_PLAY` is fired

## States

### Initial
Calling Video constructor instantiates the object and prepares native engine. Video Object will start `IDLE` unless an error occurs, in that case state goes to `INVALID`.

### `IDLE`
Video and Engine objects are successfully created and ready to start playback. Not initialized with Media File. All synchronous Engine setup is done (creating DOM nodes, instantiating native objects, etc...). Can transit to `LOADING` with `prepare()` method. May still require some asynchronous setup, this will be done in `LOADING`. 
Video Object is displaying a black frame.
Can be reached from most states by calling `stop()`. In that case Video frees resource occupied by Media File, but not Engine keeping it ready to start playback of another Media File.

### `INVALID`
A fatal error has occurred while initializing Video or Engine or during playback. Working with Video Object is impossible and it shall be destroyed. Unlikely that playback information can be recovered.

### `LOADING`
Engine is initialized with media file and is preparing for its playback. Some asynchronous platform-specific setup may still be done here.

### `READY`
Engine is ready, video is properly initialized and Media is loaded. Playback can be started immediately. No frames are displayed.

### `PLAYING`
Media file is being continuously displayed.

`TIME_UPDATE` events are being emitted, but there's no guarantee on how often, potentially there might be none at all.

Automatic transition to `WAITING` may occur spontaneously, after which video will restore back to `PLAYING`.

Eventually leads to `ENDED`.

### `PAUSED`
Media file is not being continuously played. Last visible frame is still being displayed. Payback can be restore with `play()`.

### `SEEKING`
A new playback position was requested and is being applied. After position is applied Video Object will return to the state it was in (`PLAYING` or `PAUSED`). If the position equals to or exceeds Media duration however, Video Object may transit to `ENDED` instead. If the previous state was `ENDED`, Video will always transit to `PLAYING` and restart playback.

### `WAITING`
Engine does not have enough Media File data to continue playback and is trying to load it while stalling playback. Last frame is still being displayed.

Once enough data is loaded, Media File continues playback and Video Object transits back to `PLAYING`.

### `ENDED`
Video has naturally reached the end of Media File. Playback can be restarted with `setPosition()` or Media File can be freed by calling `stop()`.

### `ERROR`
Video Object or native engine have encountered an unexpected, but recoverable error. 
Playback is aborted. Media File is still loaded. Video Object did its best to mitigate error and keep sane property values and Engine state. 
Recovery procedure is application's responsibility, Video will allow calling all of its methods and transitions to all states. Video will not transit out of `ERROR` state on its own.
Successful recovery is not guaranteed as it depends on the nature of error and application actions. Safest but not user-friendly course of action is to destroy and re-initialize Video Object.

### `DESTROYED`
Terminal state.
Video Object is deinitialized and freed all the memory occupied by both Media File and Engine Object. Working with Video is impossible and it shall be disposed.

## Methods

### Constructor
Creates Video instance and sets it to `IDLE` state.

### `prepare`
Initializes Engine with Media File and starts loading its content. Also accepts several options that may change Engine behavior. Support of each option depends on platform.

### `destroy`
Frees resources occupied by Media File, platform Engine and Video Object. Removes all listeners, deinitializses any subsystems that were needed for video playback. Transits to `DESTROYED`. Can be called in every or during pending transitions.

### `getDuration`
Returns Media File lengths in milliseconds. For live media returns `Infinity`.

### `getPlaybackRate`
Returns the rate at which frames of the media are displayed.

### `setPlaybackRate`
Sets the rate at which frames of the media are to be displayed.

If called in `PLAYING` this will have an immediate observable effect.

In other states no changes will be made, but by the next time video enters `PLAYING` state the effects will become observable.

### `forward`
Increases media playback rate by platform defined factor.

### `rewind`
Decrease media playback rate by platform defined factor.

### `getState`
Returns current state.

### `getStateTransition`
Returns an object representing pending state transition or `null` if none are happening. 

### `getPosition`
Returns current playback position in milliseconds. Typically not very accurate because of platform or Media format limitations. Both floating point and integer numbers are possible.

Behavior for live streams is not defined. Always returns some number (including `NaN`), but it may be weird and mean different thing depending on platform, format and streaming server settings.

In `ERROR` returns last known position of successful playback.

### `setPosition`
Starts applying new playback position. Transits to `SEEKING` state.

After seeking is done, will automatically transit to the same state `setPosition()` was called in, unless it transits to `ENDED` which may happen if requested position is equal or higher than total Media File duration.

### `getUrl`
Returns URL of Media File Video Object is initialized with.

### `getViewport`
Returns `ViewPort` object.

### `getVolume`
Returns volume of video normalized from `0` to `100`. May be different from system volume or may be the same depending on platform capabilities. If muted, returns volume the system will transit to after un-muting.

### `setVolume`
Sets volume of playback. May be different from system volume or may be the same depending on platform capabilities, guaranteed to change perceived volume regardless.

If muted will set the requested volume and stay muted.

### `volumeDown`
Decreases volume by provided step or by platform-defined if none provided.

### `volumeUp`
Increases volume by provided step or by platform-defined step if none provided.

### `isMuted`
Returns whether the volume is muted. Note that mute is different from volume value of `0`.

### `setMuted`
Mutes audio. Note that mute is different from volume value of `0`. When un-muting, will restore previous volume value.

### `toggleMuted`
Changes mute step to opposite.

### `play`
Starts playback of Media File Video Object is currently initialized with.

### `pause`
Pauses media playback. Stops playback progress, keeps current frame on display.

### `togglePause`
Calls `pause()` in `PLAYING` state and `resume()` in `PAUSED` 

### `stop`
Aborts playback and frees resources occupied by Media File.

### Methods validity
| method          | `IDLE` | `LOADING` | `READY` | `PLAYING` | `SEEKING` | `WAITING` | `PAUSED` | `ENDED` | `ERROR` | `INVALID` | `DESTROYED` |
|-----------------|:------:|:---------:|:-------:|:---------:|:---------:|:---------:|:--------:|:-------:|:-------:|:---------:|:-----------:|
| destroy         |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |             |
| getDuration     |        |           |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |             |
| getPlaybackRate |        |           |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |             |
| getPosition     |        |           |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |             |
| getState        |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| getTransition   |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| getUrl          |        |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |             |
| getViewport     |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| getVolume       |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| isMuted         |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| prepare         |    •   |           |         |           |           |           |          |         |    •    |           |             |
| pause           |        |           |         |     •     |           |           |          |         |    •    |           |             |
| play            |        |           |         |           |           |           |     •    |         |    •    |           |             |
| setPlaybackRate |        |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| setPosition     |        |           |         |     •     |           |     •     |     •    |    •    |    •    |           |             |
| setVolume       |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| stop            |        |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |           |             |
| toggleMuted     |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| volumeDown      |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |
| volumeUp        |    •   |     •     |    •    |     •     |     •     |     •     |     •    |    •    |    •    |     •     |      •      |

## Events
Most transition have 4 events: `EVENT_STATE_EXIT`, `EVENT_STATE_ENTER`, `EVENT_WILL_DO_SOMETHING`, `EVENT_DID_SOMETHING`.

All events are executed synchronously, but as the platform may be either synchronous or asynchronous there's no guarantee how various events will relate to each other.
For example, `WILL_PLAY` and `PLAYING` may fire synchronously one after another or `PLAYING` may be delayed. Execution loop of each even will however always be synchronous. For this reason try to avoid causing side effects that change Video state in concurrent handlers of the same event.

Events `EVENT_STATE_EXIT`, `EVENT_STATE_ENTER` signify changes in video state. They may happen either synchronously or asynchronously. In between them it's generally not safe to manipulate Video or rely on its state. 

Event `EVENT_DID_SOMETHING` is fired synchronously after appropriate `STATE_ENTER`. Mostly syntax sugar.

Because events are synchronous and some platforms also perform operations synchronously, try to use only one kind of event (`STATE_ENTER` or `DID_SOMETHING`) to manipulate Video. Otherwise the order of execution may become weird because call stack would extend from the first event and cause subsequent events to fire before its syntax sugar equivalent. 

Event `WILL_DO_SOMETHING` signifies that one of Video interface methods was called and it intents to perform the associated action synchronously or asynchronously. This can be used to speculatively know what's going to happen next, but actual changed have not been made yet.

### List of events
| Name without `EVENT_` prefix | Arguments                 | Description |
|------------------------------|---------------------------|-------------|
| `STATE_EXITED`               | Previous state, New state | Fired when the video has started transition to the target state |
| `STATE_ENTERED`              | New state, Previous state | Fired when the video has successfully finished transition to the target state |
| `TIME_UPDATE`                | Current playback position | Fired only during `PLAYING` state. Rate at which it fires depends on platform |
| `WILL_PLAY`                  |                           | `play()` method was called, state change and playback start are expected |
| `PLAYING`                    |                           | Playback has actually started. |
| `WILL_PAUSE`                 |                           | `pause()` method was called, state change and pause are expected |
| `PAUSED`                     |                           | Pause has actually happened. |
| `WILL_STOP`                  |                           | `stop()` method was called, state change and video release are expected |
| `IDLE`                       |                           | Video actually stopped. |
| `WILL_SEEK`                  | Expected new position     | `setPosition()` method was called, state change and seeking are expected |
| `SEEKED`                     | New position              | Video actually performed seeking |
| `WILL_CHANGE_RATE`           | Expected new rate         | `setPlaybackRate()`, `forward()` or `rewind()` were called, change of rate is expected |
| `RATE_CHANGE`                | New playback rate         | Video actually changed playback rate |
| `WILL_CHANGE_VOLUME`         | Expected new volume       | `setVolume()`, `volumeUp()` or `volumeDown()` were called change of volume is expected |
| `VOLUME_CHANGE`              | New volume                | Sound volume actually changed |
| `LOADING`                    |                           | `prepare` was called and video has started fetching media file | 
| `READY`                      |                           | Media file fetched and can be played | 
| `WAITING`                    |                           | Playback is stalled | 
| `DEBUG_MESSAGE`              | Message                   | Some debug logs, different on each platform. Typically native events and vital operations | 

### Error event
`EVENT_ERROR` is fired when an error is encountered along with transition to error state. It's fired with a human-readable `string` message that should help with debugging, but may not be safe to parse as it typically comes from underlying platform.
