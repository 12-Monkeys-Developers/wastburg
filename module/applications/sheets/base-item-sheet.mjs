const { HandlebarsApplicationMixin } = foundry.applications.api

export default class WastburgItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
  }

  #dragDrop

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["wastburg", "item"],
    position: {
      width: 520,
      height: 480,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      resizable: true,
    },
    dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
    actions: {
      editImage: WastburgItemSheet.#onEditImage,
    },
  }

  /** @override */
  async _prepareContext() {
    const context = {
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      item: this.document,
      system: this.document.system,
      source: this.document.toObject(),
      enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description || "", { async: true }),
      isEditable: this.isEditable,
      isGM: game.user.isGM,
      config: CONFIG.WASTBURG,
    }
    return context
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options)
    this.#dragDrop.forEach((d) => d.bind(this.element))
  }

  // #region Drag-and-Drop Workflow
  /**
   * Create drag-and-drop workflow handlers for this Application
   */
  #createDragDropHandlers() {
    return []
  }

  // #region Actions

  /**
   * Handle editing the item image
   * @param {Event} event - The triggering event
   */
  static async #onEditImage(event) {
    event.preventDefault()
    const filePicker = new FilePicker({
      type: "image",
      current: this.document.img,
      callback: (path) => {
        this.document.update({ img: path })
      },
    })
    filePicker.browse()
  }
}
