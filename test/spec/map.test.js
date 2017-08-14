import { expect } from "chai";
import map from "../../lib/spec/map";
import * as p from "../../lib/predicates";
import { explainData } from "../../index";
import { invalid, optional } from "../../lib/symbols";

function generateConformTests(testData, expectFn) {
  testData.forEach(test =>
    it(`[${test.message}]`, () => {
      const result = expectFn(test);
      if (test.expectedValid) {
        expect(result, test.message).to.deep.equal(test.value);
      } else {
        expect(result).to.be.a("symbol");
        expect(result, test.message).to.equal(invalid);
      }
    })
  );
}

describe("map", () => {
  describe("explain", () => {
    describe("works on nested maps", () => {
      const school = map("school", {
        district: p.string
      });
      const friend = map("friend", {
        name: p.string,
        school
      });

      it("[missing key]", () => {
        const value = {
          name: "holger",
          school: {}
        };
        const missingKey = explainData(friend, value);
        expect(missingKey).to.be.an("array").and.have.length(1);
        expect(missingKey).to.have.deep
          .property("[0].predicate")
          .that.is.a("function");
        expect(missingKey).to.have.deep
          .property("[0].path")
          .that.is.an("array")
          .and.deep.equals(["school", "district"]);
        expect(missingKey).to.have.deep
          .property("[0].via")
          .that.is.an("array")
          .and.deep.equals(["friend", "school", "Keys(school)"]);
        expect(missingKey).to.have.deep
          .property("[0].value")
          .that.deep.equals(value.school);
      });

      it("[invalid key]", () => {
        const value = {
          name: "holger",
          school: {
            district: 9
          }
        };
        const invalidKey = explainData(friend, value);
        expect(invalidKey).to.be.an("array").and.have.length(1);
        expect(invalidKey).to.have.deep
          .property("[0].predicate")
          .that.is.a("function");
        expect(invalidKey).to.have.deep
          .property("[0].path")
          .that.deep.equals(["school", "district"]);
        expect(invalidKey).to.have.deep
          .property("[0].via")
          .that.deep.equals(["friend", "school", "isString"]);
        expect(invalidKey).to.have.deep
          .property("[0].value")
          .that.deep.equals(9);
      });
    });

    describe("works on flat maps", () => {
      const friend = map("friend", {
        name: p.string,
        [optional]: {
          phone: p.string
        }
      });

      it("[missing key]", () => {
        const missingKey = explainData(friend, {
          district: "xhain"
        });
        expect(missingKey).to.be.an("array").and.have.length(1);
        expect(missingKey).to.have.deep
          .property("[0].predicate")
          .that.is.a("function");
        expect(missingKey).to.have.deep
          .property("[0].path")
          .that.is.an("array")
          .and.deep.equals(["name"]);
        expect(missingKey).to.have.deep
          .property("[0].via")
          .that.is.an("array")
          .and.deep.equals(["friend", "Keys(friend)"]);
        expect(missingKey).to.have.deep.property("[0].value").that.deep.equals({
          district: "xhain"
        });
      });

      it("[invalid key]", () => {
        const invalidKey = explainData(friend, {
          name: 3000
        });
        expect(invalidKey).to.be.an("array").and.have.length(1);
        expect(invalidKey).to.have.deep
          .property("[0].predicate")
          .that.is.a("function");
        expect(invalidKey).to.have.deep
          .property("[0].path")
          .that.deep.equals(["name"]);
        expect(invalidKey).to.have.deep
          .property("[0].via")
          .that.deep.equals(["friend", "isString"]);
        expect(invalidKey).to.have.deep
          .property("[0].value")
          .that.deep.equals(3000);
      });
    });

    describe("works on optional-only maps", () => {
      const caller = map("caller", {
        [optional]: {
          phone: p.number
        }
      });

      it("[invalid key]", () => {
        const invalidKey = explainData(caller, {
          phone: "stone"
        });
        expect(invalidKey).to.be.an("array").and.have.length(1);
        expect(invalidKey).to.have.deep
          .property("[0].predicate")
          .that.is.a("function");
        expect(invalidKey).to.have.deep
          .property("[0].path")
          .that.is.an("array")
          .and.deep.equals(["phone"]);
        expect(invalidKey).to.have.deep
          .property("[0].via")
          .that.is.an("array")
          .and.deep.equals(["caller", "isNumber"]);
        expect(invalidKey).to.have.deep
          .property("[0].value")
          .that.equals("stone");
      });
    });
  });

  describe("conform", () => {
    describe("works on nested maps", () => {
      const school = map("school", {
        district: p.string
      });
      const friend = map("friend", {
        name: p.string,
        school
      });

      const TEST_DATA = [
        {
          value: {
            name: "holger",
            school: {
              district: "xhain"
            }
          },
          message: "happy case",
          expectedValid: true
        },
        {
          value: {
            name: "holger",
            school: {
              district: 9
            }
          },
          message: "invalid nested key",
          expectedValid: false
        },
        {
          value: {
            name: "holger",
            school: {}
          },
          message: "missing required nested key",
          expectedValid: false
        },
        {
          value: {
            name: "holger",
            university: {
              district: "xhain"
            }
          },
          message: "wrong required nested key",
          expectedValid: false
        }
      ];

      generateConformTests(TEST_DATA, test => friend.conform(test.value));
    });

    describe("works on spec aliases", () => {
      const school = map("school", {
        district: p.string
      });
      const friend = map("friend", {
        name: p.string,
        school
      });

      const TEST_DATA = [
        {
          value: {
            name: "holger",
            school: {
              district: "xhain"
            }
          },
          message: "happy case",
          expectedValid: true
        },
        {
          value: {
            name: "holger",
            school: {
              district: 9
            }
          },
          message: "invalid nested key",
          expectedValid: false
        },
        {
          value: {
            name: "holger",
            school: {}
          },
          message: "missing required nested key",
          expectedValid: false
        },
        {
          value: {
            name: "holger",
            university: {
              district: "xhain"
            }
          },
          message: "wrong required nested key",
          expectedValid: false
        }
      ];

      generateConformTests(TEST_DATA, test => friend.conform(test.value));
    });

    describe("works on flat maps", () => {
      const symbolKey = Symbol();
      const spec = map("symbolKey", {
        name: p.string,
        [optional]: {
          [symbolKey]: p.int,
          phone: p.string
        }
      });
      const TEST_DATA = [
        {
          message: "conform required, no optional",
          value: {
            name: "holger"
          },
          expectedValid: true
        },
        {
          message: "invalid required",
          value: {
            name: 3000
          },
          expectedValid: false
        },
        {
          message: "conform required, conform optional",
          value: {
            name: "holger",
            phone: "1234"
          },
          expectedValid: true
        },
        {
          message: "conform required, invalid optional",
          value: {
            name: "holger",
            phone: 301582
          },
          expectedValid: false
        },
        {
          message: "missing required",
          value: {
            foo: "bar"
          },
          expectedValid: false
        },
        {
          message: "additional keys",
          value: {
            name: "holger",
            bestFriend: false
          },
          expectedValid: true
        },
        {
          message: "conform optional symbol key",
          value: {
            name: "holger",
            [symbolKey]: 12
          },
          expectedValid: true
        },
        {
          message: "invalid optional symbol key",
          value: {
            name: "holger",
            [symbolKey]: "12"
          },
          expectedValid: false
        }
      ];

      it("[invalid required symbol key]", () => {
        const sym = Symbol();
        const s = map("sym", {
          [sym]: p.int
        });
        expect(
          s.conform({
            [sym]: "1"
          })
        ).to.equal(invalid);
      });

      it("[missing required symbol key]", () => {
        const sym = Symbol();
        const s = map("s", {
          [sym]: p.int
        });
        expect(
          s.conform({
            sym: 1
          })
        ).to.equal(invalid);
      });

      generateConformTests(TEST_DATA, test => spec.conform(test.value));
    });

    describe("works on optional-only maps", () => {
      const caller = map("caller", {
        [optional]: {
          phone: p.number
        }
      });

      const TEST_DATA = [
        {
          value: {
            phone: 18005551212
          },
          message: "happy case",
          expectedValid: true
        },
        {
          value: {
            phone: "seashore"
          },
          message: "invalid key",
          expectedValid: false
        },
        {
          value: {
            tollFree: true
          },
          message: "additional keys",
          expectedValid: true
        },
        {
          value: {},
          message: "empty object",
          expectedValid: true
        }
      ];

      generateConformTests(TEST_DATA, test => caller.conform(test.value));
    });
  });
});
