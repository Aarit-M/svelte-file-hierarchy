/**
 * @typedef {Object} Container
 * @property {Location} containerLocation
 * @property {string} containerName
 */

export interface Container {
    containerLocation: Location;
    containerName: string;
    additionalContainers?: Container[];
    items?: Item[];
    isOpen?: boolean;  // For tracking accordion state
    hasInfo?: boolean;  // Add this property
}

export interface Item {
    itemName: string;
    itemLocation: Location;
    itemMeasurements?: Measurements;
}

export interface Measurements {
    unit: string;
    size: number;
}

export interface Location {
    path: string;
    image: string;
}

export const fileData: Container[] = [
  {
    containerName: "Trailers",
    containerLocation: { path: "/Trailers", image: "trailers.png" },
    additionalContainers: [
      {
        containerName: "Rooms",
        containerLocation: { path: "/Rooms", image: "rooms.png" },
        additionalContainers: [
          {
            containerName: "AV Room",
            containerLocation: { path: "/Rooms/AV Room", image: "av_room.png" }
          },
          {
            containerName: "May's Room",
            containerLocation: { path: "/Rooms/May's Room", image: "may_room.png" }
          },
          {
            containerName: "Kearny's Room",
            containerLocation: { path: "/Rooms/Kearny's Room", image: "kearny_room.png" },
            additionalContainers: [
              {
                containerName: "Kearny's Desk",
                containerLocation: { path: "/Rooms/Kearny's Room/Kearny's Desk", image: "desk.png" },
                hasInfo: true
              },
              {
                containerName: "Back Corner Shelf",
                containerLocation: { path: "/Rooms/Kearny's Room/Back Corner Shelf", image: "shelf.png" },
                hasInfo: true
              },
              {
                containerName: "Big Cabinet",
                containerLocation: { path: "/Rooms/Kearny's Room/Big Cabinet", image: "big_cabinet.png" },
                additionalContainers: [
                  {
                    containerName: "Box 1",
                    containerLocation: { path: "/Rooms/Kearny's Room/Big Cabinet/Box 1", image: "box.png" },
                    hasInfo: true
                  },
                  {
                    containerName: "Box 2",
                    containerLocation: { path: "/Rooms/Kearny's Room/Big Cabinet/Box 2", image: "box.png" },
                    hasInfo: true
                  },
                  {
                    containerName: "Box 3",
                    containerLocation: { path: "/Rooms/Kearny's Room/Big Cabinet/Box 3", image: "box.png" }
                  }
                ]
              },
              {
                containerName: "Small Cabinet",
                containerLocation: { path: "/Rooms/Kearny's Room/Small Cabinet", image: "small_cabinet.png" },
                hasInfo: true,
                additionalContainers: [
                  {
                    containerName: "Box 1",
                    containerLocation: { path: "/Rooms/Kearny's Room/Small Cabinet/Box 1", image: "box.png" },
                    hasInfo: true
                  },
                  {
                    containerName: "Box 2",
                    containerLocation: { path: "/Rooms/Kearny's Room/Small Cabinet/Box 2", image: "box.png" }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
  