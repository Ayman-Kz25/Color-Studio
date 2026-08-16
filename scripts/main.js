import { initializeState } from "./core/state";

function initializeApp(){
    try {
        
        initializeState()
        /*
         * Initialize shared UI functionality.
         */
        // initializeModuleUI();


        /*
         * Initialize palette-related UI.
         */
        // initializePaletteUI();


        /*
         * Initialize contrast checker UI.
         */
        // initializeContrastUI();


        /*
         * Initialize saved palettes UI.
         */
        // initializeSavedPalettesUI();

        console.info("Color Studio initialized successfully.");
    } catch (error) {
        console.error("Color Studio failed to initialize: ", error);
    }
}

if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}