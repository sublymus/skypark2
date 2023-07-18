export const load = {
  login: {
    telephone: "+79798627001",
    password: "0001",
  },
  user: {
    create: {
      account: {
        name: 'baron',
        email: 'u0@gmail.com',
        status: 'property',
        password: 'u0',
        telephone: '1234567801',
        address: {
          room: '34',
          city: 'Weston',
          padiezd: '80',
          etage: '8',
          description: 'rigth',
        },
      },
    },
  },
  admin: {
    create: {
      email: 'admin0@gmail.com',
      password: 'admin0',
    },
  },
  manager: {
    create: {
      account: {
        name: 'baron',
        email: 'm0@gmail.com',
        status: 'property',
        password: 'm0',
        telephone: '1234567801',
        address: {
          room: '34',
          city: 'Weston',
          padiezd: '80',
          etage: '8',
          description: 'rigth',
        },
      },
    },
  },
  app:{
    create: {
      entreprises:[{
        address: {
          room: '34',
          city: 'Weston',
          padiezd: '80',
          etage: '8',
          description: 'rigth',
        },
        telephone: ['+7(999)862-74-41','+7(999)832-45-09'],
        email: 'SkyPark',
        webPageUrl: 'http://www.skypark.com',
        creationDate:1688195393242,
        managers: [
          {
            account: {
              name: 'baron',
              email: 'm1@gmail.com',
              status: 'manager',
              password: 'm1',
              telephone: '1234567802',
              address: {
                room: '34',
                city: 'Weston',
                padiezd: '80',
                etage: '8',
                description: 'rigth',
              },
            }
          },
          {
            account: {
              name: 'baron',
              email: 'm2@gmail.com',
              status: 'manager',
              password: 'm2',
              telephone: '12345678',
              address: {
  
                room: '34',
                city: 'Weston',
                padiezd: '80',
                etage: '8',
                description: 'rigth',
              }
            }
          },
  
        ],
        quarters: [
          {
            name: 'RIVERA',
            city: 'Bulkari-Center',
            supervisor:[{
              account: {
                name: 'supervisor',
                email: 'supervisor@gmail.com',
                status: 'supervisor',
                password: 'supervisor',
                telephone: '12345678',
                address: {
                  room: '101',// address de l'entreprise de gestion 
                  city: 'gestion',
                  padiezd: '2',
                  etage: '8',
                  description: 'rigth',
                }
              }
            }],
            buildings: [{
              name: 'Bulkari BE1',
              city: 'Bulkari-Center',
              padiezdList: [{
                number: 1,
                users: [
                  {
                    account: {
                      name: 'baron',
                      email: 'pad1-u1@gmail.com',
                      status: 'property',
                      password: 'u1',
                      telephone: '12345678',
                      address: {
                        room: '34',
                        city: 'Weston',
                        padiezd: '80',
                        etage: '8',
                        description: 'rigth',
                      }
                    }
                  },
                  {
                    account: {
                      name: 'baron',
                      email: 'pad1-u2@gmail.com',
                      status: 'property',
                      password: 'u2',
                      telephone: '12345678',
                      address: {
                        room: '34',
                        city: 'Weston',
                        padiezd: '80',
                        etage: '8',
                        description: 'rigth',
                      }
                    }
                  },
                  {
                    account: {
                      name: 'baron',
                      email: 'pad1-u3@gmail.com',
                      status: 'property',
                      password: 'u3',
                      telephone: '12345678',
                      address: {
                        room: '34',
                        city: 'Weston',
                        padiezd: '80',
                        etage: '8',
                        description: 'rigth',
                      }
                    }
                  }
                ],
                channel: [],
              }, {
                number: 2,
                users: [
                  {
                    account: {
                      name: 'baron',
                      email: 'pad2-u1@gmail.com',
                      status: 'property',
                      password: 'u1',
                      telephone: '12345678',
                      address: {
          
                        room: '34',
                        city: 'Weston',
                        padiezd: '80',
                        etage: '8',
                        description: 'rigth',
                      }
                    }
                  },
                  {
                    account: {
                      name: 'baron',
                      email: 'pad2-u2@gmail.com',
                      status: 'property',
                      password: 'u2',
                      telephone: '12345678',
                      address: {
                        room: '34',
                        city: 'Weston',
                        padiezd: '80',
                        etage: '8',
                        description: 'rigth',
                      }
                    }
                  },
                  {
                    account: {
                      name: 'baron',
                      email: 'pad2-u3@gmail.com',
                      status: 'property',
                      password: 'u3',
                      telephone: '12345678',
                      address: {
                        room: '34',
                        city: 'Weston',
                        padiezd: '80',
                        etage: '8',
                        description: 'rigth',
                      }
                    }
                  }
                ],
                channel: [],
              }, {
                number: 3,
                users: [],
                channel: [],
              }],
  
            },{
              name: 'Bulkari BE2',
              city: 'Bulkari-Center',
              padiezdList: [{
                number: 4,
                users: [],
                channel: [],
              }, {
                number: 5,
                users: [],
                channel: [],
              }, {
                number: 6,
                users: [],
                channel: [],
              }],
            },{
              name: 'Bulkari C30',
              city: 'Bulkari-Center',
              padiezdList: [{
                number: 1,
                users: [],
                channel: [],
              }, {
                number: 2,
                users: [],
                channel: [],
              }, {
                number: 3,
                users: [],
                channel: [],
              }],
            }],
            Thread: [],
            activities: []
          }
          
        ]
      }],
      
    }
  },
  
  building: {
    name: 'Bulkari BE1',
    city: 'Bulkari-Center',
    padiezdList: [{
      number: 1,
      users: [],
      channel: [],
    }, {
      number: 2,
      users: [],
      channel: [],
    }, {
      number: 3,
      users: [],
      channel: [],
    }],
  },
  list: {
    addId: [],
    addNew: [],
    remove: [],
    paging: {
      page: 1,
      limit: 3,
      select: "",
      sort: { __createdAt: -1 },
      query: {},
    },
  },

};
