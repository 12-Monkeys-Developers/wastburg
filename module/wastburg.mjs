// Import document classes.
import { WastburgActor } from "./documents/actor.mjs";
import { WastburgItem } from "./documents/item.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { WastburgHelpers } from "./helpers/helpers.mjs";
import { WastburgUtility } from "./system/utility.mjs";
import { WastburgCombatManager } from "./system/combat.mjs";
import { WastburgCommands} from "./system/commands.mjs"
import { WASTBURG } from "./helpers/config.mjs"
import { ClassCounter} from "https://www.uberwald.me/fvtt_appcount/count-class-ready.js"
// Import DataModels
import * as models from "./models/_module.mjs";
// Import AppV2 Sheets
import * as applications from "./applications/_module.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.wastburg = {
    WastburgActor,
    WastburgItem,
    WastburgUtility,
    models,
    applications
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
  CONFIG.Actor.dataModels = {
    personnage: models.PersonnageDataModel,
    prevot: models.PrevotDataModel,
    caid: models.CaidDataModel,
    gourbi: models.GourbiDataModel
  }

  CONFIG.Item.documentClass = WastburgItem;
  CONFIG.Item.dataModels = {
    trait: models.TraitDataModel,
    contact: models.ContactDataModel
  }

  CONFIG.Combat.documentClass = WastburgCombatManager;

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("wastburg", applications.WastburgPersonnageSheet, { types: ["personnage"], makeDefault: true });
  foundry.documents.collections.Actors.registerSheet("wastburg", applications.WastburgPrevotSheet, { types: ["prevot"], makeDefault: true });
  foundry.documents.collections.Actors.registerSheet("wastburg", applications.WastburgCaidSheet, { types: ["caid"], makeDefault: true });
  foundry.documents.collections.Actors.registerSheet("wastburg", applications.WastburgGourbiSheet, { types: ["gourbi"], makeDefault: true });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("wastburg", applications.WastburgTraitSheet, { types: ["trait"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("wastburg", applications.WastburgContactSheet, { types: ["contact"], makeDefault: true });

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

  // Welcome message
  const changelogItems = [
    "Migration en DataModel et Appv2",
    "Révision des styles et rendus des fiches",
    "Amélioration des messages de tchat",
  ].map(item => `<li>${item}</li>`).join('')

  const templateData = {
    version: game.system.version,
    changelog: changelogItems
  }

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/wastburg/templates/chat/welcome-message.hbs",
    templateData
  )

  ChatMessage.create({
    user: game.user.id,
    whisper: [game.user.id],
    content: content
  })

})
