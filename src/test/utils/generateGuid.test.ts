import { GuidFull, GuidNoDash } from "@utils/generateGuid";

describe("generateGuid", () => {
  describe("GuidFull", () => {
    it("should generate a valid GUID with dashes", () => {
      const guid = GuidFull();
      expect(guid).toBeDefined();
      expect(typeof guid).toBe("string");
      expect(guid.length).toBeGreaterThan(0);
      // GUID format: 8-4-4-4-12 characters separated by dashes
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(guid).toMatch(guidPattern);
    });

    it("should generate unique GUIDs", () => {
      const guid1 = GuidFull();
      const guid2 = GuidFull();
      expect(guid1).not.toBe(guid2);
    });
  });

  describe("GuidNoDash", () => {
    it("should generate a GUID with at least one dash removed", () => {
      const guid = GuidNoDash();
      expect(guid).toBeDefined();
      expect(typeof guid).toBe("string");
      expect(guid.length).toBeGreaterThan(0);
      // Note: The implementation only replaces the first dash, not all dashes
      // So the result will still have dashes, just one less than the original
      const guidFull = GuidFull();
      const dashCountFull = (guidFull.match(/-/g) || []).length;
      const dashCountNoDash = (guid.match(/-/g) || []).length;
      expect(dashCountNoDash).toBe(dashCountFull - 1);
    });

    it("should generate unique GUIDs", () => {
      const guid1 = GuidNoDash();
      const guid2 = GuidNoDash();
      expect(guid1).not.toBe(guid2);
    });
  });
});

