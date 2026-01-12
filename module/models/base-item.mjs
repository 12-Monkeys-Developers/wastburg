/**
 * Data model de base pour les items Wastburg
 */
export default class BaseItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ initial: "" })
    };
  }
}
