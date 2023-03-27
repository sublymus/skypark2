export const load = {
  list: {
    addId: [],
    addNew: [],
    remove: [],
    paging: {
      page: 1,
      limit: 3,
      select: '',
      sort: { "createdAt": -1 },
      query: {},
    }
  },
  article: {
    create: {
      name: 'Salade',
      stock: 2,
      description: 'Plante cultivée dont on fait la salade (surtout laitues; batavias; scaroles; chicorées). Repiquer des salades.',
      views: [],
      price: 5,
      folders: [
        {
          folderName: "wena0",
        },
        {
          folderName: "wena1",
        },
        {
          folderName: "wena2",
        },
      ]
    },
    read: { id: "" },
    delete: { id: "" },
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

      my_article: {
        name: 'Salade',
        stock: 2,
        description: 'Plante cultivée dont on fait la salade (surtout laitues; batavias; scaroles; chicorées). Repiquer des salades.',
        views: [],
        price: 5,
        folders: [
          {
            folderName: "wena0",
          },
          {
            folderName: "wena1",
          },
          {
            folderName: "wena2",
          },
        ]
      },
      account: {
        name: 'baron',
        email: "sublymus@gmail.com",
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
        favorites: {
          folders: [
            {
              folderName: "wena0",
            },
            {
              folderName: "wena1",
            },
            {
              folderName: "wena2",
            },
            {
              folderName: "wena3",
            },
            {
              folderName: "wena4",
            },
            {
              folderName: "wena5",
            },
          ],
        },
        profile: {
          //imgProfile: 'http://www.ert.fr/fgiurr85o28t5.img',
          //banner: 'http://www.ert.fr/fgiurr85o28t5.img',
          message: "*** BEST ****",
        },
        createdDate: Date.now() - 1_000_000_000 + parseInt(Math.random() * 1_000_000_000),
      },
      building: {
        name: "skypark Center",
        city: "Rostov on don",
        community: {
          name: "Together Group",
          activities: [{
            poster: {
              //imgProfile: 'http://www.ert.fr/fgiurr85o28t5.img',
              //banner: 'http://www.ert.fr/fgiurr85o28t5.img',
              message: "*** BEST ****",
            },
            channel: {
              name: "Sport_Channel",
              firstWatcher: "",
              description: "more description about sport channel",
              vectors: [],
              watcher: []
            },
            name: "Sport",
            description: "we love sport"
          }]
        },
      }

    },
    read: {
      id: ""
    },
    delete: {
      id: ""
    },
  },
  building: {
    create: {
      name: "skypark Center",
      city: "Rostov on don",
      community: {
        name: "Together Group",
        activities: [{
          poster: {
            //imgProfile: 'http://www.ert.fr/fgiurr85o28t5.img',
            //banner: 'http://www.ert.fr/fgiurr85o28t5.img',
            message: "*** BEST ****",
          },
          channel: {
            name: "Sport_Channel",
            firstWatcher: "",
            description: "more description about sport channel",
            vectors: [],
            watcher: []
          },
          name: "Sport",
          description: "we love sport"
        }]
      },
    },
    read: { id: "" },
    update: {
      id: "",
      name: "skypark Center",
      city: "Rostov on don",
      community: {
        name: "Together Group",
        activities: [{
          poster: {
            //imgProfile: 'http://www.ert.fr/fgiurr85o28t5.img',
            //banner: 'http://www.ert.fr/fgiurr85o28t5.img',
            message: "*** BEST ****",
          },
          channel: {
            name: "Sport_Channel",
            firstWatcher: "",
            description: "more description about sport channel",
            vectors: [],
            watcher: []
          },
          name: "Sport",
          description: "we love sport"
        }]
      },
    },
    delete: { id: "" },
  },
  account: {
    read: { id: "" },
    update: {
      id: "",

      name: "baron",
      email: "sublymus@gmail.com",
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
    read: { id: "" },
    update: {
      id: "",
      imgProfile: "http://www.ert.fr/fgiurr85o28t5.img",
      banner: "http://www.ert.fr/fgiurr85o28t5.img",
      message: "*** BEST ****",
    },
  },
  address: {
    read: { id: "" },
    update: {
      id: "",
      location: "l:567455;h45678654",
      home: "ville",
      description: "je suis ici",
    },
  },
  favorites: {
    read: { id: "" },
    update: {
      id: "",
      folders: [
        {
          folderName: "wena",
        },
      ],
    },
  },
  folder: {
    create: { folderName: "" },
    read: { id: "" },
    update: {
      id: "",
      folderName: "",
    },
    delete: { id: "" },
  },
  post: {
    create: {
      message: {
        user: '',
        text: 'Hello Its my',
        fileList: [],
      },
      likeCount: 2098,
    },
    read: { id: "" },
    update: {
      id: "",
      folderName: "",
    },
    delete: { id: "" },
  },
  login: {
    email: "sublymus@gmail.com",
    password: "azert",
  },
  ["server-model"]: {
    create: {
      modelPath: "account",
    },
  },
};
