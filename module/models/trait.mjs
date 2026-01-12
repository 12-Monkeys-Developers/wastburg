/**
 * Data model pour les traits
 */
export default class TraitDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ initial: "" }),
      type: new fields.StringField({ initial: "passe" }),
      key: new fields.StringField({ initial: "" }),
      historique: new fields.SchemaField({
        value: new fields.HTMLField({ initial: "" })
      })
    };
  }
}
