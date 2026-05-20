export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  capacity: number;
  type: 'classroom' | 'laboratory' | 'gymnasium' | 'auditorium';
}

export const rooms: Room[] = [
  {
    id: 'room-1',
    code: 'CS-LAB-1',
    name: 'CS Lab 1',
    building: 'College of Computer Studies Building',
    capacity: 35,
    type: 'laboratory',
  },
  {
    id: 'room-2',
    code: 'CS-LAB-2',
    name: 'CS Lab 2',
    building: 'College of Computer Studies Building',
    capacity: 35,
    type: 'laboratory',
  },
  {
    id: 'room-3',
    code: 'ROOM-201',
    name: 'Room 201',
    building: 'Main Building',
    capacity: 40,
    type: 'classroom',
  },
  {
    id: 'room-4',
    code: 'ROOM-302',
    name: 'Room 302',
    building: 'Main Building',
    capacity: 40,
    type: 'classroom',
  },
  {
    id: 'room-5',
    code: 'GYM',
    name: 'Gymnasium',
    building: 'Physical Education Complex',
    capacity: 100,
    type: 'gymnasium',
  },
];

export const getRoomByName = (name: string): Room | undefined =>
  rooms.find((r) => r.name === name);

export const getRoomById = (id: string): Room | undefined =>
  rooms.find((r) => r.id === id);
