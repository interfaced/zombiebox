# Application lifecycle

## Build

Main Application module (as defined in `project.entry` config dir) should export a constructor for main application class, typically one inheriting from `BaseApplication` which in turns inherits `AbstractApplication`. `BaseApplication` is an automatically generated class that includes initialisation of platforms for the specific application.

Build system will generate another module that imports the main application constructor and instantiates it (`app.js` in `generatedCode` directory). This module wil be added to compilation sources.

## Application start

`AbstractApplication` waits for window `load` event and creates base application DOM nodes. `EVENT_DOM_READY` is fired after this stage is finished.

Then `BaseApplication` selects and initialises appropriate device abstraction layer classes. `EVENT_DEVICE_READY` signals this is done.

After that `AbstractApplication` finishes up initialisation of framework components (`InputDispatcher`, `LayerManger`, etc...) and calls its `onStart()` hook passing control to `Application`. Initialise your application components and business logic here.

Typically, the application will display a splash screen at this point and after loading is done call `home()` to show its first scene.

## App exit

Calling `exit()` or pressing back button when history is empty will invoke `onExit` hook and then call device `exit()` method which closes application in accordance with device specific procedure.
