import createSQueryFrom, { FileType, UrlData, DescriptionsType, ControllerType } from "./lib/SQueryClient";



export const Controller = {
    messenger: {
        createDiscussion: {
            send: {
                receiverAccountId: ''
            },
            receive: ''
        },
        joinDiscussion: {
            send: {
                discussionId: ''
            },
            receive: ''
        },
        closeDiscussion: {
            send: {
                discussionId: ''
            },
            receive: ''
        },
    },
    transaction: {
        list: {
            send: {
                discussionId: {}
            },
            receive: {} as TransactionInterface[]
        },
        addDiscussion: {
            send: {
                managerFile: {},
                id: ''
            },
            receive: ''
        },
        end: {
            send: {
                managerFile: {},
                id: ''
            },
            receive: {} as TransactionInterface
        },
        join: {
            send: {
                id: ''
            },
            receive: ''
        },
        run: {
            send: {},
            receive: ''
        },
        full: {
            send: {
                id: ''
            },
            receive: ''
        },
        start: {
            send: {
                id: ''
            },
            receive: ''
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
    server: {
        disconnection: {
            send: {},
            receive: '',
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
    }

} satisfies ControllerType;

export const Descriptions = {
    account: {
        name: {
            type: String,
            required: true,
        },
        carte: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        telephone: {
            type: String,
            required: true,
        },
        imgProfile: [{
            type: String,
            file: {
                size: [1, 1e8],
                length: [0, 4],
            }
        }],
        _id:{
            type:String
        },
        __createdAt: {
            type:Number
        },
        __updatedAt:  {
            type:Number
        },
    },
    agence: {
        name: {
            type: String
        },
        icon: {
            type: String,
        },
        number: {
            type: String,
        },
        managerName: {
            type: String
        },
        charge: {
            type: Number,
        },
        _id:{
            type:String
        },
        __createdAt: {
            type:Number
        },
        __updatedAt:  {
            type:Number
        },
    },
    country: {
        icon: {
            type: String,
        },
        name: {
            type: String,
        },
        allowCarte: {
            type: Boolean,
        },
        indicatif: {
            type: String,
        },
        digit: {
            type: String,
        },
        currency: { type: String },
        agencies: [{
            type: String,
            ref: 'agence' as const,
        }],
        _id:{
            type:String
        },
        __createdAt: {
            type:Number
        },
        __updatedAt:  {
            type:Number
        },
    },
    discussion: {
        manager: {
            type: String,
            ref: 'account' as const,
            strictAlien: true as const,
        },
        client: {
            type: String,
            ref: 'account' as const,
            strictAlien: true as const,
        },
        messages: [{
            type: String,
            ref: 'message' as const
        }],
        closed: {
            type: Boolean,
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
    entreprise: {
        newTransactions: [{
            type: String,
            ref: 'transaction' as const,
            strictAlien: true as const,
        }],
        managers: [{
            type: String,
            ref: 'manager' as const,
        }],

        users: [
            {
                type: String,
                ref: 'user' as const,
            },
        ],
        rates: {
            type: Map,
            //@ts-ignore
            of: 0,
        },
        serviceCharge: {
            type: Number,
        },
        countries: [
            {
                type: String,
                ref: 'country' as const,
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
    user: {
        account: {
            type: String,
            ref: 'account' as const,
        },
        transactions: [
            {
                type: String,
                ref: 'transaction' as const,
            },
        ],
        messenger: {
            type: String,
            ref: 'messenger' as const,
        },
        preference: {
            type: String,
            ref: 'userPreference' as const,
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
    userPreference: {
        nigthMode: {
            type: Boolean,
        },
        currentDevise: {
            type: String,
        },
        Language: {
            type: String,
        },
        watcthDifference: {
            type: String,
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
    manager: {
        account: {
            type: String,
            ref: 'account' as const,
        },
        transactions: [
            {
                type: String,
                ref: 'transaction' as const,
            },
        ],
        messenger: {
            type: String,
            ref: 'messenger' as const,
        },
        preference: {
            type: String,
            ref: 'userPreference' as const,
        },
        entreprise: {
            type: String,
            ref: 'entreprise' as const,
        },
        currentDiscussions: [{
            type: String,
            ref: 'discussion' as const,
            strictAlien: true,
        }],
        lastDiscussions: [{
            type: String,
            ref: 'discussion' as const,
            strictAlien: true,
        }],
        managerTransactions: [{
            type: String,
            ref: 'transaction' as const,
            strictAlien: true as const,
        }],
        managerPreference: {
            type: String,
            ref: 'managerPreference' as const,
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
        opened: [{
            type: String,
            ref: 'discussion' as const,
        }],
        closed: [
            {
                type: String,
                ref: 'discussion' as const,
                strictAlien: true as const,
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
    transaction: {
        senderAccount: {
            type: String,
            ref: 'account' as const,
            strictAlien: true as const,
        },
        country: {
            type: String,
            ref: 'country' as const,
            strictAlien: true as const,
        },

        telephone: {
            type: String,
        },
        carte: {
            type: String,
        },
        agenceReceiver: {
            type: String,
            ref: "agence" as const,
            strictAlien: true as const,
        },
        agenceSender: {
            type: String,
            ref: "agence" as const,
            strictAlien: true as const,
        },
        typeTransaction: {
            type: String,
        },
        codePromo: {
            type: String,
        },
        receiverName: {
            type: String
        },
        received: {
            type: {
                value: Number,
                currency: String,
            }
        },
        sent: {
            type: {
                value: Number,
                currency: String,
            }
        },
        senderFile: [
            {
                type: String,
                file: {
                    length: [0, 4],
                    size: [1, 4e7],
                }
            },
        ],
        manager: {
            type: String,
            ref: 'account' as const,
            strictAlien: true as const,
        },
        managerFile: [
            {
                type: String,
                file: {
                    length: [0, 4],
                    size: [0, 4e7]
                }
            },
        ],

        discussion: {
            type: String,
            ref: 'discussion' as const,
        },
        status: {
            type: String
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
    }
} satisfies DescriptionsType;


type CacheType = {
    [kek in keyof typeof Descriptions]: any
}
export const CacheValues = {
    account: {
        name: '',
        password: '',
        telephone: '',
        carte: '',
        imgProfile: [],
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as AccountInterface,
    agence: {
        name: '',
        icon: '',
        number: '',
        managerName: '',
        charge: '',
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as AgenceInterface,
    country: {
        icon: '',
        name: '',
        allowCarte: false,
        indicatif: '',
        digit: '',
        currency: '',
        agencies: [],
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as CountryInterface,
    discussion: {
        manager: '',
        client: '',
        messages: [],
        closed: false,
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as DiscussionInterface,
    entreprise: {
        newTransactions: [],
        managers: [],
        users: [],
        rates: new Map(),
        serviceCharge: 0,
        countries: [],
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as EntrepriseInterface,
    user: {
        account: '',
        transactions: [],
        messenger: '',
        preference: '',
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as UserInterface,
    userPreference: {
        nigthMode: false,
        currentDevise: '',
        Language: '',
        watcthDifference: '',
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as UserPreferenceInterface,
    manager: {
        account: '',
        transactions: [],
        messenger: '',
        preference: '',
        entreprise: '',
        currentDiscussions: [],
        lastDiscussions: [],
        managerTransactions: [],
        managerPreference: '',
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as ManagerInterface,
    message: {
        account: '',
        files: [],
        text: '',
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as MessageInterface,
    messenger: {
        opened: [],
        closed: [],
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as MessengerInterface,
    transaction: {
        senderAccount: '',
        country: '',
        telephone: '',
        carte: '',
        agenceReceiver: '',
        agenceSender: '',
        typeTransaction: '',
        codePromo: '',
        receiverName: '',
        received: {
            value: 0,
            currency: '',
        },
        sent: {
            value: 0,
            currency: '',
        },
        senderFile: [],
        manager: '',
        managerFile: [],
        discussion: '',
        status: '',
        _id: '',
        __createdAt: 0,
        __updatedAt: 0,
    } as TransactionInterface
} satisfies CacheType

export interface AccountInterface {
    name: string,
    password: string,
    telephone: string,
    carte: string,
    imgProfile: UrlData[],
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface AgenceInterface {
    name: string,
    icon: string,
    number: string,
    managerName: string,
    charge: string,
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface CountryInterface {
    icon: string,
    name: string,
    allowCarte: boolean,
    indicatif: string,
    digit: string,
    currency: string,
    agencies: string[],
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface DiscussionInterface {
    manager: string,
    client: string,
    messages: string[],
    closed: boolean,
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface EntrepriseInterface {
    newTransactions: string[],
    managers: string[],
    users: string[],
    rates: Map<string, number>,
    serviceCharge: number,
    countries: [],
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}

export interface UserInterface {
    account: string,
    transactions: string[],
    messenger: string,
    preference: string,
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface ManagerInterface {
    account: string,
    transactions: string[],
    messenger: string,
    preference: string,
    entreprise: string,
    currentDiscussions: string[],
    lastDiscussions: string[],
    managerTransactions: string[],
    managerPreference: string,
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface UserPreferenceInterface {
    nigthMode: boolean,
    currentDevise: string,
    Language: string,
    watcthDifference: string,
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface MessageInterface {
    account: string,
    text: string,
    files: (FileType | UrlData)[],
    _id: string,
    __createdAt: 0,
    __updatedAt: 0,
}
export interface MessengerInterface {
    opened: string[],
    closed: string[],
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}
export interface TransactionInterface {
    senderAccount: string,
    country: string,
    telephone: string,
    carte: string,
    agenceReceiver: string,
    agenceSender: string,
    typeTransaction: string,
    codePromo: string,
    receiverName: string,
    received: {
        value: number,
        currency: string,
    },
    sent: {
        value: number,
        currency: string,
    },
    senderFile: string[],
    manager: string,
    managerFile: string[],
    discussion: string,
    status: string,
    _id: string,
    __createdAt: number,
    __updatedAt: number,
}

export const SQuery2 = createSQueryFrom('http://localhost:3500', Descriptions, CacheValues, Controller);