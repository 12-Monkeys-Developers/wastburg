import WastburgItemSheet from "./base-item-sheet.mjs"

export default class WastburgTraitSheet extends WastburgItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "trait"],
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "WASTBURG.ItemTypeTrait",
    },
  }

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/wastburg/templates/v2/item/trait-sheet.hbs",
    },
  }

  /** @override */
  async _prepareContext() {
    const context = await super._prepareContext()
    
    // Add enriched historique
    context.enrichedHistorique = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.historique?.value || "", 
      { async: true }
    )
    
    return context
  }
}
