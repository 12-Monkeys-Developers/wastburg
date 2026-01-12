import WastburgActorSheet from "./base-actor-sheet.mjs"

export default class WastburgCaidSheet extends WastburgActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "caid"],
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "WASTBURG.ActorTypeCaid",
    },
  }

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/wastburg/templates/v2/actor/caid-sheet.hbs",
      form: true,
    },
  }

  /** @override */
  tabGroups = {
    primary: "biodata",
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    const actor = this.document

    // Add caid-specific data
    context.traits = actor.items.filter(i => i.type === "trait")
    context.selectRollInput = 0

    return context
  }
}
