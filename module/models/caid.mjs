/**
 * Data model pour les caïds
 */
export default class CaidDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      biography: new fields.HTMLField({ initial: "" }),
      lieunaissance: new fields.StringField({ initial: "" }),
      age: new fields.StringField({ initial: "" }),
      residence: new fields.StringField({ initial: "" }),
      signes: new fields.HTMLField({ initial: "" }),
      persotype: new fields.StringField({ initial: "gardoche" }),
      note: new fields.HTMLField({ initial: "" }),
      arme: new fields.HTMLField({ initial: "" }),
      protection: new fields.HTMLField({ initial: "" }),
      materiel: new fields.HTMLField({ initial: "" }),
      fortune: new fields.HTMLField({ initial: "" }),
      dettes: new fields.HTMLField({ initial: "" }),
      anciennete: new fields.StringField({ initial: "" }),
      reponseCaid01: new fields.HTMLField({ initial: "" }),
      reponseCaid02: new fields.HTMLField({ initial: "" }),
      reponseCaid03: new fields.HTMLField({ initial: "" }),
      confiance: new fields.StringField({ initial: "0" })
    };
  }
}
