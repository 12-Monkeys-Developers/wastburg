import WastburgActorSheet from "./base-actor-sheet.mjs"

export default class WastburgPrevotSheet extends WastburgActorSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "prevot"],
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "WASTBURG.ActorTypePrevot",
    },
  }

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/wastburg/templates/v2/actor/prevot-sheet.hbs",
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

    // Add prevot-specific data
    context.traits = actor.items.filter(i => i.type === "trait")
    context.selectRollInput = 0

    return context
  }
}
