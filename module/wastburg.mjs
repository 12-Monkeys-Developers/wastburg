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
import { WastburgCombatManager } from "./system/combat.mjs";
import { WastburgCommands} from "./system/commands.mjs"
import { WASTBURG } from "./helpers/config.mjs"
import { ClassCounter} from "https://www.uberwald.me/fvtt_appcount/count-class-ready.js"

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

    /* -------------------------------------------- */
  // Set an initiative formula for the system 
  CONFIG.Combat.initiative = {
    formula: "1d6",
    decimals: 0
  }

  // Define custom Document classes
  CONFIG.Actor.documentClass = WastburgActor;
  CONFIG.Item.documentClass = WastburgItem;
  CONFIG.Combat.documentClass = WastburgCombatManager;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wastburg", WastburgActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wastburg", WastburgItemSheet, { makeDefault: true });

  WastburgUtility.registerHooks()
  WastburgUtility.setupBanner()
  WastburgCommands.init()

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

  // Ready stage init
  WastburgHelpers.registerHelpers()
  WastburgUtility.registerSettings()

  // World count
  ClassCounter.registerUsageCount("MyApp")
  
  /*// CSS patch for v9
  if (game.version) {
    let sidebar = document.getElementById("sidebar");
    sidebar.style.width = "min-content";
  }*/

  // Welcome messages
  ChatMessage.create({
    user: game.user.id,
    whisper: [game.user.id],
    content: `<div id="welcome-message-wastburg"><span class="rdd-roll-part">
    <strong>Bienvenu dans le système Wastburg pour FoundryVTT</strong>, développé par LeRatierBretonnien, sur un travail initial de MagisterPhantom.
    <br><strong>Wastburg</strong> est un jeu édité par les XII Singes, sur la base d'un roman de Cédric Ferrand. Ce système est publié avec leur autorisation.
    <br>Tout les livres de la <a href="https://www.les12singes.com/9-wastburg">gamme sont disponibles à l'achat via ce lien</a>.
    <br>Support et assistance sur le <a href="https://discord.gg/pPSDNJk">Discord FR de Foundry</a>.
    <br><strong>Bon courage les Gardoches !</strong>
    <br><strong> Quoi d'neuf dans le quartier (v${game.system.version}) ?</strong>
    <br>- Augmentation de la taille des zones d'équipement,
    <br>- Bannières des compendiums,
    <br>- Correction des styles CSS pour les compendiums`
  } )

})

