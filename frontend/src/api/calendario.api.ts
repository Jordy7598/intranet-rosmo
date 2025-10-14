import api from "./axios";

export type ViewScope = "usuario" | "equipo" | "empresa";

export interface CalEvent {
  id: string | number;
  title: string;
  start: string;      // YYYY-MM-DD
  end?: string;       // YYYY-MM-DD
  allDay: boolean;
  color?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extendedProps?: Record<string, any>;
}

export async function getCal(
  year: number,
  month: number,
  view: ViewScope = "usuario"
): Promise<CalEvent[]> {
  const { data } = await api.get("/calendario", { params: { year, month, view } });
  return data?.eventos ?? [];
}
 