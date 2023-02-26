export const load = {
  article: {
    create: {
      name: "IPHONE 14",
      stock: 12,
      description: "le plus simple des laler",
      price: 23000,
    },
    read: { id: "", key: "" },
    delete: { id: "", key: "" },
    update: {
      id: "",
      name: "IPHONE 14",
      stock: 12,
      description: "le plus simple des laler",
      price: 23000,
    },
  },
  user: {
    create: {
      account: {
        name: 'baron',
        email: "azert@gmail.com",
        password: "azert",
        telephone: "12345678",
        status: 'property',
        address: {
          location: "l:567455;h45678654",
          building: {
            name: 'Sublymus E45',
            city: 'Rostov-On-Don',
          },
          room: 45,
          door: 296,
          etage: 4,
          description: "je suis ici",
        },
        profile: {
          imgProfile: 'http://www.ert.fr/fgiurr85o28t5.img',
          banner: 'http://www.ert.fr/fgiurr85o28t5.img',
          message: "*** BEST ****",
        },
        createdDate: Date.now() - 1_000_000_000 + parseInt(Math.random() * 1_000_000_000),
      },
    },
    read: {
      id: "",
      __key: "",
    },
    delete: {
      id: "",
      __key: "",
    },
  },
  account: {
    read: { id: "", __key: "" },
    update: {
      id: "",
      __key: "",

      name: "baron",
      email: "azert@gmail.com",
      password: "azert",
      telephone: "12345678",
      address: {
        location: "l:567455;h45678654",
        home: "ville",
        description: "je suis ici",
      },
      favorites: {
        folders: [
          {
            folderName: "wena",
          },
        ],
      },
      profile: {
        imgProfile: "http://www.ert.fr/fgiurr85o28t5.img",
        banner: "http://www.ert.fr/fgiurr85o28t5.img",
        message: "*** BEST ****",
      },
    },
  },
  profile: {
    read: { id: "", __key: "" },
    update: {
      id: "",
      __key: "",
      imgProfile: "http://www.ert.fr/fgiurr85o28t5.img",
      banner: "http://www.ert.fr/fgiurr85o28t5.img",
      message: "*** BEST ****",
    },
  },
  address: {
    read: { id: "", __key: "" },
    update: {
      id: "",
      __key: "",
      location: "l:567455;h45678654",
      home: "ville",
      description: "je suis ici",
    },
  },
  favorites: {
    read: { id: "", __key: "" },
    update: {
      id: "",
      __key: "",
      folders: [
        {
          folderName: "wena",
        },
      ],
    },
  },
  folder: {
    create: { folderName: "", __key: "" },
    read: { id: "", __key: "" },
    update: {
      id: "",
      __key: "",
      folderName: "",
    },
    delete: { id: "", __key: "" },
  },
  login: {
    email: "azert@gmail.com",
    password: "azert",
  },
  ["server-model"]: {
    create: {
      modelPath: "account",
    },
  },
};
