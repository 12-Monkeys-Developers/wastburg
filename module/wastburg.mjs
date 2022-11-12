// Import document classes.
import { WastburgActor } from "./documents/actor.mjs";
import { WastburgItem } from "./documents/item.mjs";
// Import sheet classes.
import { WastburgActorSheet } from "./sheets/actor-sheet.mjs";
import { WastburgItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { WastburgHelpers } from "./helpers/helpers.mjs";
import { WastburgUtility } from "./system/utility.mjs";
import { WASTBURG } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.wastburg = {
    WastburgActor,
    WastburgItem, 
    WastburgUtility
  };

  // Add custom constants for configuration.
  CONFIG.WASTBURG = WASTBURG;


  // Define custom Document classes
  CONFIG.Actor.documentClass = WastburgActor;
  CONFIG.Item.documentClass = WastburgItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wastburg", WastburgActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wastburg", WastburgItemSheet, { makeDefault: true });

  WastburgUtility.registerHooks()
  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();

})

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */



/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once("ready", async function () {
  WastburgHelpers.registerHelpers()
  WastburgUtility.registerSettings()
})

