/**
 * Data model pour les contacts
 */
export default class ContactDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      contactName: new fields.StringField({ initial: "" }),
      value: new fields.NumberField({ initial: 0, integer: true }),
      quartier: new fields.StringField({ initial: "" }),
      trait1: new fields.StringField({ initial: "" }),
      trait2: new fields.StringField({ initial: "" }),
      description: new fields.HTMLField({ initial: "" })
    };
  }
}
