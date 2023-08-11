import { UrlData, DescriptionsType, ControllerType } from "./lib/SQueryClient";

export const Controller = {
  messenger: {
    createDiscussion: {
      send: {
        receiverAccountId: ''
      },
      receive: {
        id: '',
        modelPath: ''
      }
    },
    removeDiscussion: {
      send: {
        discussionId: ''
      },
      receive: 0
    }
  },
  login: {
    user: {
      send: {
        email: '',
        password: '',
      },
      receive: {
        login: {
          modelPath: 'account' as const,
          id: '',
        },
        signup: {
          modelPath: 'user' as const,
          id: '',
        },
      }
    },
    manager: {
      send: {
        email: '',
        password: '',
      },
      receive: {
        login: {
          modelPath: 'account' as const,
          id: '',
        },
        signup: {
          modelPath: 'manager' as const,
          id: '',
        },
      }
    },
    admin: {
      send: {
        email: '',
        password: '',
      },
      receive: {
        login: {
          modelPath: 'account' as const,
          id: '',
        },
        signup: {
          modelPath: 'admin' as const,
          id: '',
        },
      }
    }
  },
  signup: {
    user: {
      send: 'create_user' as const,
      receive: ''
    },
    manager: {
      send: 'create_manager' as const,
      receive: ''
    },
    admin: {
      send: 'create_admin' as const,
      receive: ''
    }
  },
  app: {
    userList: {
      send: {
        quarterId: ''
      },
      receive: {} as AccountInterface[]
    },
    padiezdList: {
      send: {
        quarterId: ''
      },
      receive: {} as PadiezdInterface[]
    },
    buildingList: {
      send: {
        quarterId: ''
      },
      receive: {} as BuildingInterface[]
    },
  },
  client: {
    firstConnect: {
      send: {
        quarterId: ''
      },
      receive: {} as BuildingInterface[]
    },
    create: {
      send: {
        entrepriseId: '',
        name: '',
        email: '',
        telephone: '',
        room: 0,
        etage: 0,
        lastName: '',
        padiezd: '',
        quarterId: '',
        status: ''

      },
      receive: {} as BuildingInterface[]
    }
  },
  server: {
    disconnection: {
      send: {},
      receive: true,
    },
    currentClient: {
      send: {},
      receive: {
        login: {
          modelPath: '',
          id: '',
        },
        signup: {
          modelPath: '',
          id: '',
        },
      },
    },
    
  },
  profile: {
    read: {
      send: {
        id:''
      },
      receive: {} as ProfileInterface,
    }
  }
} satisfies ControllerType;
export const Descriptions = {
  test: {
    simpleArray: [{
      type: Number
    }],
    fileArray: [{
      type: String,
      file: {}
    }],
    bigint: {
      type: String,
    },
    bool: {
      type: Boolean,
    },
    str: {
      type: String,
    },
    num: {
      type: Number,
    },
    stringMap: {
      type: Map,
      of: ''
    },
    numberMap: {
      type: Map,
      of: 0
    },
    ojectData: {
      type: { salut: '', famille: '', nombreuse: 0 },
    },
    refArray_of_test: [{
      type: String,
      ref: 'test' as const,
      alien: true,
    }],
    ref_of_test: {
      type: String,
      ref: 'test' as const,
      strictAlien: true as const
    },
    // _id: {
    //   type: String
    // },
    // __createdAt: {
    //   type: Number
    // },
    // __updatedAt: {
    //   type: Number
    // },

  },
  user: {
    account: {
      type: String,
      ref: 'account' as const,
      required: true,
    },
    messenger: {
      type: String,
      ref: 'messenger' as const,
    },
    entreprise: {
      type: String,
      ref: 'entreprise' as const,
      strictAlien: true
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  post: {
    statPost:{
      type: {
        likes: Number,
        comments: Number,
        shares: Number
      }
    },
    message: {
      type: String,
      ref: 'message' as const,
      required: true as const,
    },
    comments: [{
      type: String,
      ref: "post" as const,
      required: true as const,
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  message: {
    account: {
      type: String,
      ref: 'account' as const,
      strictAlien: true as const,
    },
    text: {
      type: String
    },
    files: [{
      type: String,
      file: {}
      //checkout:true,
    }],
    targets: [{
      type: String,
      ref: 'user' as const,/////
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  manager: {
    account: {
      type: String,
      ref: 'account' as const,
      required: true as const,
    },
    managerProperty: {
      type: String,
    },

    messenger: {
      type: String,
      ref: 'messenger' as const,
    },
    entreprise: {
      type: String,
      ref: 'entreprise' as const,
      strictAlien: true
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  account: {
    name: {
      type: String,
      required: true as const,
    },
    email: {
      type: String,
      required: true as const,
    },
    userTarg: {
      type: String,
    },
    status: {
      type: String,
    },
    password: {
      type: String,
      required: true as const,
    },
    telephone: {
      type: String,
      required: true as const
    },
    address: {
      type: String,
      ref: 'address' as const
    },
    profile: {
      type: String,
      ref: 'profile' as const,
      required: true as const
    },
    favorites: {
      type: String,
      ref: 'favorites' as const,
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  activity: {
    poster: {
      type: String,
      ref: 'profile' as const,
      required: true as const,
    },
    channel: [{
      type: String,
      ref: 'post' as const,
    }],
    name: {
      type: String,
      required: true as const,
    },
    description: {
      type: String,
    },
    icon: [{
      type: String,
      required: true as const,
      file: {}
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  messenger: {
    listDiscussion: [
      {
        type: String,
        ref: 'discussion' as const,
        alien: true as const,
      },
    ],
    archives: [
      {
        type: String,
        ref: 'discussion' as const,
        alien: true as const,
      },
    ],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  address: {
    location: {
      type: String,
    },
    quarter: {
      type: String,
      ref: 'quarter' as const,
      strictAlien: true as const,
    },
    building: {
      type: String,
      ref: 'building' as const,
      strictAlien: true as const,
    },
    room: {
      type: String,
      required: true as const,
    },
    padiezd: {
      type: String,
      ref: 'padiezd' as const,
      strictAlien: true as const,
    },
    city: {
      type: String,
      required: true as const,
    },
    door: {
      type: String,
      required: true as const,
    },
    etage: {
      type: String,
      required: true as const,
    },
    description: {
      type: String,
      required: true as const,
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  building: {
    name: {
      type: String,
      required: true as const,
    },
    city: {
      type: String
    },
    users: [{
      type: String,
      ref: "user" as const,
      //strictAlien: true,
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  discussion: {
    members: [{
      type: String,
      ref: 'account' as const,
      required: true as const,
      strictAlien: true as const,
    }],
    account1: {
      type: String,
      ref: 'account' as const,
      strictAlien: true as const,
    },
    account2: {
      type: String,
      ref: 'account' as const,
      strictAlien: true as const,
    },

    isGroup: {
      type: Boolean,
      required: true as const,
    },
    channel: [{
      type: String,
      ref: 'message' as const,
      required: true as const
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },

  entreprise: {
    managers: [{
      type: String,
      //ref: ConstructionManagerModel.modelName,
      ref: 'manager' as const,
      // strictAlien: true,
    }],
    quarters: [{
      type: String,
      ref: 'quarter' as const,
      // strictAlien: true,
    }],
    address: {
      type: String,
      ref: 'adrress' as const,
    },
    telephone: [{
      type: Number,
    }],
    email: {
      type: String,
    },
    name: {
      type: String
    },
    webPageUrl: {
      type: String,
    },
    profile: {
      type: String,
      ref: 'profile' as const,
    },
    creationDate: {
      type: Date,
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  quarter: {
    name: {
      type: String,
      required: true as const
    },
    city: {
      type: String,
      required: true as const,
    },
    buildings: [{
      type: String,
      ref: 'building' as const,
    }],
    supervisor: [{
      type: String,
      ref: 'supervisor' as const
    }],
    Thread: [{
      type: String,
      ref: 'post' as const,
    }],
    activities: [{
      type: String,
      ref: 'activity' as const,
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  admin: {
    app: {
      type: String,
      ref: 'app' as const,
    },
    email: {
      type: String,
      required: true as const,
    },
    password: {
      type: String,
      required: true as const,
    },
    key: {
      type: String,
      required: true as const
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  app: {
    entreprises: [{
      type: String,
      ref: 'entreprise' as const,
    }],
    admins: [{
      type: String,
      ref: 'admin' as const,
    }]
  },
  supervisor: {
    account: {
      type: String,
      ref: 'account' as const,
      required: true as const,
    },
    messenger: {
      type: String,
      ref: 'messenger' as const,
    },
    entreprise: {
      type: String,
      ref: 'entreprise' as const,
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  favorites: {
    folders: [{
      type: String,
      ref: 'folder' as const,
      //impact: true,
      //access: "public",
      //: true,
    }],
    likeList: [{
      type: String,
      ref: 'user' as const,
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  },
  profile: {
    imgProfile: [{
      type: String,
      file: {}
    }],

    banner: [{
      type: String,
      file: {}
    }],

    message: {
      type: String,
      required: true as const
    },
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },

  },
  padiezd: {
    number: {
      type: Number,
      required: true as const,
    },
    users: [{
      type: String,
      ref: "user" as const,
      alien: true as const
    }],
    channel: [{
      type: String,
      ref: 'post' as const,
    }],
    _id: {
      type: String
    },
    __createdAt: {
      type: Number
    },
    __updatedAt: {
      type: Number
    },
  }

} satisfies DescriptionsType;

type CacheType = {
  [kek in keyof typeof Descriptions]: any
}
export const CacheValues = {
  messenger: {
    _id: '',
    discussions: [],
    __createdAt: 0,
    __updatedAt: 0,
  } as MessengerInterface,
  entreprise: {
    _id: '',
    address: '',
    creationDate: 0,
    email: '',
    name: '',
    managers: [],
    profile: '',
    quarters: [],
    telephone: [],
    webPageUrl: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as EntrepriseInterface,
  account: {
    _id: '',
    name: '',
    email: '',
    userTarg: '',
    status: '',
    password: '',
    telephone: '',
    address: '',
    favorites: '',
    profile: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as AccountInterface,
  manager: {
    _id: '',
    account: '',
    entreprise: '',
    messenger: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as ManagerInterface,
  profile: {
    _id: '',
    imgProfile: [],
    banner: [],
    message: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as ProfileInterface,
  address: {
    _id: '',
    location: "",
    room: 0,
    padiezd: 0,
    etage: 0,
    description: "",
    city: "",
    __createdAt: 0,
    __updatedAt: 0,
  } as AddressInterface,
  activity: {
    poster: '',
    channel: [],
    name: '',
    description: '',
    icon: [],
    _id: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as ActivityInterface,
  building: {
    _id: '',
    name: '',
    city: '',
    padiezdList: [],
    __createdAt: 0,
    __updatedAt: 0,
  } as BuildingInterface,
  discussion: {
    _id: '',
    members: [],
    account1: '',
    account2: '',
    isGroup: false,
    channel: [],
    __createdAt: 0,
    __updatedAt: 0,
  } as DiscussionInterface,
  favorites: {
    folders: [],
    likeList: [],
    _id: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as FavoritesInterface,
  message: {
    _id: '',
    account: '',
    files: [],
    targets: [],
    text: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as MessageInterface,
  post: {
    _id: '',
    message: '',
    comments: [],
    statPost:{
        likes: 0,
        comments: 0,
        shares: 0
      },
    __createdAt: 0,
    __updatedAt: 0,
  } as PostInterface,
  user: {
    _id: '',
    account: '',
    messenger: '',
    entreprise: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as UserInterface,
  admin: {
    _id: '',
    account: '',
    messenger: '',
    entreprise: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as AdminInterface,
  app: {
    _id: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as AppInterface,
  padiezd: {
    _id: '',
    number: 0,
    users: [],
    channel: [],
    __createdAt: 0,
    __updatedAt: 0,
  } as PadiezdInterface,
  quarter: {
    _id: '',
    name: '',
    city: '',
    buildings: [],
    supervisor: [],
    Thread: [],
    activities: [],
    __createdAt: 0,
    __updatedAt: 0,
  } as QuarterInterface,
  supervisor: {
    _id: '',
    account: '',
    messenger: '',
    entreprise: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as SupervisorInterface,
  test: {
    _id: '',
    simpleArray: [],
    fileArray: [],
    bigint: '',
    bool: false,
    str: '',
    num: 0,
    stringMap: new Map<string, string>(),
    numberMap: new Map<string, number>(),
    ojectData: { salut: '', famille: '', nombreuse: 0 },
    refArray_of_test: [],
    ref_of_test: '',
    __createdAt: 0,
    __updatedAt: 0,
  } as TestInterface
} satisfies CacheType
export interface TestInterface {
  simpleArray?: number[],
  fileArray?: UrlData[],
  bigint?: String,
  bool?: boolean,
  str?: string,
  num?: number
  stringMap?: Map<string, string>,
  numberMap?: Map<string, number>,
  ojectData?: { salut: string, famille: string, nombreuse: number },
  refArray_of_test?: string[],
  ref_of_test?: string,
  _id: string;
  __createdAt: number,
  __updatedAt: number,
}
export interface MessageInterface {
  account: string,
  text: string,
  files: UrlData[],
  targets: string[]
  _id: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface SupervisorInterface {
  _id: string,
  account: string,
  messenger: string,
  entreprise: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface AppInterface {
  _id: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface AdminInterface {
  _id: string,
  account: string,
  messenger: string,
  entreprise: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface PostInterface {
  _id: string,
  message: string
  statPost:{
    likes: number,
    comments: number,
    shares: number
  },
  comments: string[],
  __createdAt: number,
  __updatedAt: number,
}
export interface FavoritesInterface {
  folders: string[],
  likeList: string[],
  _id: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface DiscussionInterface {
  _id: string,
  members: string[],
  account1: string,
  account2: string,
  isGroup: boolean,
  channel: string[],
  __createdAt: number,
  __updatedAt: number,
}
export interface ActivityInterface {
  poster: string,
  channel: string[],
  name: string,
  description: string,
  icon: UrlData[],
  _id: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface MessengerInterface {
  _id: string,
  discussions: string[],
  __createdAt: number,
  __updatedAt: number,
}

export interface ProfileInterface {
  _id: string,
  imgProfile: (UrlData)[],
  banner: (UrlData)[],
  message: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface AddressInterface {
  _id: string,
  location: string
  room: number,
  padiezd: number,
  etage: number,
  description: string,
  city: string,
  __createdAt: number,
  __updatedAt: number,
}

export interface EntrepriseInterface {
  _id: string,
  managers: string[],
  quarters: string[],
  address: string,
  name: string,
  telephone: string[],
  email: string,
  webPageUrl: string,
  profile: string,
  creationDate: number,
  __createdAt: number,
  __updatedAt: number,
}
export interface ManagerInterface {
  _id: string,
  account: string,
  messenger: string,
  entreprise: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface BuildingInterface {
  _id: string,
  name: string,
  city: string,
  padiezdList: string[],
  __createdAt: number,
  __updatedAt: number,
}
export interface QuarterInterface {
  _id: string,
  name: string,
  city: string,
  buildings: string[],
  supervisor: string[],
  Thread: string[],
  activities: string[],
  __createdAt: number,
  __updatedAt: number,
}
export interface PadiezdInterface {
  _id: string,
  number: number,
  users: string[],
  channel: string[],
  __createdAt: number,
  __updatedAt: number,
}
export interface UserInterface {
  _id: string,
  account: string,
  messenger: string,
  entreprise: string,
  __createdAt: number,
  __updatedAt: number,
}
export interface AccountInterface {
  _id: string,
  name: string,
  email: string,
  userTarg: string,
  status: string,
  password: string,
  telephone: string,
  address: string,
  favorites: string,
  profile: string,
  __createdAt: number,
  __updatedAt: number,
}
export type ModelSchema<K extends keyof typeof Descriptions> = typeof Descriptions[K];

//export type ModelCache<K extends keyof typeof Descriptions> = typeof Cache[K];