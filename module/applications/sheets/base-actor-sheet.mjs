const { HandlebarsApplicationMixin } = foundry.applications.api

export default class WastburgActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
  /**
   * Different sheet modes.
   * @enum {number}
   */
  static SHEET_MODES = { EDIT: 0, PLAY: 1 }

  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
    this._sheetMode = this.constructor.SHEET_MODES.PLAY
  }

  #dragDrop

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["wastburg", "sheet", "actor"],
    position: {
      width: 620,
      height: 740,
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
    window: {
      resizable: true,
    },
    tabs: [
      {
        navSelector: 'nav[data-group="primary"]',
        contentSelector: "section.sheet-body",
        initial: "etats",
      },
    ],
    dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
    actions: {
      editImage: WastburgActorSheet.#onEditImage,
      toggleSheet: WastburgActorSheet.#onToggleSheet,
      changeTab: WastburgActorSheet.#onChangeTab,
      editItem: WastburgActorSheet.#onEditItem,
      deleteItem: WastburgActorSheet.#onDeleteItem,
      createItem: WastburgActorSheet.#onCreateItem,
      rollDice: WastburgActorSheet.#onRollDice,
      rollComplex: WastburgActorSheet.#onRollComplex,
      rollSimpleMJ: WastburgActorSheet.#onRollSimpleMJ,
      rollSante: WastburgActorSheet.#onRollSante,
      rollMental: WastburgActorSheet.#onRollMental,
      rollSocial: WastburgActorSheet.#onRollSocial,
      rollTrait: WastburgActorSheet.#onRollTrait,
      rollContact: WastburgActorSheet.#onRollContact,
      gelderPlus: WastburgActorSheet.#onGelderPlus,
      gelderMinus: WastburgActorSheet.#onGelderMinus,
      santePlus: WastburgActorSheet.#onSantePlus,
      santeMinus: WastburgActorSheet.#onSanteMinus,
    },
  }

  /**
   * Is the sheet currently in 'Play' mode?
   * @type {boolean}
   */
  get isPlayMode() {
    if (this._sheetMode === undefined) this._sheetMode = this.constructor.SHEET_MODES.PLAY
    return this._sheetMode === this.constructor.SHEET_MODES.PLAY
  }

  /**
   * Is the sheet currently in 'Edit' mode?
   * @type {boolean}
   */
  get isEditMode() {
    if (this._sheetMode === undefined) this._sheetMode = this.constructor.SHEET_MODES.PLAY
    return this._sheetMode === this.constructor.SHEET_MODES.EDIT
  }

  /**
   * Tab groups state
   * @type {object}
   */
  tabGroups = { primary: "etats" }

  /** @override */
  async _prepareContext() {
    const actor = this.document

    const context = {
      actor: actor,
      system: actor.system,
      source: actor.toObject(),
      fields: actor.schema.fields,
      systemFields: actor.system.schema.fields,
      isEditable: this.isEditable,
      isEditMode: this.isEditMode,
      isPlayMode: this.isPlayMode,
      isGM: game.user.isGM,
      config: CONFIG.WASTBURG,
      activeTab: this.tabGroups.primary || "etats",
      enrichedBiography: await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.biography || "", { async: true }),
      enrichedNote: await foundry.applications.ux.TextEditor.implementation.enrichHTML(actor.system.note || "", { async: true }),
      aubaindeDeGroupe: game.settings.get("wastburg", "aubaine-de-groupe"),
      combatRules: game.settings.get("wastburg", "house-combat-rules"),
    }
    return context
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options)
    this.#dragDrop.forEach((d) => d.bind(this.element))

    // Activate tab navigation manually
    const nav = this.element.querySelector('nav.tabs[data-group]')
    if (nav) {
      const group = nav.dataset.group
      const activeTab = this.tabGroups[group] || "etats"
      nav.querySelectorAll('[data-tab]').forEach(link => {
        const tab = link.dataset.tab
        link.classList.toggle('active', tab === activeTab)
        link.addEventListener('click', (event) => {
          event.preventDefault()
          this.tabGroups[group] = tab
          this.render()
        })
      })

      // Show/hide tab content
      this.element.querySelectorAll('[data-group="' + group + '"][data-tab]').forEach(content => {
        content.classList.toggle('active', content.dataset.tab === activeTab)
      })
    }
  }

  // #region Drag-and-Drop Workflow
  /**
   * Create drag-and-drop workflow handlers for this Application
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      }
      d.callbacks = {
        drop: this._onDrop.bind(this),
      }
      return new foundry.applications.ux.DragDrop.implementation(d)
    })
  }

  /**
   * Can the User start a drag event?
   * @param {string} selector
   * @returns {boolean}
   * @protected
   */
  _canDragStart(selector) {
    return this.isEditable
  }

  /**
   * Can the User drop an item?
   * @param {string} selector
   * @returns {boolean}
   * @protected
   */
  _canDragDrop(selector) {
    return this.isEditable
  }

  /**
   * Handle drop events
   * @param {DragEvent} event
   * @protected
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event)
    const actor = this.document

    if (data.type === "Item") {
      return this._onDropItem(event, data)
    }
  }

  /**
   * Handle dropping an item on the actor sheet
   * @param {DragEvent} event
   * @param {object} data
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.document.isOwner) return false
    const item = await Item.implementation.fromDropData(data)

    // Handle item from another actor
    if (item.parent?.uuid !== this.document.uuid) {
      return this.document.createEmbeddedDocuments("Item", [item.toObject()])
    }
  }

  // #region Actions

  /**
   * Handle editing the actor image
   * @param {Event} event - The triggering event
   */
  static async #onEditImage(event) {
    event.preventDefault()
    const sheet = this
    const filePicker = new FilePicker({
      type: "image",
      current: sheet.document.img,
      callback: (path) => {
        sheet.document.update({ img: path })
      },
    })
    filePicker.browse()
  }

  /**
   * Handle changing tabs
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onChangeTab(event, target) {
    event.preventDefault()
    const tab = target.dataset.tab
    const group = target.closest('nav')?.dataset.group || 'primary'
    this.tabGroups[group] = tab
    this.render()
  }

  /**
   * Handle toggling the sheet mode
   * @param {Event} event - The triggering event
   */
  static async #onToggleSheet(event) {
    event.preventDefault()
    const sheet = this
    sheet._sheetMode = sheet._sheetMode === sheet.constructor.SHEET_MODES.PLAY
      ? sheet.constructor.SHEET_MODES.EDIT
      : sheet.constructor.SHEET_MODES.PLAY
    sheet.render()
  }

  /**
   * Handle editing an item
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onEditItem(event, target) {
    const li = target.closest(".item")
    const itemId = li?.dataset.itemId
    if (!itemId) return
    const item = this.actor.items.get(itemId)
    if (item) item.sheet.render(true)
  }

  /**
   * Handle deleting an item
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onDeleteItem(event, target) {
    const li = target.closest(".item")
    const itemId = li?.dataset.itemId
    if (!itemId) return

    const item = this.actor.items.get(itemId)
    if (!item) return

    const confirmed = await Dialog.confirm({
      title: "Suppression de " + item.name,
      content: "Suppression de l'élément " + item.name + " ?",
    })

    if (confirmed) {
      await item.delete()
    }
  }

  /**
   * Handle creating an item
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onCreateItem(event, target) {
    const itemType = target.dataset.itemType
    let name = "Nouveau"
    if (itemType == "trait") {
      name = "Nouveau Trait"
    } else if (itemType == "contact") {
      name = "Nouveau Contact"
    }
    const itemName = game.i18n.format(name, { type: itemType })
    await this.actor.createEmbeddedDocuments("Item", [{
      name: itemName,
      type: itemType
    }], { renderSheet: true })
  }

  /**
   * Handle rolling dice
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollDice(event, target) {
    event.preventDefault()
    const actor = this.document
    const mode = parseInt(target.dataset.mode) || 0
    await actor.rollDice(mode)
  }

  /**
   * Handle rolling complex test
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollComplex(event, target) {
    event.preventDefault()
    const actor = this.document
    await actor.rollComplex()
  }

  /**
   * Handle simple MJ roll (for Prévôt/Caïd sheets)
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollSimpleMJ(event, target) {
    event.preventDefault()
    const form = target.closest('form') || target.closest('section')
    const selectInput = form?.querySelector('select[name="selectRollInput"]')
    if (!selectInput) return
    
    const level = parseInt(selectInput.value) || 0
    const actor = this.document
    await actor.rollDice(level)
  }

  /**
   * Handle rolling santé
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollSante(event, target) {
    event.preventDefault()
    const actor = this.document
    await actor.rollSante()
  }

  /**
   * Handle rolling mental
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollMental(event, target) {
    event.preventDefault()
    const actor = this.document
    await actor.rollMental()
  }

  /**
   * Handle rolling social
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollSocial(event, target) {
    event.preventDefault()
    const actor = this.document
    await actor.rollSocial()
  }

  /**
   * Handle rolling a trait
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollTrait(event, target) {
    event.preventDefault()
    const li = target.closest('[data-item-id]')
    const traitId = li?.dataset.itemId
    const actor = this.document
    await actor.rollTrait(traitId)
  }

  /**
   * Handle rolling a contact
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  static async #onRollContact(event, target) {
    event.preventDefault()
    const li = target.closest('[data-item-id]')
    const contactId = li?.dataset.itemId
    const actor = this.document
    await actor.rollContact(contactId)
  }

  /**
   * Handle incrementing gelder
   * @param {Event} event - The triggering event
   */
  static async #onGelderPlus(event) {
    event.preventDefault()
    this.document.modifyGelder(1)
  }

  /**
   * Handle decrementing gelder
   * @param {Event} event - The triggering event
   */
  static async #onGelderMinus(event) {
    event.preventDefault()
    this.document.modifyGelder(-1)
  }

  /**
   * Handle incrementing sante
   * @param {Event} event - The triggering event
   */
  static async #onSantePlus(event) {
    event.preventDefault()
    this.document.modifySante(1)
  }

  /**
   * Handle decrementing sante
   * @param {Event} event - The triggering event
   */
  static async #onSanteMinus(event) {
    event.preventDefault()
    this.document.modifySante(-1)
  }
}
