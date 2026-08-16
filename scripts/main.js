import { initializeState } from "./core/state";
import { initializeModuleUI } from "./ui/moduleUI";
import { initializePaletteUI } from "./ui/paletteUI";

function initializeApp(){
    try {
        
        initializeState()
        
        initializeModuleUI();

        initializePaletteUI();

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