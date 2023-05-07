import { ContextSchema } from "./Context";

export function accessValidator(
    ctx: ContextSchema,
    access:
      | "public"
      | "share"
      | "admin"
      | "secret"
      | "private"
      | "default"
      | undefined,
    type: "controller" | "property",
    isUser?: boolean,
    property?:string
  ) {
    let valid = false;
    const accessMap = {
      controller: {
        create: {
          public: ["user", "admin", "any"],
          share: ["admin"],
          admin: ["admin"],
          secret: ["admin"],
        },
        read: {
          public: ["user", "admin", "any"],
          share: ["user", "admin"],
          admin: ["user", "admin"],
          secret: ["admin"],
        },
        list: {
          public: ["user", "admin", "any"],
          share: ["user", "admin"],
          admin: ["user", "admin"],
          secret: ["admin"],
        },
        update: {
          public: ["user", "admin", "any"],
          share: ["user", "admin"],
          admin: ["admin"],
          secret: ["admin"],
        },
        delete: {
          public: ["user", "admin", "any"],
          share: ["admin"],
          admin: ["admin"],
          secret: ["admin"],
        },
      },
      property: {
        read: {
          public: ["any", "user", "admin"],
          default: ["any", "user", "admin"],
          private: ["user", "admin"],
          admin: ["any", "user", "admin"],
          secret: ["admin"],
        },
        list: {
          public: ["any", "user", "admin"],
          default: ["any", "user", "admin"],
          private: ["user", "admin"],
          admin: ["any", "user", "admin"],
          secret: ["admin"],
        },
        update: {
          public: ["any", "user", "admin"],
          default: ["user", "admin"],
          private: ["user", "admin"],
          admin: ["admin"],
          secret: ["admin"],
        },
      },
    };
    let service = ctx.service;

    if (service == "store") service = "create";
    else if (service == "destroy") service = "delete";

    if (type == "controller" && access == undefined) access = "public";
    if (type == "controller" && access == "private") access = "secret";
    if (type == "property" && access == undefined) access = "default";
    if (type == "property" && access == "share") access = "public";
  
    let permission = ctx.__permission||'any';
    
    permission = permission.startsWith("user:") ? "user" : permission;
    if (permission == "user") {
      permission = isUser ? "user" : "any";
    }
  
    valid = accessMap[type]?.[service]?.[access].includes(permission);
  
    return valid;
  }
  