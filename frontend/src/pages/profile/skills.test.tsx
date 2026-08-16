import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";

import type { Skill } from "@/api/users-api";

import SkillsPage from "./skills";

vi.setConfig({ testTimeout: 30000 });

const mockNavigate = vi.hoisted(() => vi.fn());
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

const state = vi.hoisted(() => ({
  query: { data: undefined as Skill[] | undefined, isLoading: false },
  create: { mutate: vi.fn(), isPending: false },
  update: { mutate: vi.fn(), isPending: false },
  del: { mutate: vi.fn(), isPending: false },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}));

vi.mock("react-toastify", () => ({ toast: toastMock }));

vi.mock("@/hooks/use-users-queries", () => ({
  useSkillsQuery: () => state.query,
  useCreateSkillMutation: () => state.create,
  useUpdateSkillMutation: () => state.update,
  useDeleteSkillMutation: () => state.del,
}));

vi.mock("@/components/layouts/page-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/data-display/empty-state", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="empty-state">{message}</div>
  ),
}));

const defaultSkill: Skill = {
  id: "s1",
  skillName: "React",
  proficiencyLevel: "Expert",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <SkillsPage />
    </MemoryRouter>
  );
}

function getItemPaper(text: string): HTMLElement {
  return screen.getByText(text).closest(".MuiPaper-root") as HTMLElement;
}

describe("SkillsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
    state.query.data = [defaultSkill];
    state.query.isLoading = false;
    state.create.isPending = false;
    state.create.mutate = vi.fn();
    state.update.isPending = false;
    state.update.mutate = vi.fn();
    state.del.isPending = false;
    state.del.mutate = vi.fn(
      (_id: string, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()
    );
  });

  it("renders loading skeleton chips while skills are loading", () => {
    state.query.isLoading = true;
    const { container } = renderPage();

    expect(container.querySelectorAll('[class*="MuiSkeleton"]')).toHaveLength(5);
  });

  it("shows an empty state when there are no skills", () => {
    state.query.data = [];
    renderPage();

    expect(screen.getByText("No skills yet. Add your first skill.")).toBeInTheDocument();
  });

  it("renders skills and a proficiency chip only when present", () => {
    state.query.data = [
      defaultSkill,
      {
        id: "s2",
        skillName: "TypeScript",
        proficiencyLevel: "",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ];
    const { container } = renderPage();

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Expert")).toBeInTheDocument();
    expect(container.querySelectorAll(".MuiChip-root")).toHaveLength(1);
  });

  it("requires a skill name before creating", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Skill" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Skill name is required")).toBeInTheDocument();
  });

  it("creates a skill when the form is valid", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Add Skill" }));
    await user.type(screen.getByLabelText("Skill Name *"), "GraphQL");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(state.create.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ skillName: "GraphQL" }),
      expect.anything()
    );
  });

  it("pre-fills the modal when editing and updates the skill", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("React").querySelectorAll("button")[0]);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Edit Skill")).toBeInTheDocument();
    expect(screen.getByLabelText("Skill Name *")).toHaveValue("React");

    const skillName = screen.getByLabelText("Skill Name *");
    await user.clear(skillName);
    await user.type(skillName, "ReactJS");
    await user.click(screen.getByRole("button", { name: "Update" }));

    expect(state.update.mutate).toHaveBeenCalledWith(
      { id: "s1", data: expect.objectContaining({ skillName: "ReactJS" }) },
      expect.anything()
    );
  });

  it("deletes a skill after confirming", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getItemPaper("React").querySelectorAll("button")[1]);

    expect(
      screen.getByText('Delete "React"? This action cannot be undone.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes" }));

    expect(state.del.mutate).toHaveBeenCalledWith("s1", expect.anything());
    expect(toast.success).toHaveBeenCalledWith("Skill deleted");
    expect(
      screen.queryByText('Delete "React"? This action cannot be undone.')
    ).not.toBeInTheDocument();
  });
});
