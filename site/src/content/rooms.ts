// The room types as set up in BookingCenter. `code` is its room_type value. `name` follows its heading,
// except room 04, which isn't called "tiny" here. No prices: those change by date and come from BookingCenter.
export type RoomType = {
  code: string;
  name: string;
  line: string;
  sleeps: number;
  dogFriendly?: boolean;
  accessible?: boolean;
  photo: string | null;
};

const bcPhoto = (file: string) => `https://images.bookingcenter.com/RIVERR/images/${file}.jpg`;

export const roomTypes: RoomType[] = [
  { code: 'RIVDD', name: '2 Queen beds, balcony over river', line: 'Two Queen beds and a balcony over the river.', sleeps: 4, photo: bcPhoto('23237') },
  { code: 'RIVQ', name: 'Cal King bed, balcony over river', line: 'A California King bed and a balcony over the river.', sleeps: 2, photo: bcPhoto('34447') },
  { code: 'KVIEW', name: 'Cal King bed, balcony over patio', line: 'A California King bed and a balcony over the patio, with a partial river view.', sleeps: 2, photo: bcPhoto('34453') },
  { code: 'KDVIEW', name: 'King bed, deck on terrace', line: 'One King bed and a deck on the terrace.', sleeps: 2, dogFriendly: true, photo: bcPhoto('34468') },
  { code: '2Q', name: '2 Queen beds, over patio', line: 'Two Queen beds on the second floor, over the patio.', sleeps: 4, dogFriendly: true, photo: bcPhoto('34437') },
  { code: 'K', name: 'King bed, over patio', line: 'One King bed on the second floor, over the patio. Possible noise from the bar and restaurant during business hours.', sleeps: 2, dogFriendly: true, photo: bcPhoto('34418') },
  { code: 'GFK', name: 'King bed, ground floor', line: 'One King bed on the ground floor, between the parking lot and patio.', sleeps: 2, photo: bcPhoto('34429') },
  { code: 'ADA', name: 'King bed, ground floor ADA', line: 'One King bed on the ground floor, between the parking lot and patio.', sleeps: 2, dogFriendly: true, accessible: true, photo: bcPhoto('34424') },
  { code: 'BVIEW', name: 'Queen bed, over kitchen w/ river view', line: 'One Queen bed over the bar and kitchen, discounted for possible noise during business hours.', sleeps: 2, photo: null },
  { code: 'BQ', name: 'King bed, located over bar', line: 'One King bed over the bar and kitchen, discounted for possible noise during business hours.', sleeps: 2, photo: bcPhoto('34477') },
  { code: 'BTINY', name: 'Queen bed, budget room', line: 'A cozy ground-floor room with one Queen bed, facing the parking lot.', sleeps: 2, dogFriendly: true, photo: bcPhoto('34433') },
];
