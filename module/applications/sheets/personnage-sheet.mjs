import WastburgActorSheet from "./base-actor-sheet.mjs"

export default class WastburgPersonnageSheet extends WastburgActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "personnage"],
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "WASTBURG.ActorTypePersonnage",
    },
  }

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/wastburg/templates/v2/actor/personnage-sheet.hbs",
    },
  }

  /** @override */
  tabGroups = {
    primary: "etats",
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    const actor = this.document

    // Add personnage-specific data
    context.traits = actor.items.filter(i => i.type === "trait")
    context.contacts = actor.items.filter(i => i.type === "contact")
    context.config = CONFIG.WASTBURG

    return context
  }
}
