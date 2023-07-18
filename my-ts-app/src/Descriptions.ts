import { FileType, UrlData, DescriptionSchema, DescriptionsType } from "./lib/SQueryClient";


export const Descriptions = {
  user: {
    account: {
      type: String,
      ref: 'account' as const,
      //  required: true,
    },
    managerProperty: {
      type: String,
    },
    messenger: {
      type: String,
      ref: 'messenger' as const,
    }
  },
  post: {
    message: {
      type: String,
      ref: 'message' as const,
      required: true as const,
    },
    like: [{
      type: String,
      required: true as const,
    }],
    comments: [{
      type: String,
      ref: "post" as const,
      required: true as const,
    }],
  },
  message: {
    account: {
      type: String,
      ref: 'account' as const,
      //strictAlien: true,
    },
    text: {
      type: String
    },
    files: {
      type: String,
      file: {}
      //checkout:true,
    },
    targets: [{
      type: String,
      ref: 'user' as const,/////

    }]
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
    }
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
      ref: 'address' as const,
      required: true as const
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
    bool: {
      type: Boolean,
    },
    num: {
      type: Number,
    },
    int: {
      type: BigInt,
    },
    arrSimple: [{
      type: Boolean,
    }],
    arrFile: [{
      type: String,
      file: {

      }
    }],
    arrRef: [{
      type: String,
      ref: 'profile' as const,
    }],
    obj: [{
      type: {
        salut: String,
      }
    }]
    ,
    map: {
      type: Map,
      of: true 
    }
    ,
    map2: {
      type: Map,
      of: ''
    }
  },
  activity: {
    poster: {
      type: String,
      ref: 'profile' as const,
      required: true as const,
    },
    channel: {
      type: String,
      ref: 'channel' as const,
    },
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
    }]
  },
  messenger: {
    listDiscussion: [
      {
        type: String,
        ref: 'discussion' as const,
      },
    ],
    archives: [
      {
        type: String,
        ref: 'channel' as const,
      },
    ],
  },
  address: {
    location: {
      type: String,
    },
    quarter: {
      type: String,
      ref: 'quarter' as const,
    },
    building: {
      type: String,
      ref: 'building' as const,
    },
    room: {
      type: String,
      required: true as const,
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
    Thread: {
      type: String,
      ref: 'channel' as const,
      //alien: true,
    },
  },
  channel: {
    name: {
      type: String,
      required: true as const,
    },

    firstUser: {
      type: String,
      ref: 'user' as const,
      // strictAlien: true,
    },
    description: {
      type: String,
    },
    vectors: [{
      type: String,
      ref: 'post' as const,
    }],
    users: [{
      type: String,
      ref: 'user' as const,
    }]
  },
  discussion: {
    receiver: {
      type: String,
      ref: 'account' as const,
      // strictAlien: true,
    },
    sender: {
      type: String,
      ref: 'account' as const,
      // strictAlien: true,
    },
    channel: {
      type: String,
      ref: 'channel' as const,
      // strictAlien: true,
    },
  },
  entreprisemanager: {
    account: {
      type: String,
      ref: 'account' as const,
      //  required: true,
    },
    entreprise: {
      type: String,
      ref: 'entreprise' as const,
      // strictAlien: true,
    }
  },

  entreprise: {
    managers: [{
      type: String,
      //ref: ConstructionManagerModel.modelName,
      ref: 'manager',
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
  },
  quarter: {
    name: {
      type: String
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
    }]
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
  },
  app:{
    entreprises: [{
      type:String,
      ref: 'entreprise' as const,
    }],
    admins:[{
      type:String,
      ref:'admin' as const,
    }]
  },
  supervisor:{
    account: {
      type: String,
      ref: 'account' as const,
      required: true,
    },
    messenger: { 
      type:String,
      ref: 'essenger' as const,
    },
    entreprise: {
      type: String,
      ref: 'entreprise' as const,
    }
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
    }]
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
    },

  },
  padiezd: {

  }

} satisfies DescriptionsType;

const Controller = {
  login: {
    login: {
      modelPath: '',
      id: '',
    },
    signup: {
      modelPath: '',
      id: '',
    },
  }
}
type CacheType = {
  [kek in keyof typeof Descriptions]: any
}
export const CacheValues = {
  messenger: {
    _id: '',
    discussions: []
  } as MessengerInterface,
  entreprise: {
    _id: '',
    $id: '',
    address: '',
    creationDate: 0,
    email: '',
    name: '',
    managers: [],
    profile: '',
    quarters: [],
    telephone: [],
    webPageUrl: ''
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
  } as AccountInterface,
  manager: {
    _id: ''
  } as ManagerInterface,
  profile: {
    _id: '',
    imgProfile: [],
    banner: [],
    message: '',
  } as ProfileInterface,
  address: {
    _id: '',
    location: "",
    room: 0,
    padiezd: 0,
    etage: 0,
    description: "",
    city: "",
  } as AddressInterface,
  activity: {

  } as ActivityInterface,
  building: {
    _id: '',
    name: '',
    city: '',
    padiezdList: [],
  } as BuildingInterface,
  channel: {

  } as ChannelInterface,
  discussion: {

  } as DiscussionInterface,
  entreprisemanager: {
    _id: '',
    $id: '',
    managers: [],
    quarters: [],
    address: '',
    name: '',
    telephone: [],
    email: '',
    webPageUrl: '',
    profile: '',
    creationDate: 0
  } as EntrepriseInterface,
  favorites: {

  } as FavoritesInterface,
  message: {

  } as MessengerInterface,
  post: {
    _id:'',
    message:''
  } as PostInterface,
  user: {
    _id: '',
    account: '',
    messenger: '',
    entreprise: '',
  } as UserInterface,
  admin:{

  } as AdminInterface,
  app:{

  } as AppInterface,
  padiezd:{
    _id: '',
    number: 0,
    users: [],
    channel: [],
  } as PadiezdInterface,
  quarter:{
    _id: '',
    name: '',
    city: '',
    buildings: [],
    supervisor: [],
    Thread: [],
    activities: []
  } as QuarterInterface,
  supervisor:{

  } as SupervisorInterface
} satisfies CacheType

export interface SupervisorInterface {

}
export interface AppInterface {

}
export interface AdminInterface {

}
export interface PostInterface {

}
export interface FavoritesInterface {

}
export interface DiscussionInterface {

}
export interface ChannelInterface {

}
export interface ActivityInterface {

}
export interface MessengerInterface {
  _id: string,
  discussions: string[]
}

export interface ProfileInterface {
  _id: string,
  imgProfile: (FileType | UrlData)[],
  banner: (FileType | UrlData)[],
  message: string,
}
export interface AddressInterface {
  _id: string,
  location: string
  room: number,
  padiezd: number,
  etage: number,
  description: string,
  city: string,
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
  creationDate: number
}
export interface ManagerInterface {
  _id: string
}
export interface BuildingInterface {
  _id: string,
  name: string,
  city: string,
  padiezdList: string[],
}
export interface QuarterInterface {
  _id: string,
  name: string,
  city: string,
  buildings: string[],
  supervisor: string[],
  Thread: string[],
  activities: string[]
}
export interface PadiezdInterface {
  _id: string,
  number: number,
  users: string[],
  channel: string[],
}
export interface UserInterface {
  _id: string,
  account: string,
  messenger: string,
  entreprise: string,
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
}
export type ModelSchema<K extends keyof typeof Descriptions> = typeof Descriptions[K];

//export type ModelCache<K extends keyof typeof Descriptions> = typeof Cache[K];