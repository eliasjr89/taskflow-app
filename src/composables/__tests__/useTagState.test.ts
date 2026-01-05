import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTagState } from "../useTagState";
import api from "../../services/api";

// Mock API
vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("useTagState", () => {
  beforeEach(() => {
    localStorage.clear();
    const { tags } = useTagState();
    tags.value = [];
    vi.clearAllMocks();

    // Default GET behavior: return empty array
    (api.get as any).mockResolvedValue({ data: [] });
    (api.post as any).mockResolvedValue({ data: {} });
    (api.put as any).mockResolvedValue({ data: {} });
    (api.delete as any).mockResolvedValue({ data: {} });
  });

  it("debe inicializar con un array vacío de etiquetas", () => {
    const { tags } = useTagState();
    expect(tags.value).toEqual([]);
  });

  describe("addTag", () => {
    it("debe agregar una nueva etiqueta", async () => {
      const { tags, addTag } = useTagState();

      const newTag = {
        id: "1",
        name: "Urgente",
        color: "red",
        createdAt: new Date(),
      };

      // When addTag calls loadTags, return the new tag
      (api.get as any).mockResolvedValueOnce({ data: [newTag] });

      await addTag(newTag);

      expect(api.post).toHaveBeenCalledWith("/tags", {
        name: newTag.name,
        color: newTag.color,
      });
      expect(tags.value).toHaveLength(1);
      expect(tags.value[0]).toMatchObject({
        name: "Urgente",
        color: "red",
      });
    });
  });

  describe("updateTag", () => {
    it("debe actualizar una etiqueta existente", async () => {
      const { tags, updateTag } = useTagState();

      const tag = {
        id: "test-id",
        name: "Original",
        color: "blue",
        created_at: new Date().toISOString(),
      };

      // Initial state
      tags.value = [tag as any];

      const updatedTag = { ...tag, name: "Actualizado", color: "red" };

      // When updateTag calls loadTags, return updated tag
      (api.get as any).mockResolvedValueOnce({ data: [updatedTag] });

      await updateTag("test-id", { name: "Actualizado" });

      expect(api.put).toHaveBeenCalledWith("/tags/test-id", {
        name: "Actualizado",
      });
      expect(tags.value[0].name).toBe("Actualizado");
    });
  });

  describe("deleteTag", () => {
    it("debe eliminar una etiqueta existente", async () => {
      const { tags, deleteTag } = useTagState();

      const tag1 = { id: "1", name: "Tag 1" };
      const tag2 = { id: "2", name: "Tag 2" };

      // Initial state
      tags.value = [tag1 as any, tag2 as any];

      // When deleteTag calls loadTags, return only tag2
      (api.get as any).mockResolvedValueOnce({ data: [tag2] });

      await deleteTag("1");

      expect(api.delete).toHaveBeenCalledWith("/tags/1");
      expect(tags.value).toHaveLength(1);
      expect(tags.value[0].id).toBe("2");
    });
  });
});
