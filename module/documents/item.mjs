/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */

 export const defaultItemImg = {
  contact: "systems/wastburg/assets/icons/icon_contact.webp",
  trait: "systems/wastburg/assets/icons/icon_trait.webp"
 }

export class WastburgItem extends Item {

  constructor(data, context) {
    if (!data.img) {
      data.img = defaultItemImg[data.type];
    }
    super(data, context);
  }

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    let data = this.actor.getData();
    data.item = foundry.utils.deepClone(this.system);

    return data;
  }

}
