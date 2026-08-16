import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FormCardSelectField from "./form-card-select-field";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

describe("FormCardSelectField", () => {
  it("renders the label", () => {
    render(
      <FormCardSelectField
        label="Preference"
        value="a"
        onChange={vi.fn()}
        options={options}
      />
    );

    expect(screen.getByText("Preference", { selector: "label" })).toBeInTheDocument();
  });

  it("renders an option per item", async () => {
    const user = userEvent.setup();

    render(
      <FormCardSelectField
        label="Preference"
        value="a"
        onChange={vi.fn()}
        options={options}
      />
    );

    await user.click(screen.getByRole("combobox"));
    const optionEls = await screen.findAllByRole("option");
    expect(optionEls).toHaveLength(2);
    expect(optionEls[0]).toHaveTextContent("Option A");
    expect(optionEls[1]).toHaveTextContent("Option B");
  });

  it("fires onChange with the selected value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormCardSelectField
        label="Preference"
        value="a"
        onChange={onChange}
        options={options}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Option B" }));

    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("disables the select when disabled", () => {
    render(
      <FormCardSelectField
        label="Preference"
        value="a"
        onChange={vi.fn()}
        options={options}
        disabled
      />
    );

    expect(screen.getByRole("combobox")).toHaveAttribute("aria-disabled", "true");
  });
});
