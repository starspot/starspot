import { expect } from "chai";
import { Serializer } from "../src/";

describe("Serializer", () => {

  describe("serialization protocol", () => {

    it("retrieves protocol from passed model", () => {
      let serializer = new Serializer();
      let model: Serializer.Serializable = {
        "@@SerializerProtocol": {
          getType(model) {
            return "my-type";
          },

          getID(model) {
            return "123";
          },

          getAttributes(model) {
            return ["firstName", "lastName"];
          },

          getAttribute(model, attribute) {
            return attribute === "firstName" ?
              "Tom" :
              "Dale";
          }
        }
      };

      expect(serializer.serialize(model)).to.deep.equal({
        data: {
          id: "123",
          type: "my-type",
          attributes: {
            firstName: "Tom",
            lastName: "Dale"
          }
        }
      });

    });

  });

});