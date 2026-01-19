import { ContextChip } from "@/app/stores/useChatStore";

export const parseDataAttributes = (element: HTMLElement): ContextChip | null => {
  const dataset = element.dataset;

  if (dataset.kpi) {
    return {
      type: "kpi",
      key: dataset.kpi,
      value: dataset.value,
    };
  }

  if (dataset.chart) {
    return {
      type: "chart_point",
      dataset: dataset.chart,
      x: dataset.x,
      y: dataset.y ? Number(dataset.y) : undefined,
    };
  }

  if (dataset.entity) {
    return {
      type: "entity",
      key: dataset.entity,
      value: dataset.value,
    };
  }

  if (dataset.class) {
    return {
      type: "class",
      key: dataset.class,
      value: dataset.value,
    };
  }

  return null;
};

export const formatChipDisplay = (chip: ContextChip): string => {
  switch (chip.type) {
    case "kpi":
      return `${chip.key}: ${chip.value}`;
    case "chart_point":
      return `${chip.dataset} (${chip.x}, ${chip.y})`;
    case "entity":
      return `${chip.key}: ${chip.value}`;
    case "class":
      return `Class ${chip.key}`;
    default:
      return "Context";
  }
};
