/**
 * Data model pour les prévôts
 */
export default class PrevotDataModel extends foundry.abstract.TypeDataModel {
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
      reponsePrevot01: new fields.HTMLField({ initial: "" }),
      reponsePrevot02: new fields.HTMLField({ initial: "" }),
      reponsePrevot03: new fields.HTMLField({ initial: "" }),
      appreciation: new fields.StringField({ initial: "0" })
    };
  }
}
