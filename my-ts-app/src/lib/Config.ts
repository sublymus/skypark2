export const Config = {
  dataStore: {
    useStore: true,
    updateTimeOut: 500,
    setData: async (key: string, data: any) => {},
    getData: async (key: string): Promise<any> => {
      return null;
    },
  },
};
