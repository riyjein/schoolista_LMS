export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  capacity: number;
  type: "classroom" | "laboratory" | "gymnasium" | "auditorium";
}

export const rooms: Room[] = [];

export const getRoomByName = (name: string): Room | undefined =>
  rooms.find((r) => r.name === name);

export const getRoomById = (id: string): Room | undefined =>
  rooms.find((r) => r.id === id);
