# IVideo interface

`IVideo` is an interface class that describes ZombieBox video player abstraction layer. Each platform implements this interface via `AbstractVideo` class and incorporates platform specific implementation.

`IVideo` is a nondeterministic finite state machine without strict control over its states or transitions.

## States

| State        | Description |
|--------------|-------------|
| `UNINITED`   | Video object instance is created, but no actions were performed with it |
| `INITED`     | Ready to play video                                                     |
| `LOADING`    | Initial loading before first play event is fired                        |
| `BUFFERING`  | Video is buffering                                                      |
| `PLAYING`    | Playing                                                                 |
| `PAUSED`     | Paused                                                                  |
| `STOPPED`    | Stopped                                                                 |
| `SEEKING`    | Forwarding/Rewinding                                                    |
| `ENDED`      | Stopped normally after reaching last frame                              |
| `ERROR`      | A fatal error occurred                                                  |
| `DEINITED`   | Video object is deinitialized, no actions are possible with it          |

## Events

| Event                   | Data                         | Description |
|-------------------------|------------------------------|-------------|
| `EVENT_LOAD_START`      |                              | Starting to load video stream
| `EVENT_TIME_UPDATE`     | current timestamp            | Regular updates; Frequency is different between platforms 
| `EVENT_BUFFERING`       |                              | Preloading buffer is filling
| `EVENT_ERROR`           | error text                   | An error occurred
| `EVENT_LOADED_META_DATA`|                              | All video meta data loaded and available
| `EVENT_ENDED`           |                              | Last frame was shown and playback stopped
| `EVENT_PLAY`            |                              | Playback started (including restarting after pause)
| `EVENT_PAUSE`           |                              | Playback paused
| `EVENT_STOP`            |                              | Playbacks stopped; Current position was reset
| `EVENT_RATE_CHANGE`     | new playback speed           | Playback speed changed
| `EVENT_VOLUME_CHANGE`   | new volume level             | Player volume has changed
| `EVENT_STATE_CHANGE`    | new state and previous state | IVideo state changed 
| `EVENT_DURATION_CHANGE` | new total duration           | Received new information on media duration


## Action, State and Event flow 

### Example

#### <Current state>
* <Method call or event> --> <New Staete> [<Emitted events>[, ...]]
* [...]
	
### List

#### `UNINITED`
* Object creation --> `INITED` []	

#### `INITED`
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `play()` --> `LOADING` [`EVENT_LOAD_START`]

#### `LOADING`
* Metadata loaded --> `BUFFERING` [`EVENT_LOADED_META_DATA`, `EVENT_BUFFERING`]
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `play()` --> `LOADING` [`EVENT_LOAD_START`]

#### `BUFFERING`
* Buffer filled --> `PLAYING` [`EVENT_DURATION_CHANGE(duration)`, `EVENT_PLAY`] 
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `pause()` --> `PAUSED` [`EVENT_PAUSE`]
* `play()` --> `LOADING` [`EVENT_LOAD_START`]
* `stop()` --> `STOPPED` [`EVENT_STOP`, `EVENT_TIME_UPDATE(0)`, `EVENT_DURATION_CHANGE(0)`]

#### `PLAYING`
* Buffer is exhausted --> `BUFFERING` [`EVENT_BUFFERING`]
* Reached end of media stream --> `ENDED` [`EVENT_ENDED`]
* Playback position changed --> `PLAYING` [`EVENT_TIME_UPDATE(position)`]
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `forward()` --> `PLAYING` [`EVENT_PLAY`, `EVENT_RATE_CHANGE(rate)`]
* `pause()` --> `PAUSED` [`EVENT_PAUSE`]
* `play()` --> `LOADING` [`EVENT_LOAD_START`]
* `rewind()` --> `PLAYING` [`EVENT_PLAY`, `EVENT_RATE_CHANGE(rate)`]
* `setPosition()` --> `SEEKING` [`EVENT_TIME_UPDATE(position)`]
* `stop()` --> `STOPPED` [`EVENT_STOP`, `EVENT_TIME_UPDATE(0)`, `EVENT_DURATION_CHANGE(0)`]	

#### `PAUSED`
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `forward()` --> `PLAYING` [`EVENT_PLAY`, `EVENT_RATE_CHANGE(rate)`]
* `pause()` --> `PAUSED` [`EVENT_PAUSE`]
* `play()` --> `LOADING` [`EVENT_LOAD_START`]
* `resume()` --> `PLAYING` [`EVENT_PLAY`]
* `rewind()` --> `PLAYING` [`EVENT_PLAY`, `EVENT_RATE_CHANGE(rate)`]
* `setPosition()` --> `SEEKING` [`EVENT_TIME_UPDATE(position)`]
* `stop()` --> `STOPPED` [`EVENT_STOP`, `EVENT_TIME_UPDATE(0)`, `EVENT_DURATION_CHANGE(0)`]	

#### `STOPPED`
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `play()` --> `LOADING` [`EVENT_LOAD_START`]

#### `SEEKING`
* Reached requested position --> `PLAYING` [`EVENT_PLAY`]
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `pause()` --> `PAUSED` [`EVENT_PAUSE`]
* `play()` --> `LOADING` [`EVENT_LOAD_START`]
* `setPosition()` --> `SEEKING` [`EVENT_TIME_UPDATE(position)`]
* `stop()` --> `STOPPED` [`EVENT_STOP`, `EVENT_TIME_UPDATE(0)`, `EVENT_DURATION_CHANGE(0)`]

#### `ENDED`
* Error occurred --> `ERROR` [`EVENT_ERROR(error)`]
* `destroy()` --> `DEINITED` []
* `play()` --> `LOADING` [`EVENT_LOAD_START`]
* `stop()` --> `STOPPED` [`EVENT_STOP`, `EVENT_TIME_UPDATE(0)`, `EVENT_DURATION_CHANGE(0)`]

#### `DEINITED`
* Video object is destroyed.
