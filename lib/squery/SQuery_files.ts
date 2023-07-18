import Log from "sublymus_logger";
import { Config } from "./Config";
import { ContextSchema } from "./Context";
import { ModelAccessAvailable, ModelControllers, UrlDataType } from "./Initialize";
import { SQuery } from "./SQuery";
import jwt from "jsonwebtoken";

export const SQuery_files = {
    accessValidator: async (url:string ,cookie:any) => {
      let urlData: UrlDataType;
      try {
        Log('url',{url})
        if (!url) throw new Error('url is missing;');
        
        url =  url.substring(url.lastIndexOf('/') + 1).replace(url.substring(url.lastIndexOf('.')),'')
        urlData = jwt.verify(url, Config.conf.URL_KEY||'') as any;
        Log('uurlDatarl',{urlData})
        if (!urlData) throw new Error('invalid url , urlData  is missing');
        const rule = ModelControllers[urlData.modelPath]?.option?.schema.description[urlData.property];
        Log('rule',{rule})
        if (!rule || !Array.isArray(rule)) throw new Error('invalid url, rule not found');
        let access: ModelAccessAvailable;
        access = rule[0].access;
        if (rule[0].access == 'public' || rule[0].access == 'default' || rule[0].access == undefined || rule[0].access == 'admin') return urlData;
        if (!cookie || !cookie.squery_session) throw new Error('invalid cookie, cookie.squery_session is missing');
        const squery_session = JSON.parse(cookie.squery_session);
        if (!squery_session) throw new Error('invalid squery_session');
        let decoded: any = {};
        decoded = jwt.verify(squery_session, Config.conf.TOKEN_KEY||'') || {};
        const token = decoded.token
        if (!token) throw new Error('invalid token');
        const ctx: ContextSchema = {
          signup: {
            id: token.__signupId,
            modelPath: token.__signupModelPath,
          },
          login: {
            id: token.__loginId,
            modelPath: token.__loginModelPath,
          },
          ctrlName: urlData.modelPath,
          service: 'read',
          data: {
            id: urlData.id,
          },
          socket:null,
          __key: token.__key, /// pour le moment data.__key = cookies[__key]
          __permission: token.__permission || "any", ///  data.__permission = undefined
        };
  
        const res = await ModelControllers[urlData.modelPath]()['read']?.(ctx)
        if (!res?.response) throw new Error(JSON.stringify(res));
        if (!res.response[urlData.property]) throw new Error('access not allowed');
        return urlData;
  
      } catch (error:any) {
        throw new Error(error.message);
      }
    }
  }
  