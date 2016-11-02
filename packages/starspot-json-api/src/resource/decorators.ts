import Resource from "../resource";
import { fieldFor, AttributeField, RelationshipField } from "./fields";

/*
 * Property Decorators
 */
export function attribute(resource: Resource<any>, attribute: string) {
  fieldFor(resource, attribute, AttributeField);
}

export function writable(resource: Resource<any>, attribute: string) {
  fieldFor(resource, attribute, AttributeField).writable = true;
}

export function updatable(resource: Resource<any>, attribute: string) {
  fieldFor(resource, attribute, AttributeField).updatable = true;
}

export function creatable(resource: Resource<any>, attribute: string) {
  fieldFor(resource, attribute, AttributeField).creatable = true;
}

export function readOnly(resource: Resource<any>, attribute: string) {
  fieldFor(resource, attribute, AttributeField).writable = false;
}

/*
 * Class Decorators
 */
export function attributes(...attributes: string[]) {
  return createAttributes(attributes);
}

export function writableAttributes(...attributes: string[]) {
  return createAttributes(attributes, "writable");
}

export function updatableAttributes(...attributes: string[]) {
  return createAttributes(attributes, "updatable");
}

export function creatableAttributes(...attributes: string[]) {
  return createAttributes(attributes, "creatable");
}

function createAttributes(attributes: string[], flag?: string) {
  return function(resourceConstructor: typeof Resource) {
    for (let i = 0; i < attributes.length; i++) {
      let desc = fieldFor(resourceConstructor, attributes[i], AttributeField);
      if (flag) { desc[flag] = true; }
    }
  };
}

export function hasOne(relationship: string) {
  return function(resourceConstructor: typeof Resource) {
    let desc = fieldFor(resourceConstructor, relationship, RelationshipField);
    desc.type = "hasOne";
  };
}