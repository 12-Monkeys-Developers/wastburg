import WastburgActorSheet from "./base-actor-sheet.mjs"

export default class WastburgGourbiSheet extends WastburgActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "gourbi"],
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "WASTBURG.ActorTypeGourbi",
    },
  }

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/wastburg/templates/v2/actor/gourbi-sheet.hbs",
      form: true,
    },
  }

  /** @override */
  tabGroups = {
    primary: "description",
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    
    // Gourbi has minimal specific data
    return context
  }
}
