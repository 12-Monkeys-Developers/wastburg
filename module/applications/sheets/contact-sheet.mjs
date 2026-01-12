import WastburgItemSheet from "./base-item-sheet.mjs"

export default class WastburgContactSheet extends WastburgItemSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: [...super.DEFAULT_OPTIONS.classes, "contact"],
    window: {
      ...super.DEFAULT_OPTIONS.window,
      title: "WASTBURG.ItemTypeContact",
    },
  }

  /** @override */
  static PARTS = {
    sheet: {
      template: "systems/wastburg/templates/v2/item/contact-sheet.hbs",
    },
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    // Add enriched description
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.document.system.description || "",
      { async: true }
    );
    
    return context;
  }
}
