export let serializerKey = Symbol("Serializer");

export interface Serializable {
  ["@@JSONAPISerializable"]: Serializer
}