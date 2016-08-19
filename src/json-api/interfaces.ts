namespace JSONAPI {
  export type ID = string | number;

  // interface TopLevel {
  //   data?: {};
  //   errors?: any[];
  // }

  export interface LinkObject {
    href: string;
    meta: any;
  }

  export type Link = LinkObject | string;

  export interface LinksAbout {
    about: Link;
  }

  export interface Error {
    /**  a unique identifier for this particular occurrence of the problem. */
    id: ID;

    /** a links object containing an `about` field */
    links: LinksAbout;

    /**  the HTTP status code applicable to this problem, expressed as a string value. */
    status: string;

    /** an application-specific error code, expressed as a string value. */
    code: string;

    /** a short, human-readable summary of the problem that SHOULD NOT change
     *  from occurrence to occurrence of the problem, except for purposes of
     *  localization. */
    title: string;

    /** a human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized. */
    detail: string;

    /**  an object containing references to the source of the error */
    source: any;

    /** a meta object containing non-standard meta-information about the error. */
    meta: any;
  }
}

export default JSONAPI;