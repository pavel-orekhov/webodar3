import test from "node:test";
import assert from "node:assert";
import { encodePlantUML, validatePlantUMLCode } from "../netlify/mcp-server/tools/plantuml-encoder";

test("PlantUML Encoder", async (t) => {
  await t.test("should encode valid diagram", () => {
    const code = "@startuml\nA -> B: Hello\n@enduml";
    const encoded = encodePlantUML(code);
    assert.ok(encoded);
    assert.strictEqual(typeof encoded, "string");
  });

  await t.test("should throw error for empty code", () => {
    assert.throws(() => validatePlantUMLCode(""), { message: "EMPTY_CODE" });
    assert.throws(() => validatePlantUMLCode("   "), { message: "EMPTY_CODE" });
  });

  await t.test("should throw error for large code", () => {
    const largeCode = "a".repeat(50 * 1024 + 1);
    assert.throws(() => validatePlantUMLCode(largeCode), { message: "CODE_TOO_LARGE" });
  });

  await t.test("should be deterministic", () => {
    const code = "@startuml\nA -> B: Hello\n@enduml";
    const encoded1 = encodePlantUML(code);
    const encoded2 = encodePlantUML(code);
    assert.strictEqual(encoded1, encoded2);
  });
});
